import { test, expect } from '@playwright/test';
import { adminLogin, verifierLogin, signOut, SEED, TINY_PNG } from './helpers';

test.describe.configure({ mode: 'serial' });

test('public WhatsApp-link registration creates a Pending Verification artisan', async ({ page }) => {
  await page.goto('/register');

  // language -> consent
  await page.getByTestId('reg-next').click();
  await expect(page.getByText('Consent & Information Notice')).toBeVisible();
  await page.getByTestId('reg-consent').check();
  await page.getByTestId('reg-next').click();

  // identity
  await page.getByTestId('reg-name').fill('E2E Test Artisan');
  await page.getByTestId('reg-phone').fill('9876512345');
  await page.getByTestId('reg-next').click();

  // address
  await page.getByTestId('reg-state').fill('Madhya Pradesh');
  await page.getByTestId('reg-district').fill('Dindori');
  await page.getByTestId('reg-village').fill('Karanjia');
  await page.getByTestId('reg-next').click();

  // craft
  await page.getByTestId('reg-craft').selectOption('pottery');
  await page.getByTestId('reg-next').click();

  // products (skip) -> review
  await page.getByTestId('reg-next').click();
  await page.getByTestId('reg-submit').click();

  await expect(page.getByTestId('registration-success')).toBeVisible();
  await expect(page.getByText(/Pending Verification/i)).toBeVisible();

  // Admin sees the new entry under Pending Verification.
  await adminLogin(page);
  await page.goto('/admin/registry?status=pending_verification&q=E2E');
  await expect(page.getByTestId('registry-table')).toContainText('E2E Test Artisan');
});

test('admin assigns a verifier and the verifier sees the new task', async ({ page }) => {
  await adminLogin(page);
  await page.goto(`/admin/registry/${SEED.pending}`);

  await page.getByTestId('assign-verifier').selectOption({ label: 'Sunita Marko (Verifier)' });
  await page.getByTestId('assign-submit').click();
  await expect(page.getByTestId('action-msg')).toContainText(/assigned/i);
  await expect(page.getByText('Assigned to Verifier')).toBeVisible();

  await signOut(page);
  await verifierLogin(page);
  await page.goto('/field');
  await expect(page.locator('body')).toContainText('Phoolwati Bai');
});

test('verifier completes a verification with mock GPS and a photo', async ({ page }) => {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 22.9412, longitude: 81.0784 });

  await verifierLogin(page);
  await page.goto(`/field/artisans/${SEED.assigned}/verify`);

  // consent
  await page.getByTestId('verify-consent').check();
  await page.getByTestId('verify-next').click();

  // identity + photo
  await page.getByTestId('verify-identity').check();
  await page.locator('input[type=file]').setInputFiles({ name: 'id.png', mimeType: 'image/png', buffer: TINY_PNG });
  await page.getByTestId('verify-next').click();

  // address + GPS
  await page.getByTestId('capture-gps').click();
  await expect(page.getByTestId('gps-coords')).toBeVisible();
  await page.getByTestId('verify-location').check();
  await page.getByTestId('verify-next').click();

  // craft
  await page.getByTestId('verify-craft').check();
  await page.getByTestId('verify-next').click();

  // products
  await page.getByTestId('verify-products').check();
  await page.getByTestId('verify-next').click();

  // documents
  await page.getByTestId('verify-documents').check();
  await page.getByTestId('verify-next').click();

  // decision
  await page.getByTestId('verify-decision').selectOption('verified');
  await page.getByTestId('verify-submit').click();
  await expect(page.getByTestId('verify-success')).toBeVisible({ timeout: 20000 });

  // Admin confirms the status changed and the visit shows in history.
  await signOut(page);
  await adminLogin(page);
  await page.goto(`/admin/registry/${SEED.assigned}`);
  await expect(page.getByText('Verified').first()).toBeVisible();
  await expect(page.getByTestId('verification-history')).toContainText('Sunita Marko');
});

test('admin sends a mocked WhatsApp message that is persisted', async ({ page }) => {
  await adminLogin(page);
  await page.goto('/admin/whatsapp');

  await page.getByTestId('wa-audience').selectOption(SEED.verified);
  await page.getByTestId('wa-console-template').selectOption('visit_reminder');
  await expect(page.getByTestId('wa-preview')).toContainText('verification visit');
  await page.getByTestId('wa-console-send').click();

  await expect(page.getByTestId('wa-result')).toContainText(/sent/i);
  await expect(page.getByTestId('wa-log')).toContainText('visit_reminder');
});

test('admin sees the audit trail and exports a report', async ({ page }) => {
  await adminLogin(page);

  await page.goto('/admin/audit');
  await expect(page.getByTestId('audit-table')).toBeVisible();
  await expect(page.getByTestId('audit-table')).toContainText('verification submitted');

  await page.goto('/admin/reports');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('export-csv').click(),
  ]);
  expect(download.suggestedFilename()).toContain('artisan_registry');

  // The export is itself audited.
  await page.goto('/admin/audit');
  await expect(page.getByTestId('audit-table')).toContainText('export downloaded');
});

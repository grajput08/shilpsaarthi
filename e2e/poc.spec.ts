import { test, expect } from '@playwright/test';
import { adminLogin, verifierLogin, signOut } from './helpers';

// The full required journey runs as one ordered story (shared state between tests).
test.describe.configure({ mode: 'serial' });

const ARTISAN_NAME = 'Linkflow Test Artisan';
let publicFormUrl = '';
let artisanId = '';

test('CRM admin generates a unique blank registration link (no name/phone)', async ({ page }) => {
  await adminLogin(page);
  // dashboard/registry reachable
  await expect(page.getByText('Programme Overview')).toBeVisible();

  await page.goto('/admin/links');
  await page.getByTestId('generate-link').click();
  const code = page.getByTestId('generated-link').locator('code');
  await expect(code).toBeVisible();
  publicFormUrl = ((await code.textContent()) ?? '').trim();
  expect(publicFormUrl).toContain('/a/form?id=');
});

test('public link needs no login, shows no CRM UI, and creates a Pending Verification record', async ({ page }) => {
  // visit the public link fully unauthenticated
  await page.context().clearCookies();
  await page.goto(publicFormUrl);

  expect(page.url()).toContain('/a/form');
  await expect(page.getByTestId('reg-language')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('Artisan Registry'); // no CRM nav

  await page.getByTestId('reg-next').click(); // language -> consent
  await page.getByTestId('reg-consent').check();
  await page.getByTestId('reg-next').click(); // -> identity
  await page.getByTestId('reg-name').fill(ARTISAN_NAME);
  await page.getByTestId('reg-phone').fill('9876512345');
  await page.getByTestId('reg-next').click(); // -> address
  await page.getByTestId('reg-state').fill('Madhya Pradesh');
  await page.getByTestId('reg-district').fill('Dindori');
  await page.getByTestId('reg-village').fill('Karanjia');
  await page.getByTestId('reg-next').click(); // -> craft
  await page.getByTestId('reg-craft').selectOption('pottery');
  await page.getByTestId('reg-next').click(); // -> products
  await page.getByTestId('reg-next').click(); // -> review
  await page.getByTestId('reg-submit').click();
  await expect(page.getByTestId('registration-success')).toBeVisible();

  // CRM shows the new record as Public Link + Pending Verification
  await adminLogin(page);
  await page.goto('/admin/registry?status=pending_verification&q=Linkflow');
  const table = page.getByTestId('registry-table');
  await expect(table).toContainText(ARTISAN_NAME);
  await expect(table).toContainText('Public Link');

  const href = await table.getByRole('link', { name: ARTISAN_NAME }).first().getAttribute('href');
  artisanId = (href ?? '').split('/').pop() ?? '';
  expect(artisanId).toHaveLength(36);
});

test('admin assigns the artisan to a verifier; verifier sees the task', async ({ page }) => {
  await adminLogin(page);
  await page.goto(`/admin/registry/${artisanId}`);
  await page.getByTestId('assign-verifier').selectOption({ label: 'Sunita Marko (Verifier)' });
  await page.getByTestId('assign-submit').click();
  await expect(page.getByTestId('action-msg')).toContainText(/assigned/i);

  await signOut(page);
  await verifierLogin(page);
  await page.goto('/verifier');
  await expect(page.locator('body')).toContainText(ARTISAN_NAME);
  // verifier app shows no CRM navigation
  await expect(page.locator('body')).not.toContainText('Artisan Registry');
});

test('verifier edits a field, cancels an item, and Fully Verified is blocked without override', async ({ page }) => {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 22.9412, longitude: 81.0784 });
  await verifierLogin(page);
  await page.goto(`/verifier/artisans/${artisanId}/verify`);

  // edit any field (correction)
  await page.getByTestId('edit-full_name').fill(`${ARTISAN_NAME} (corrected)`);

  // per-field/section statuses, including a cancelled one
  await page.getByTestId('item-identity').selectOption('verified');
  await page.getByTestId('item-contact').selectOption('verified');
  await page.getByTestId('item-address').selectOption('cancelled');
  await page.getByTestId('item-craft').selectOption('verified');
  await page.getByTestId('item-products').selectOption('not_applicable');
  await page.getByTestId('item-documents').selectOption('verified');
  await page.getByTestId('item-consent').selectOption('verified');
  await page.getByTestId('note-address').fill('Address does not match captured GPS');

  await page.getByTestId('verify-consent').check();
  await page.getByTestId('capture-gps').click();
  await expect(page.getByTestId('gps-coords')).toBeVisible();

  // attempting Fully Verified is blocked because an item is cancelled
  await page.getByTestId('verify-decision').selectOption('verified');
  await page.getByTestId('verify-submit').click();
  await expect(page.getByTestId('verify-error')).toContainText(/override/i);

  // submit Needs Correction (allowed)
  await page.getByTestId('verify-decision').selectOption('needs_correction');
  await page.getByTestId('verify-reason').fill('location_mismatch');
  await page.getByTestId('verify-submit').click();
  await expect(page.getByTestId('verify-success')).toBeVisible({ timeout: 20000 });
});

test('CRM shows verification items + audit log, and admin override fully verifies', async ({ page }) => {
  await adminLogin(page);
  await page.goto(`/admin/registry/${artisanId}`);

  const items = page.getByTestId('verification-items');
  await expect(items).toContainText('Address & GPS');
  await expect(items).toContainText('cancelled');
  // the verifier's field correction is persisted
  await expect(page.locator('body')).toContainText(`${ARTISAN_NAME} (corrected)`);

  // audit log records the verification submission
  await page.goto('/admin/audit');
  await expect(page.getByTestId('audit-table')).toContainText('verification submitted');

  // admin override -> Fully Verified despite the cancelled item
  await page.goto(`/admin/registry/${artisanId}`);
  await page.getByTestId('admin-override').click();
  await expect(page.getByTestId('override-msg')).toContainText(/verified/i);
  await expect(page.getByText('Verified').first()).toBeVisible();
});

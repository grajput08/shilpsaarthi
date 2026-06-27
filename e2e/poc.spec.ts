import { test, expect } from '@playwright/test';
import { adminLogin, verifierLogin } from './helpers';

test.describe('open public registration at /register', () => {
  test('needs no login, shows no CRM UI, and creates a Pending Verification record', async ({ page }) => {
    const artisanName = 'Open Register Test Artisan';

    await page.context().clearCookies();
    await page.goto('/register');

    expect(page.url()).toContain('/register');
    await expect(page.getByTestId('reg-language')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Artisan Registry');

    await page.getByTestId('reg-next').click();
    await page.getByTestId('reg-consent').check();
    await page.getByTestId('reg-next').click();
    await page.getByTestId('reg-name').fill(artisanName);
    await page.getByTestId('reg-phone').fill('9876512399');
    await page.getByTestId('reg-next').click();
    await page.getByTestId('reg-state').fill('Madhya Pradesh');
    await page.getByTestId('reg-district').fill('Dindori');
    await page.getByTestId('reg-village').fill('Karanjia');
    await page.getByTestId('reg-next').click();
    await page.getByTestId('reg-craft').selectOption('pottery');
    await page.getByTestId('reg-next').click();
    await page.getByTestId('reg-next').click();
    await page.getByTestId('reg-submit').click();
    await expect(page.getByTestId('registration-success')).toBeVisible();

    await adminLogin(page);
    await page.goto('/admin/registry?status=pending_verification&q=Open+Register');
    const table = page.getByTestId('registry-table');
    await expect(table).toContainText(artisanName);
    await expect(table).toContainText('WhatsApp Self-Registration');
  });
});

// The full required journey runs as one ordered story (shared state between tests).
test.describe.configure({ mode: 'serial' });

const ARTISAN_NAME = 'Linkflow Test Artisan';
// Seeded active registration token (supabase/seed.sql).
const publicFormUrl = '/a/form?id=demo-token-active-0001';
let artisanId = '';

test('CRM admin dashboard loads with overview + charts', async ({ page }) => {
  await adminLogin(page);
  await expect(page.getByText('Programme Overview')).toBeVisible();
  await expect(page.getByText('Lifecycle status')).toBeVisible();
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

  // Admin stays logged in — verifier uses a separate portal session.
  await verifierLogin(page);
  await page.goto('/verifier');
  await expect(page.locator('body')).toContainText(ARTISAN_NAME);
  // verifier app shows no CRM navigation
  await expect(page.locator('body')).not.toContainText('Artisan Registry');

  // Admin session still active in parallel
  await page.goto('/admin');
  await expect(page.getByText('Programme Overview')).toBeVisible();
});

test('verifier edits a field, cancels an item, and Fully Verified is blocked without override', async ({ page }) => {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 22.9412, longitude: 81.0784 });
  await verifierLogin(page);
  await page.goto(`/verifier/artisans/${artisanId}/verify`);

  // Step 1 — Identity
  await page.getByTestId('edit-full_name').fill(`${ARTISAN_NAME} (corrected)`);
  await page.getByTestId('item-identity').selectOption('verified');
  await page.getByTestId('item-contact').selectOption('verified');
  await page.getByTestId('verify-continue').click();

  // Step 2 — Address
  await page.getByTestId('item-address').selectOption('cancelled');
  await page.getByTestId('note-address').fill('Address does not match captured GPS');
  await page.getByTestId('capture-gps').click();
  await expect(page.getByTestId('gps-coords')).toBeVisible();
  await page.getByTestId('verify-continue').click();

  // Step 3 — Craft
  await page.getByTestId('item-craft').selectOption('verified');
  await page.getByTestId('verify-continue').click();

  // Step 4 — Products
  await page.getByTestId('item-products').selectOption('not_applicable');
  await page.getByTestId('verify-continue').click();

  // Step 5 — Documents & consent
  await page.getByTestId('item-documents').selectOption('verified');
  await page.getByTestId('item-consent').selectOption('verified');
  await page.getByTestId('verify-consent').check();
  await page.getByTestId('verify-continue').click();

  // Step 6 — Final review
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

test('CRM shows verification items + WhatsApp timeline, and admin override fully verifies', async ({ page }) => {
  await adminLogin(page);
  await page.goto(`/admin/registry/${artisanId}`);

  const items = page.getByTestId('verification-items');
  await expect(items).toContainText('Address & GPS');
  await expect(items).toContainText('cancelled');
  // the verifier's field correction is persisted
  await expect(page.locator('body')).toContainText(`${ARTISAN_NAME} (corrected)`);

  // the WhatsApp timeline is present in the artisan section
  await expect(page.getByTestId('whatsapp-timeline')).toBeVisible();

  // admin override -> Fully Verified despite the cancelled item
  await page.getByTestId('admin-override').click();
  await expect(page.getByTestId('override-msg')).toContainText(/verified/i);
  await expect(page.getByText('Verified').first()).toBeVisible();
});

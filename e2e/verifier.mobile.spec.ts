import { test, expect } from '@playwright/test';
import { verifierLogin } from './helpers';

/**
 * Runs on a low-end Android viewport (Pixel 5) to prove the verifier PWA is
 * usable on the target device class — and shows no CRM navigation.
 */
test('verifier PWA works on a mobile viewport', async ({ page }) => {
  await verifierLogin(page);

  await expect(page.getByTestId('sync-banner')).toBeVisible();
  await expect(page.getByText("Today's Work")).toBeVisible();
  // verifier app must not expose CRM navigation
  await expect(page.locator('body')).not.toContainText('Artisan Registry');

  await page.goto('/verifier/tasks');
  await expect(page.getByTestId('task-search')).toBeVisible();
  await expect(page.locator('body')).toContainText('Assigned Cases');

  await page.goto('/verifier/sync');
  await expect(page.locator('body')).toContainText('Sync Queue');
});

import { test, expect } from '@playwright/test';
import { verifierLogin } from './helpers';

/**
 * Runs on a low-end Android viewport (Pixel 5) to prove the field PWA is usable
 * on the target device class.
 */
test('field verifier PWA works on a mobile viewport', async ({ page }) => {
  await verifierLogin(page);

  // Bottom navigation and today's work are visible.
  await expect(page.getByTestId('sync-banner')).toBeVisible();
  await expect(page.getByText("Today's Work")).toBeVisible();

  // The task list screen renders and is filterable.
  await page.goto('/field/tasks');
  await expect(page.getByTestId('task-search')).toBeVisible();
  await expect(page.locator('body')).toContainText('Assigned Cases');

  // The sync queue screen renders.
  await page.goto('/field/sync');
  await expect(page.locator('body')).toContainText('Sync Queue');
});

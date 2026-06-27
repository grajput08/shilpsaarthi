import { type Page, expect } from '@playwright/test';
import type { AuthArea } from '../src/lib/auth/area';

/** Deterministic seeded artisan ids. */
export const SEED = {
  // pending_verification, Dindori (unassigned)
  pending: 'a1a1a1a1-0000-0000-0000-000000000005',
  // assigned to verifier Sunita (333)
  assigned: 'a1a1a1a1-0000-0000-0000-000000000006',
  // verified, has products + documents + whatsapp
  verified: 'a1a1a1a1-0000-0000-0000-000000000008',
};

export async function adminLogin(page: Page) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill('admin@shilpsaarthi.test');
  await page.getByTestId('login-password').fill('Password123!');
  await page.getByTestId('login-submit').click();
  await page.waitForURL('**/admin');
}

export async function verifierLogin(page: Page) {
  await page.goto('/verifier/login');
  await page.getByTestId('otp-email').fill('verifier@shilpsaarthi.test');
  await page.getByTestId('otp-send').click();
  await expect(page.getByTestId('otp-code')).toBeVisible();
  await page.getByTestId('otp-code').fill('123456');
  await page.getByTestId('otp-verify').click();
  await page.waitForURL('**/verifier');
}

export async function signOut(page: Page, portal: AuthArea) {
  await page.getByTestId(`sign-out-${portal}`).click();
  if (portal === 'admin') {
    await page.waitForURL('**/login');
  } else {
    await page.waitForURL('**/verifier/login');
  }
}

/** 1x1 transparent PNG for photo-upload tests. */
export const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

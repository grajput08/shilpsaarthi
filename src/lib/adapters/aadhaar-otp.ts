import 'server-only';

/**
 * Mock Aadhaar e-KYC OTP adapter. In production, replace with UIDAI / licensed
 * Aadhaar API provider. Never persist full Aadhaar numbers — only masked refs.
 */
import { issueOtp, verifyOtp } from '@/lib/adapters/otp';

const AADHAAR_REGEX = /^[2-9][0-9]{11}$/;

export function normalizeAadhaar(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function isValidAadhaar(raw: string): boolean {
  return AADHAAR_REGEX.test(normalizeAadhaar(raw));
}

export function maskAadhaar(raw: string): string {
  const digits = normalizeAadhaar(raw);
  if (digits.length < 4) return 'XXXX-XXXX-XXXX';
  return `XXXX-XXXX-${digits.slice(-4)}`;
}

function otpKey(artisanId: string, aadhaar: string): string {
  return `aadhaar:${artisanId}:${normalizeAadhaar(aadhaar)}`;
}

export function sendAadhaarOtp(artisanId: string, aadhaarRaw: string) {
  const aadhaar = normalizeAadhaar(aadhaarRaw);
  if (!isValidAadhaar(aadhaar)) {
    return { ok: false as const, error: 'Enter a valid 12-digit Aadhaar number.' };
  }
  const { devCode } = issueOtp(otpKey(artisanId, aadhaar));
  return {
    ok: true as const,
    devCode,
    masked: maskAadhaar(aadhaar),
    message: 'OTP sent to Aadhaar-linked mobile number.',
  };
}

export function checkAadhaarOtp(artisanId: string, aadhaarRaw: string, code: string) {
  const aadhaar = normalizeAadhaar(aadhaarRaw);
  if (!isValidAadhaar(aadhaar)) {
    return { ok: false as const, error: 'Invalid Aadhaar number.' };
  }
  if (!verifyOtp(otpKey(artisanId, aadhaar), code)) {
    return { ok: false as const, error: 'Invalid or expired OTP. Try again.' };
  }
  return { ok: true as const, masked: maskAadhaar(aadhaar) };
}

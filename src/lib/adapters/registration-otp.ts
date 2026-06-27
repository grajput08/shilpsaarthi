import 'server-only';

import { PHONE_REGEX } from '@/lib/validation';
import { issueOtp, verifyOtp } from '@/lib/adapters/otp';

const PHONE_PREFIX = 'reg:';

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function otpKey(phone: string): string {
  return `${PHONE_PREFIX}${normalizePhone(phone)}`;
}

const verifiedPhones = new Set<string>();

export function sendRegistrationOtp(phone: string) {
  const normalized = normalizePhone(phone);
  if (!PHONE_REGEX.test(normalized)) {
    return { ok: false as const, error: 'Enter a valid 10-digit mobile number.' };
  }
  verifiedPhones.delete(normalized);
  const { devCode } = issueOtp(otpKey(normalized));
  return { ok: true as const, devCode };
}

export function verifyRegistrationOtp(phone: string, code: string) {
  const normalized = normalizePhone(phone);
  if (!PHONE_REGEX.test(normalized)) {
    return { ok: false as const, error: 'Enter a valid 10-digit mobile number.' };
  }
  if (!verifyOtp(otpKey(normalized), code)) {
    return { ok: false as const, error: 'Invalid or expired OTP. Try again.' };
  }
  verifiedPhones.add(normalized);
  return { ok: true as const };
}

export function isRegistrationPhoneVerified(phone: string): boolean {
  return verifiedPhones.has(normalizePhone(phone));
}

export function clearRegistrationPhoneVerification(phone: string): void {
  verifiedPhones.delete(normalizePhone(phone));
}

/** Accept in-session verification or a fresh OTP code (stateless, serverless-safe). */
export function assertRegistrationPhoneVerified(
  phone: string,
  otpCode?: string,
): { ok: true } | { ok: false; error: string } {
  const normalized = normalizePhone(phone);
  if (!PHONE_REGEX.test(normalized)) {
    return { ok: false, error: 'Enter a valid 10-digit mobile number.' };
  }
  if (otpCode?.trim() && verifyOtp(otpKey(normalized), otpCode)) {
    return { ok: true };
  }
  if (isRegistrationPhoneVerified(normalized)) {
    return { ok: true };
  }
  return {
    ok: false,
    error: 'Mobile number is not verified. Send OTP to /api/public/register/otp, then include otp_code.',
  };
}

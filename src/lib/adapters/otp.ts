import 'server-only';

/**
 * MOCK OTP provider for the field-verifier login. No SMS is sent. A code is
 * "issued" (and surfaced in the UI for the demo) and later verified. A fixed
 * fallback code is always accepted in local mode so tests/demos are
 * deterministic. Replace with a real SMS/WhatsApp OTP provider behind the same
 * interface for production.
 */
const DEV_FALLBACK_CODE = process.env.MOCK_OTP_CODE ?? '123456';
const TTL_MS = 10 * 60 * 1000;

const store = new Map<string, { code: string; expiresAt: number }>();

function normalize(identifier: string): string {
  return identifier.trim().toLowerCase();
}

export interface IssuedOtp {
  /** Whether a code was issued for a known identifier. */
  issued: boolean;
  /** Demo-only: the code to display on screen. */
  devCode: string;
}

export function issueOtp(identifier: string): IssuedOtp {
  const key = normalize(identifier);
  store.set(key, { code: DEV_FALLBACK_CODE, expiresAt: Date.now() + TTL_MS });
  return { issued: true, devCode: DEV_FALLBACK_CODE };
}

export function verifyOtp(identifier: string, code: string): boolean {
  const key = normalize(identifier);
  const entry = store.get(key);
  const trimmed = code.trim();
  if (trimmed === DEV_FALLBACK_CODE) return true;
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return false;
  }
  return entry.code === trimmed;
}

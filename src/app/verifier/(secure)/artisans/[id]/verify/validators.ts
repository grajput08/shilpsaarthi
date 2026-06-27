import { PHONE_REGEX } from '@/lib/validation';
import type { VerificationDecision } from '@/lib/domain';

/**
 * Decoupled, client-side validation for the field verification form.
 *
 * The form layer decides *when* to run these (blur, change, submit); this
 * module only decides *what counts as valid*. Reason validity depends on the
 * chosen decision, so the shape carries both.
 */

export type VerifyFieldKey = 'full_name' | 'phone' | 'decision' | 'reason';

export interface VerifyValues {
  full_name: string;
  phone: string;
  decision: VerificationDecision | '';
  reason: string;
}

/** Decisions that must be justified with a short reason. */
const REASON_REQUIRED: ReadonlySet<string> = new Set([
  'needs_correction',
  'revisit_required',
  'rejected',
  'duplicate',
]);

export function reasonRequired(decision: VerifyValues['decision']): boolean {
  return REASON_REQUIRED.has(decision);
}

export function validateField(field: VerifyFieldKey, values: VerifyValues): string | null {
  switch (field) {
    case 'full_name':
      return values.full_name.trim().length >= 2 ? null : 'Name must be at least 2 characters.';
    case 'phone':
      // Optional, but if present it must be a valid Indian mobile number.
      if (!values.phone) return null;
      return PHONE_REGEX.test(values.phone) ? null : 'Enter a valid 10-digit mobile number.';
    case 'decision':
      return values.decision ? null : 'Please choose a final status.';
    case 'reason':
      if (!reasonRequired(values.decision)) return null;
      return values.reason.trim().length >= 3 ? null : 'Add a short reason for this decision.';
    default:
      return null;
  }
}

export type VerifyErrors = Partial<Record<VerifyFieldKey, string>>;

/** Validate every field; returns the error map and the first offender for focus. */
export function validateAll(values: VerifyValues): {
  errors: VerifyErrors;
  firstInvalid: VerifyFieldKey | null;
} {
  const order: VerifyFieldKey[] = ['full_name', 'phone', 'decision', 'reason'];
  const errors: VerifyErrors = {};
  let firstInvalid: VerifyFieldKey | null = null;
  for (const field of order) {
    const message = validateField(field, values);
    if (message) {
      errors[field] = message;
      if (!firstInvalid) firstInvalid = field;
    }
  }
  return { errors, firstInvalid };
}

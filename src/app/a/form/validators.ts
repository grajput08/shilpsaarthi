import { PHONE_REGEX } from '@/lib/validation';

/**
 * Decoupled, framework-agnostic validation for the artisan registration form.
 *
 * Each validator takes the raw field value and returns a concise, helpful
 * error message, or `null` when the value is acceptable. The form layer owns
 * *when* to run these (on blur, on change, on step advance); this module only
 * owns *what counts as valid*. That separation keeps the rules testable and
 * reusable without dragging React in.
 */

export type ValidatableField =
  | 'consent'
  | 'full_name'
  | 'phone'
  | 'state'
  | 'district'
  | 'village'
  | 'primary_craft';

type Validator = (value: unknown) => string | null;

const str = (v: unknown) => (typeof v === 'string' ? v : '');

export const validators: Record<ValidatableField, Validator> = {
  consent: (v) => (v === true ? null : 'Please accept the consent to continue.'),
  full_name: (v) => (str(v).trim().length >= 2 ? null : 'Please enter your full name.'),
  phone: (v) => (PHONE_REGEX.test(str(v)) ? null : 'Enter a valid 10-digit mobile number.'),
  state: (v) => (str(v).trim().length >= 2 ? null : 'State is required.'),
  district: (v) => (str(v).trim().length >= 2 ? null : 'District is required.'),
  village: (v) => (str(v).trim().length >= 1 ? null : 'Village is required.'),
  primary_craft: (v) => (str(v) ? null : 'Please choose a craft category.'),
};

/** Which fields each wizard step is responsible for validating. */
export const stepFields: Record<number, ValidatableField[]> = {
  1: ['consent'],
  2: ['full_name', 'phone'],
  3: ['state', 'district', 'village'],
  4: ['primary_craft'],
};

export type FieldErrors = Partial<Record<ValidatableField, string>>;

/** Validate one field; returns the message or null. */
export function validateField(field: ValidatableField, value: unknown): string | null {
  return validators[field](value);
}

/**
 * Validate every field a step owns. Returns the error map (empty when valid)
 * and the first offending field, so the caller can move focus there.
 */
export function validateStep(
  step: number,
  values: Record<string, unknown>,
): { errors: FieldErrors; firstInvalid: ValidatableField | null } {
  const fields = stepFields[step] ?? [];
  const errors: FieldErrors = {};
  let firstInvalid: ValidatableField | null = null;
  for (const field of fields) {
    const message = validators[field](values[field]);
    if (message) {
      errors[field] = message;
      if (!firstInvalid) firstInvalid = field;
    }
  }
  return { errors, firstInvalid };
}

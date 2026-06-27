import { describe, it, expect } from 'vitest';
import { validateField, validateAll, reasonRequired, type VerifyValues } from './validators';

const base: VerifyValues = { full_name: 'Sukhram Maravi', phone: '', decision: '', reason: '' };

describe('verify-flow validators', () => {
  it('requires a name of at least 2 characters', () => {
    expect(validateField('full_name', { ...base, full_name: 'A' })).toMatch(/2 characters/);
    expect(validateField('full_name', base)).toBeNull();
  });

  it('treats phone as optional but validates the format when present', () => {
    expect(validateField('phone', { ...base, phone: '' })).toBeNull();
    expect(validateField('phone', { ...base, phone: '12345' })).toMatch(/valid/i);
    expect(validateField('phone', { ...base, phone: '9876512345' })).toBeNull();
  });

  it('requires a final decision', () => {
    expect(validateField('decision', base)).toMatch(/final status/i);
    expect(validateField('decision', { ...base, decision: 'verified' })).toBeNull();
  });

  it('requires a reason only for non-verified decisions', () => {
    expect(reasonRequired('verified')).toBe(false);
    expect(reasonRequired('needs_correction')).toBe(true);
    expect(validateField('reason', { ...base, decision: 'verified' })).toBeNull();
    expect(validateField('reason', { ...base, decision: 'rejected' })).toMatch(/reason/i);
    expect(validateField('reason', { ...base, decision: 'rejected', reason: 'location mismatch' })).toBeNull();
  });

  it('validateAll returns the first invalid field for focus', () => {
    const { errors, firstInvalid } = validateAll({ full_name: '', phone: 'bad', decision: '', reason: '' });
    expect(firstInvalid).toBe('full_name');
    expect(Object.keys(errors).sort()).toEqual(['decision', 'full_name', 'phone']);
  });
});

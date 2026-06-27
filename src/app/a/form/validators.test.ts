import { describe, it, expect } from 'vitest';
import { validateField, validateStep } from './validators';

describe('registration validators', () => {
  it('accepts a valid full name and rejects a short one', () => {
    expect(validateField('full_name', 'Sukhram Maravi')).toBeNull();
    expect(validateField('full_name', 'a')).toMatch(/full name/i);
    expect(validateField('full_name', '   ')).toMatch(/full name/i);
  });

  it('enforces a 10-digit Indian mobile number', () => {
    expect(validateField('phone', '9876512345')).toBeNull();
    expect(validateField('phone', '1234567890')).toMatch(/valid/i); // must start 6-9
    expect(validateField('phone', '98765')).toMatch(/valid/i);
  });

  it('requires consent to be exactly true', () => {
    expect(validateField('consent', true)).toBeNull();
    expect(validateField('consent', false)).toMatch(/consent/i);
  });

  it('validateStep reports the first invalid field for focus', () => {
    const { errors, firstInvalid } = validateStep(2, { full_name: '', phone: 'bad' });
    expect(firstInvalid).toBe('full_name');
    expect(errors.full_name).toBeTruthy();
    expect(errors.phone).toBeTruthy();
  });

  it('validateStep returns no errors when the step is complete', () => {
    const { errors, firstInvalid } = validateStep(3, {
      state: 'Madhya Pradesh',
      district: 'Dindori',
      village: 'Karanjia',
    });
    expect(firstInvalid).toBeNull();
    expect(Object.keys(errors)).toHaveLength(0);
  });
});

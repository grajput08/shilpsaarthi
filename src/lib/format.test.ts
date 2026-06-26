import { describe, it, expect } from 'vitest';
import { maskPhone, computeCompleteness, ageFromDob, haversineKm } from './format';

describe('maskPhone', () => {
  it('masks all but the last four digits', () => {
    expect(maskPhone('9800000001')).toBe('••••••0001');
  });
  it('returns a dash for empty input', () => {
    expect(maskPhone(null)).toBe('—');
  });
});

describe('computeCompleteness', () => {
  it('is 0 when nothing is captured', () => {
    expect(
      computeCompleteness({
        basicComplete: false,
        addressComplete: false,
        gpsCaptured: false,
        consentCaptured: false,
        craftComplete: false,
        productPhotos: false,
        documentsChecked: false,
        decisionPresent: false,
      }),
    ).toBe(0);
  });
  it('is 100 when everything is captured', () => {
    expect(
      computeCompleteness({
        basicComplete: true,
        addressComplete: true,
        gpsCaptured: true,
        consentCaptured: true,
        craftComplete: true,
        productPhotos: true,
        documentsChecked: true,
        decisionPresent: true,
      }),
    ).toBe(100);
  });
  it('scales with the number of completed checks', () => {
    expect(
      computeCompleteness({
        basicComplete: true,
        addressComplete: true,
        gpsCaptured: false,
        consentCaptured: true,
        craftComplete: true,
        productPhotos: false,
        documentsChecked: false,
        decisionPresent: false,
      }),
    ).toBe(50);
  });
});

describe('ageFromDob', () => {
  it('computes an age in years', () => {
    const age = ageFromDob('1990-01-01');
    expect(age).toBeGreaterThan(30);
    expect(age).toBeLessThan(60);
  });
  it('returns null for missing dob', () => {
    expect(ageFromDob(null)).toBeNull();
  });
});

describe('haversineKm', () => {
  it('returns 0 for identical points', () => {
    expect(haversineKm({ lat: 22.9, lng: 81.0 }, { lat: 22.9, lng: 81.0 })).toBe(0);
  });
  it('computes a positive distance for different points', () => {
    expect(haversineKm({ lat: 22.9412, lng: 81.0784 }, { lat: 22.7531, lng: 81.3122 })).toBeGreaterThan(20);
  });
});

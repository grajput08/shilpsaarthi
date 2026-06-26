import { describe, it, expect } from 'vitest';
import { publicRegistrationSchema, verificationSubmitSchema } from './validation';

describe('publicRegistrationSchema', () => {
  const base = {
    preferred_language: 'hi',
    consent: true,
    full_name: 'Sukhram Maravi',
    phone: '9800000001',
    state: 'Madhya Pradesh',
    district: 'Dindori',
    village: 'Karanjia',
    primary_craft: 'textile',
  };

  it('accepts a valid payload', () => {
    expect(publicRegistrationSchema.safeParse(base).success).toBe(true);
  });

  it('rejects an invalid phone', () => {
    const r = publicRegistrationSchema.safeParse({ ...base, phone: '12345' });
    expect(r.success).toBe(false);
  });

  it('requires consent to be true', () => {
    const r = publicRegistrationSchema.safeParse({ ...base, consent: false });
    expect(r.success).toBe(false);
  });

  it('rejects an unknown craft', () => {
    const r = publicRegistrationSchema.safeParse({ ...base, primary_craft: 'spaceship' });
    expect(r.success).toBe(false);
  });
});

describe('verificationSubmitSchema', () => {
  const base = {
    artisan_id: '11111111-1111-1111-1111-111111111111',
    client_generated_id: 'cgid-1',
    decision: 'verified',
    consent_captured: true,
    identity_verified: true,
    location_verified: true,
    craft_verified: true,
    products_captured: true,
    documents_checked: true,
    duplicate_checked: true,
    market_ready: false,
  };

  it('accepts a valid verification', () => {
    expect(verificationSubmitSchema.safeParse(base).success).toBe(true);
  });

  it('rejects an out-of-range latitude', () => {
    const r = verificationSubmitSchema.safeParse({ ...base, latitude: 200 });
    expect(r.success).toBe(false);
  });

  it('rejects an unknown decision', () => {
    const r = verificationSubmitSchema.safeParse({ ...base, decision: 'maybe' });
    expect(r.success).toBe(false);
  });
});

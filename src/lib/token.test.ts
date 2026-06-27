import { describe, it, expect } from 'vitest';
import { generateToken } from './token';

describe('generateToken', () => {
  it('produces url-safe tokens', () => {
    expect(generateToken()).toMatch(/^[A-Za-z0-9_-]+$/);
  });
  it('produces unique tokens', () => {
    const set = new Set(Array.from({ length: 50 }, () => generateToken()));
    expect(set.size).toBe(50);
  });
  it('is long enough to be unguessable', () => {
    expect(generateToken().length).toBeGreaterThanOrEqual(20);
  });
});

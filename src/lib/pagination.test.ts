import { describe, expect, it } from 'vitest';
import { buildQueryString, clampPage, parsePage } from './pagination';

describe('parsePage', () => {
  it('defaults invalid values to 1', () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage('0')).toBe(1);
    expect(parsePage('-2')).toBe(1);
    expect(parsePage('abc')).toBe(1);
  });

  it('parses positive integers', () => {
    expect(parsePage('3')).toBe(3);
  });
});

describe('clampPage', () => {
  it('clamps to available pages', () => {
    expect(clampPage(5, 40, 25)).toBe(2);
    expect(clampPage(1, 40, 25)).toBe(1);
    expect(clampPage(99, 0, 25)).toBe(1);
  });
});

describe('buildQueryString', () => {
  it('omits empty values and page 1', () => {
    expect(buildQueryString({ q: 'test', status: '', page: undefined }, { page: undefined })).toBe('?q=test');
    expect(buildQueryString({ q: 'test' }, { page: '2' })).toBe('?q=test&page=2');
  });
});

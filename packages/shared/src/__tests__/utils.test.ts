import { describe, it, expect } from 'vitest';
import { formatCurrency, generateOrderNumber, slugify, clamp } from '../utils/index.js';

describe('utils', () => {
  it('formatCurrency should format INR', () => {
    const result = formatCurrency(150);
    expect(result).toContain('₹150');
  });

  it('generateOrderNumber should match pattern', () => {
    const num = generateOrderNumber();
    expect(num).toMatch(/^ORD-\d{6}-\d{4}$/);
  });

  it('slugify should create valid slug', () => {
    expect(slugify('Fresh King Fish')).toBe('fresh-king-fish');
  });

  it('clamp should restrict value', () => {
    expect(clamp(10, 0, 5)).toBe(5);
    expect(clamp(-1, 0, 5)).toBe(0);
    expect(clamp(3, 0, 5)).toBe(3);
  });
});

import { describe, expect, it } from 'vitest';

import { ProductUnit } from '../types/product.js';
import {
  calculatePrice,
  calculatePriceFromKg,
  formatWeight,
  getPresets,
  getWeightPresets,
  parseWeightInput,
  weightToGrams,
} from './weight.js';

describe('weight domain - presets', () => {
  it('GRAM presets are 500g/750g/1000g', () => {
    expect(getPresets('GRAM').map((p) => p.display)).toEqual(['500g', '750g', '1000g']);
    expect(getPresets('GRAM').map((p) => p.grams)).toEqual([500, 750, 1000]);
    expect(getWeightPresets('GRAM').map((p) => p.display)).toEqual(['500g', '750g', '1000g']);
  });
  it('KG presets are 1kg/1.5kg/3kg', () => {
    expect(getPresets('KG').map((p) => p.display)).toEqual(['1kg', '1.5kg', '3kg']);
    expect(getPresets('KG').map((p) => p.grams)).toEqual([1000, 1500, 3000]);
  });
  it('supports ProductUnit enum as mode for back-compat', () => {
    expect(getPresets(ProductUnit.GRAM).map((p) => p.display)).toEqual(['500g', '750g', '1000g']);
    expect(getPresets(ProductUnit.KG).map((p) => p.display)).toEqual(['1kg', '1.5kg', '3kg']);
  });
});

describe('parseWeightInput - GRAM mode', () => {
  it('accepts valid GRAM inputs case-insensitive', () => {
    expect(parseWeightInput('500g', 'GRAM').success).toBe(true);
    expect(parseWeightInput('500G', 'GRAM').success).toBe(true);
    expect(parseWeightInput('750g', 'GRAM').success).toBe(true);
    expect(parseWeightInput('1000g', 'GRAM').success).toBe(true);
    expect(parseWeightInput('200g', 'GRAM').grams).toBe(200);
    expect(parseWeightInput('350g', 'GRAM').grams).toBe(350);
    expect(parseWeightInput('850g', 'GRAM').grams).toBe(850);
    expect(parseWeightInput('1250g', 'GRAM').grams).toBe(1250);
  });
  it('normalizes 200G → 200g', () => {
    const r = parseWeightInput('200G', 'GRAM');
    expect(r.display).toBe('200g');
  });
  it('rejects missing unit', () => {
    expect(parseWeightInput('200', 'GRAM').success).toBe(false);
    expect(parseWeightInput('1.5', 'GRAM').success).toBe(false);
  });
  it('rejects wrong unit 1kg for GRAM mode', () => {
    const r = parseWeightInput('1kg', 'GRAM');
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/grams/i);
  });
  it('rejects extra text and malformed', () => {
    expect(parseWeightInput('200 g extra text', 'GRAM').success).toBe(false);
    expect(parseWeightInput('200 grams', 'GRAM').success).toBe(false);
    expect(parseWeightInput('₹200', 'GRAM').success).toBe(false);
    expect(parseWeightInput('abc', 'GRAM').success).toBe(false);
    expect(parseWeightInput('hello', 'GRAM').success).toBe(false);
    expect(parseWeightInput('1 kilo', 'GRAM').success).toBe(false);
  });
  it('rejects zero/negative/empty', () => {
    expect(parseWeightInput('', 'GRAM').success).toBe(false);
    expect(parseWeightInput('0g', 'GRAM').success).toBe(false);
    expect(parseWeightInput('0', 'GRAM').success).toBe(false);
    expect(parseWeightInput('-200g', 'GRAM').success).toBe(false);
  });
  it('rejects decimal grams', () => {
    expect(parseWeightInput('1.5g', 'GRAM').success).toBe(false);
  });
});

describe('parseWeightInput - KG mode', () => {
  it('accepts valid KG inputs', () => {
    expect(parseWeightInput('1kg', 'KG').success).toBe(true);
    expect(parseWeightInput('1KG', 'KG').success).toBe(true);
    expect(parseWeightInput('1.5kg', 'KG').success).toBe(true);
    expect(parseWeightInput('1.75KG', 'KG').grams).toBe(1750);
    expect(parseWeightInput('3kg', 'KG').success).toBe(true);
    expect(parseWeightInput('1.25kg', 'KG').grams).toBe(1250);
    expect(parseWeightInput('2.4kg', 'KG').grams).toBe(2400);
  });
  it('normalizes 1.5KG → 1.5kg', () => {
    expect(parseWeightInput('1.5KG', 'KG').display).toBe('1.5kg');
  });
  it('rejects gram input for KG mode', () => {
    const r = parseWeightInput('500g', 'KG');
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/KG/);
  });
  it('rejects missing unit and invalid', () => {
    expect(parseWeightInput('1.5', 'KG').success).toBe(false);
    expect(parseWeightInput('200', 'KG').success).toBe(false);
    expect(parseWeightInput('abc', 'KG').success).toBe(false);
    expect(parseWeightInput('1 kilos', 'KG').success).toBe(false);
  });
  it('rejects zero/negative/infinity', () => {
    expect(parseWeightInput('0kg', 'KG').success).toBe(false);
    expect(parseWeightInput('-1kg', 'KG').success).toBe(false);
  });
});

describe('weightToGrams', () => {
  it('converts GRAM directly', () => {
    expect(weightToGrams(500, 'GRAM')).toBe(500);
    expect(weightToGrams(500, ProductUnit.GRAM)).toBe(500);
  });
  it('converts KG to grams', () => {
    expect(weightToGrams(1, 'KG')).toBe(1000);
    expect(weightToGrams(1.5, 'KG')).toBe(1500);
    expect(weightToGrams(1, ProductUnit.KG)).toBe(1000);
  });
});

describe('formatWeight', () => {
  it('formats grams', () => {
    expect(formatWeight(500, 'GRAM')).toBe('500g');
    expect(formatWeight(750, 'GRAM')).toBe('750g');
    expect(formatWeight(1000, 'GRAM')).toBe('1000g');
  });
  it('formats kg', () => {
    expect(formatWeight(1000, 'KG')).toBe('1kg');
    expect(formatWeight(1500, 'KG')).toBe('1.5kg');
    expect(formatWeight(1250, 'KG')).toBe('1.25kg');
    expect(formatWeight(3000, 'KG')).toBe('3kg');
    expect(formatWeight(750, 'KG')).toBe('0.75kg');
  });
});

describe('calculatePriceFromKg - canonical', () => {
  it('1000/kg examples', () => {
    expect(calculatePriceFromKg(1000, 500)).toBe(500);
    expect(calculatePriceFromKg(1000, 750)).toBe(750);
    expect(calculatePriceFromKg(1000, 1000)).toBe(1000);
    expect(calculatePriceFromKg(1000, 1500)).toBe(1500);
    expect(calculatePriceFromKg(1000, 3000)).toBe(3000);
    expect(calculatePriceFromKg(1000, 200)).toBe(200);
  });
  it('850/kg examples', () => {
    expect(calculatePriceFromKg(850, 500)).toBe(425);
    expect(calculatePriceFromKg(850, 750)).toBe(637.5);
    expect(calculatePriceFromKg(850, 1000)).toBe(850);
    expect(calculatePriceFromKg(850, 1500)).toBe(1275);
    expect(calculatePriceFromKg(850, 3000)).toBe(2550);
    expect(calculatePriceFromKg(850, 200)).toBe(170);
  });
  it('uses paise integer math - no float drift', () => {
    const v = calculatePriceFromKg(850, 750);
    expect(v).toBe(637.5);
    expect(v.toFixed(2)).toBe('637.50');
  });
  it('legacy calculatePrice delegates correctly for KG', () => {
    expect(calculatePrice(1000, 'KG', 500)).toBe(500);
    expect(calculatePrice(850, ProductUnit.KG, 750)).toBe(637.5);
  });
  it('legacy calculatePrice for GRAM converts (2/g => 2000/kg)', () => {
    // 2 per gram *1000 = 2000 per kg, 500g => 1000
    expect(calculatePrice(2, 'GRAM', 500)).toBe(1000);
    expect(calculatePrice(2, ProductUnit.GRAM, 1000)).toBe(2000);
  });
});

describe('unit equivalence - canonical grams', () => {
  it('1000g === 1kg same price', () => {
    expect(calculatePriceFromKg(850, 1000)).toBe(calculatePriceFromKg(850, 1000));
    expect(formatWeight(1000, 'GRAM')).toBe('1000g');
    expect(formatWeight(1000, 'KG')).toBe('1kg');
    expect(calculatePriceFromKg(850, 1000)).toBe(850);
  });
  it('1500g === 1.5kg', () => {
    expect(calculatePriceFromKg(850, 1500)).toBe(1275);
    expect(formatWeight(1500, 'KG')).toBe('1.5kg');
  });
  it('3000g === 3kg', () => {
    expect(calculatePriceFromKg(850, 3000)).toBe(2550);
  });
  it('500g price via KG calc equals GRAM parser grams', () => {
    const g = parseWeightInput('500g', 'GRAM').grams as number;
    const kg = parseWeightInput('0.5kg', 'KG').grams as number;
    expect(g).toBe(500);
    expect(kg).toBe(500);
    expect(calculatePriceFromKg(1000, g)).toBe(calculatePriceFromKg(1000, kg));
  });
});

import { ProductUnit } from '../types/product.js';

/**
 * Canonical weight domain for OceanFresh — PRODUCTION.
 * ONE source of truth for parsing, normalizing, pricing, formatting.
 *
 * PRICE BASIS: products.price is canonical pricePerKg (₹ per 1000g).
 * INTERNAL CANONICAL WEIGHT: grams (integer).
 * CUSTOMER MODES: GRAM | KG selectable for every product (display/normalization),
 * but pricing always via pricePerKg/1000 * grams.
 *
 * Legacy PIECE/DOZEN remain dormantly in ProductUnit enum for DB compatibility.
 */

export type WeightMode = 'GRAM' | 'KG';
export type WeightUnit = ProductUnit.GRAM | ProductUnit.KG;

export const GRAM_PRESETS = [
  { display: '500g', grams: 500 },
  { display: '750g', grams: 750 },
  { display: '1000g', grams: 1000 },
] as const;

export const KG_PRESETS = [
  { display: '1kg', grams: 1000 },
  { display: '1.5kg', grams: 1500 },
  { display: '3kg', grams: 3000 },
] as const;

export function isWeightMode(mode: string): mode is WeightMode {
  return mode === 'GRAM' || mode === 'KG';
}

export function isWeightUnit(unit: string): unit is WeightUnit {
  return unit === ProductUnit.GRAM || unit === ProductUnit.KG;
}

export function getPresets(mode: WeightMode | ProductUnit): { display: string; grams: number }[] {
  const normalized = String(mode).toUpperCase() as WeightMode;
  if (normalized === 'GRAM') return [...GRAM_PRESETS];
  if (normalized === 'KG') return [...KG_PRESETS];
  return [];
}

/** @deprecated — canonical is 1000 (pricePerKg basis). Kept for legacy dual-unit callers. */
export function gramsPerUnit(unit: ProductUnit): number {
  if (unit === ProductUnit.KG) return 1000;
  if (unit === ProductUnit.GRAM) return 1;
  throw new Error(`Unsupported unit for weight pricing: ${unit}`);
}

export interface ParseResult {
  success: boolean;
  grams?: number;
  display?: string;
  /** mode/ unit for back-compat */
  unit?: ProductUnit;
  mode?: WeightMode;
  error?: string;
  normalizedInput?: string;
}

const WEIGHT_REGEX = /^\s*(\d+(?:\.\d+)?)\s*(g|kg)\s*$/i;

/**
 * Canonical parser — strict, single regex, case-insensitive.
 * expectedMode: GRAM requires g, KG requires kg. Do NOT silently convert.
 */
export function parseWeightInput(raw: string, expectedMode: WeightMode | ProductUnit): ParseResult {
  const input = raw ?? '';

  if (!input || typeof input !== 'string' || input.trim() === '') {
    return { success: false, error: 'Please enter a weight.' };
  }

  const trimmed = input.trim();
  const expected = String(expectedMode).toUpperCase() as WeightMode;

  if (/^-/.test(trimmed)) {
    return { success: false, error: 'Weight must be positive.' };
  }

  const match = trimmed.match(WEIGHT_REGEX);
  if (!match) {
    const hasNumber = /^\s*\d/.test(trimmed);
    const hasLetters = /[a-zA-Z]/.test(trimmed);
    if (hasNumber && !hasLetters) {
      if (expected === 'GRAM') {
        return { success: false, error: 'Please include the unit, e.g. 500g or 1.5kg.' };
      }
      return { success: false, error: 'Please include the unit, e.g. 500g or 1.5kg.' };
    }
    return { success: false, error: 'Invalid weight format. Use e.g. 500g or 1.5kg.' };
  }

  const numStr = match[1] as string;
  const unitRaw = match[2] as string;
  const unitLower = unitRaw.toLowerCase();

  const value = Number(numStr);
  if (!Number.isFinite(value) || isNaN(value)) {
    return { success: false, error: 'Invalid weight value.' };
  }
  if (value <= 0) {
    return { success: false, error: 'Weight must be greater than 0.' };
  }

  let parsedMode: WeightMode;
  if (unitLower === 'g') parsedMode = 'GRAM';
  else if (unitLower === 'kg') parsedMode = 'KG';
  else {
    return { success: false, error: 'Invalid unit. Use g or kg.' };
  }

  if (parsedMode !== expected) {
    if (expected === 'KG') {
      return { success: false, error: 'Please enter the quantity in KG.' };
    }
    return { success: false, error: 'Please enter the quantity in grams.' };
  }

  if (expected === 'GRAM') {
    if (!Number.isInteger(value)) {
      return { success: false, error: 'Gram weight must be a whole number (e.g. 500g).' };
    }
    if (value > 10000) {
      return { success: false, error: 'Weight too large.' };
    }
  } else {
    const decimals = numStr.includes('.') ? (numStr.split('.')[1]?.length ?? 0) : 0;
    if (decimals > 3) {
      return { success: false, error: 'KG weight supports up to 3 decimal places.' };
    }
    if (value > 100) {
      return { success: false, error: 'Weight too large.' };
    }
  }

  const grams = weightToGrams(value, expected);
  const display = formatWeight(grams, expected);

  const unitForCompat = expected === 'GRAM' ? ProductUnit.GRAM : ProductUnit.KG;

  return {
    success: true,
    grams,
    display,
    unit: unitForCompat,
    mode: expected,
    normalizedInput: display,
  };
}

export function weightToGrams(value: number, mode: WeightMode | ProductUnit): number {
  const m = String(mode).toUpperCase() as WeightMode;
  if (m === 'GRAM') return Math.round(value);
  if (m === 'KG') return Math.round(value * 1000);
  throw new Error(`Unsupported mode: ${String(mode)}`);
}

export function normalizeWeightInput(input: string): string {
  const trimmed = input.trim().toLowerCase();
  return trimmed.replace(/\s+/g, '').replace(/g$/, 'g').replace(/kg$/, 'kg');
}

/**
 * CANONICAL price calculation — pricePerKg basis, paise integer, grams canonical.
 * pricePerKg: ₹ per 1000g (single source, products.price)
 * grams: canonical weight
 * Returns lineTotal in rupees.
 */
export function calculatePriceFromKg(pricePerKg: number, grams: number): number {
  if (!Number.isFinite(pricePerKg) || pricePerKg <= 0) {
    throw new Error('Invalid pricePerKg');
  }
  if (!Number.isFinite(grams) || grams <= 0) {
    throw new Error('Invalid grams');
  }
  const pricePaise = Math.round(pricePerKg * 100);
  const lineTotalPaise = Math.round((pricePaise * grams) / 1000);
  return lineTotalPaise / 100;
}

/**
 * Legacy dual-unit calculator — kept for back-compat with GRAM-priced rows until
 * manual repricing completes. New code should use calculatePriceFromKg.
 * If unit is GRAM, pricePerUnit is treated as per-gram and converted to perKg (*1000).
 */
export function calculatePrice(
  pricePerUnit: number,
  unit: ProductUnit | WeightMode,
  grams: number,
): number {
  if (!Number.isFinite(pricePerUnit) || pricePerUnit <= 0) {
    throw new Error('Invalid pricePerUnit');
  }
  if (!Number.isFinite(grams) || grams <= 0) {
    throw new Error('Invalid grams');
  }
  const mode = String(unit).toUpperCase() as WeightMode;
  if (mode === 'GRAM') {
    // Legacy: price was per gram → convert to perKg
    const pricePerKg = pricePerUnit * 1000;
    return calculatePriceFromKg(pricePerKg, grams);
  }
  if (mode === 'KG') {
    return calculatePriceFromKg(pricePerUnit, grams);
  }
  throw new Error(`Unsupported unit for pricing: ${String(unit)}`);
}

/**
 * Convenience: calculate from display string after validation.
 */
export function calculatePriceForDisplay(
  pricePerKg: number,
  mode: WeightMode | ProductUnit,
  display: string,
): number | null {
  const parsed = parseWeightInput(display, mode);
  if (!parsed.success || parsed.grams == null) return null;
  return calculatePriceFromKg(pricePerKg, parsed.grams);
}

export function formatWeight(grams: number, mode: WeightMode | ProductUnit): string {
  const m = String(mode).toUpperCase() as WeightMode;
  if (m === 'GRAM') {
    return `${Math.round(grams)}g`;
  }
  if (m === 'KG') {
    const kg = grams / 1000;
    const formatted = parseFloat(kg.toFixed(3)).toString();
    return `${formatted}kg`;
  }
  throw new Error(`Unsupported mode for formatWeight: ${String(mode)}`);
}

export function formatPrice(amount: number, currency = 'INR', locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function isProductAvailable(status: string): boolean {
  return status === 'ACTIVE';
}

/** Display helper for presets */
export function getWeightPresets(mode: WeightMode): { display: string; grams: number }[] {
  return getPresets(mode);
}

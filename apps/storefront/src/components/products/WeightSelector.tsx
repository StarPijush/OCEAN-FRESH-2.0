import {
  calculatePriceFromKg,
  formatWeight,
  getPresets,
  parseWeightInput,
  type WeightMode,
} from '@oceanfresh/shared/domain';
import { useEffect, useState } from 'react';

export type { WeightMode };

export interface WeightSelectorProps {
  /** Canonical price per 1 KG (₹ per 1000g). Single source, products.price */
  pricePerKg: number;
  /** Customer selected mode GRAM or KG — controls presets/validation, not product unit */
  mode: WeightMode;
  value: string | null;
  onModeChange: (mode: WeightMode) => void;
  onChange: (display: string | null, grams: number | null, error: string | null) => void;
  disabled?: boolean;
  // Backward compat: allow legacy props but prefer new
  unit?: WeightMode;
  pricePerUnit?: number;
}

export function WeightSelector({
  pricePerKg,
  mode,
  value,
  onModeChange,
  onChange,
  disabled,
  unit,
  pricePerUnit,
}: WeightSelectorProps) {
  // Support legacy callers that still pass unit/pricePerUnit
  const effectiveMode = (mode ?? unit ?? 'GRAM') as WeightMode;
  const effectivePrice = pricePerKg ?? pricePerUnit ?? 0;
  const presets = getPresets(effectiveMode);
  const [custom, setCustom] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);

  useEffect(() => {
    if (!value) {
      setIsCustomMode(false);
      setCustom('');
      setError(null);
      return;
    }
    const isPreset = presets.some((p) => p.display === value);
    if (isPreset) {
      setIsCustomMode(false);
      setCustom('');
      setError(null);
    } else {
      setIsCustomMode(true);
      setCustom(value);
    }
  }, [value, presets]);

  useEffect(() => {
    if (isCustomMode && custom) {
      const r = parseWeightInput(custom, effectiveMode);
      if (!r.success) setError(r.error ?? 'Invalid weight.');
      else setError(null);
    }
  }, [effectiveMode, custom, isCustomMode]);

  const handleModeSwitch = (next: WeightMode) => {
    if (disabled) return;
    if (next === effectiveMode) return;
    setError(null);
    // Try to preserve canonical grams: 750g → 0.75kg
    if (value) {
      const parsed = parseWeightInput(value, effectiveMode);
      if (parsed.success && parsed.grams != null) {
        const grams = parsed.grams;
        const converted = formatWeight(grams, next);
        const check = parseWeightInput(converted, next);
        if (check.success) {
          setIsCustomMode(false);
          setCustom('');
          onModeChange(next);
          onChange(check.display ?? converted, grams, null);
          return;
        }
      }
    }
    setIsCustomMode(false);
    setCustom('');
    onModeChange(next);
    onChange(null, null, null);
  };

  const handlePreset = (display: string) => {
    const r = parseWeightInput(display, effectiveMode);
    if (!r.success) {
      setError(r.error ?? 'Invalid preset');
      onChange(null, null, r.error ?? 'Invalid');
      return;
    }
    setError(null);
    setIsCustomMode(false);
    setCustom('');
    onChange(r.display ?? display, r.grams ?? null, null);
  };

  const handleCustomChange = (raw: string) => {
    setCustom(raw);
    setIsCustomMode(true);
    if (!raw.trim()) {
      setError(null);
      onChange(null, null, null);
      return;
    }
    const r = parseWeightInput(raw, effectiveMode);
    if (!r.success) {
      setError(r.error ?? 'Invalid');
      onChange(raw, null, r.error ?? 'Invalid');
      return;
    }
    setError(null);
    onChange(r.display ?? raw, r.grams ?? null, null);
  };

  const selectedGrams = value ? (parseWeightInput(value, effectiveMode).grams ?? null) : null;
  const lineTotal =
    selectedGrams != null && effectivePrice > 0
      ? calculatePriceFromKg(effectivePrice, selectedGrams)
      : null;

  const placeholder = effectiveMode === 'GRAM' ? 'e.g. 200g' : 'e.g. 1.5kg';
  const modeLabel = effectiveMode;

  return (
    <div className="weight-selector" aria-label={`Weight selector ${modeLabel}`}>
      {/* Unit selector — GRAM | KG (customer mode, not product unit) */}
      <div
        role="group"
        aria-label="Unit mode"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          marginBottom: 8,
          width: '100%',
        }}
      >
        {(['GRAM', 'KG'] as WeightMode[]).map((m) => {
          const active = effectiveMode === m;
          return (
            <button
              key={m}
              type="button"
              disabled={!!disabled}
              aria-pressed={active}
              aria-label={`Select ${m}`}
              onClick={() => handleModeSwitch(m)}
              style={{
                minHeight: 30,
                padding: '6px 8px',
                borderRadius: 8,
                border: active
                  ? '1.5px solid var(--color-teal, #0f766e)'
                  : '1px solid rgba(7,21,38,0.12)',
                background: active ? 'var(--color-teal, #0f766e)' : '#fff',
                color: active ? '#fff' : 'var(--color-text-light-primary, #0B130F)',
                fontSize: '0.70rem',
                fontWeight: active ? 700 : 600,
                letterSpacing: '0.08em',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 150ms ease',
              }}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Presets for current mode */}
      <div
        className="weight-presets"
        role="group"
        aria-label="Preset weights"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${presets.length}, minmax(0, 1fr))`,
          gap: 6,
          width: '100%',
        }}
      >
        {presets.map((p) => {
          const active = value === p.display;
          return (
            <button
              key={p.display}
              type="button"
              disabled={!!disabled}
              aria-pressed={active}
              aria-label={`Select ${p.display}`}
              onClick={() => handlePreset(p.display)}
              style={{
                minHeight: 32,
                padding: '6px 4px',
                borderRadius: 8,
                border: active
                  ? '1.5px solid var(--color-teal, #0f766e)'
                  : '1px solid rgba(7,21,38,0.12)',
                background: active ? 'var(--color-teal, #0f766e)' : '#fff',
                color: active ? '#fff' : 'var(--color-text-light-primary, #0B130F)',
                fontSize: '0.74rem',
                fontWeight: active ? 700 : 600,
                letterSpacing: '0.04em',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
                lineHeight: 1,
              }}
            >
              {p.display.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Custom input */}
      <div style={{ marginTop: 8 }}>
        <label
          htmlFor={`custom-weight-${effectiveMode}`}
          style={{
            fontSize: '0.62rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#6C7E75',
            display: 'block',
            marginBottom: 4,
          }}
        >
          Custom ({modeLabel})
        </label>
        <input
          id={`custom-weight-${effectiveMode}`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          disabled={!!disabled}
          value={isCustomMode ? custom : ''}
          onChange={(e) => handleCustomChange(e.target.value)}
          onFocus={() => setIsCustomMode(true)}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? 'weight-error' : undefined}
          style={{
            width: '100%',
            height: 36,
            padding: '0 10px',
            borderRadius: 8,
            border: error ? '1.5px solid #EF4444' : '1px solid rgba(7,21,38,0.12)',
            background: disabled ? '#F8FAF9' : '#fff',
            fontSize: '0.84rem',
            color: '#0B130F',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ minHeight: 16, marginTop: 4 }}>
          {error ? (
            <div
              id="weight-error"
              role="alert"
              style={{ fontSize: 11, color: '#EF4444', lineHeight: 1.3 }}
            >
              {error}
            </div>
          ) : null}
        </div>
      </div>

      {/* Price preview — final selected price ONLY (weight already visible) — reserved 24px */}
      <div
        aria-live="polite"
        style={{
          minHeight: 24,
          marginTop: 4,
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          fontSize: '0.92rem',
          fontWeight: 800,
          color: 'var(--color-text-light-primary, #0B130F)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {lineTotal != null && !error ? (
          <span>₹{lineTotal}</span>
        ) : !value && !error ? (
          <span style={{ fontSize: 11, color: '#879A91', fontWeight: 400 }}>
            Select weight to see price
          </span>
        ) : (
          <span style={{ visibility: 'hidden' }}>₹0</span>
        )}
      </div>
    </div>
  );
}

import { describe, expect, it } from 'vitest';

import { formatDayLabel, formatShortDate } from './format';

describe('formatDayLabel', () => {
  it('formats a timestamp as a short weekday + day', () => {
    const label = formatDayLabel(new Date(2026, 7, 10, 12).getTime());
    expect(label).toContain('10');
  });

  it('produces distinct labels across days', () => {
    const a = formatDayLabel(new Date(2026, 7, 10).getTime());
    const b = formatDayLabel(new Date(2026, 7, 11).getTime());
    expect(a).not.toBe(b);
  });
});

describe('formatShortDate', () => {
  it('formats as day + short month', () => {
    const label = formatShortDate(new Date(2026, 7, 10, 9).getTime());
    expect(label).toContain('10');
  });
});

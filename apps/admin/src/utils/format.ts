import { formatCurrency, formatDate, formatTime } from '@oceanfresh/shared';

export { formatCurrency, formatDate, formatTime };

/** e.g. "Mon 3" for the 7-day revenue chart axis. */
export function formatDayLabel(ts: number): string {
  return new Date(ts).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
}

export function formatShortDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

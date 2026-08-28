import type { OrderStatus } from '@oceanfresh/shared';

import { colors } from '../theme';
import { AppText } from './AppText';

const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  DRAFT: { label: 'Draft', color: colors.muted, bg: colors.surface2, border: colors.border },
  VALIDATING: {
    label: 'Validating',
    color: '#FBBF24',
    bg: colors.goldDim,
    border: 'rgba(245,165,36,0.25)',
  },
  PENDING_PAYMENT: {
    label: 'Payment pending',
    color: '#FBBF24',
    bg: colors.goldDim,
    border: 'rgba(245,165,36,0.25)',
  },
  PAYMENT_FAILED: {
    label: 'Payment failed',
    color: '#F87171',
    bg: colors.warnDim,
    border: 'rgba(239,68,68,0.25)',
  },
  PAID: { label: 'Paid', color: colors.aqua, bg: colors.aquaDim, border: 'rgba(33,200,200,0.25)' },
  CONFIRMED: {
    label: 'Confirmed',
    color: colors.aqua,
    bg: colors.aquaDim,
    border: 'rgba(33,200,200,0.25)',
  },
  PROCESSING: {
    label: 'Processing',
    color: colors.aqua,
    bg: colors.aquaDim,
    border: 'rgba(33,200,200,0.25)',
  },
  PACKED: {
    label: 'Packed',
    color: colors.aqua,
    bg: colors.aquaDim,
    border: 'rgba(33,200,200,0.25)',
  },
  SHIPPED: {
    label: 'Shipped',
    color: '#4ADE80',
    bg: colors.greenDim,
    border: 'rgba(34,197,94,0.25)',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for delivery',
    color: '#4ADE80',
    bg: colors.greenDim,
    border: 'rgba(34,197,94,0.25)',
  },
  DELIVERED: {
    label: 'Delivered',
    color: '#4ADE80',
    bg: colors.greenDim,
    border: 'rgba(34,197,94,0.25)',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#F87171',
    bg: colors.warnDim,
    border: 'rgba(239,68,68,0.25)',
  },
  REFUND_REQUESTED: {
    label: 'Refund requested',
    color: '#FBBF24',
    bg: colors.goldDim,
    border: 'rgba(245,165,36,0.25)',
  },
  REFUNDED: {
    label: 'Refunded',
    color: '#F87171',
    bg: colors.warnDim,
    border: 'rgba(239,68,68,0.25)',
  },
  ARCHIVED: { label: 'Archived', color: colors.muted, bg: colors.surface2, border: colors.border },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.ARCHIVED;
  return (
    <span
      style={{
        color: meta.color,
        backgroundColor: meta.bg,
        border: `1px solid ${meta.border}`,
        padding: '3px 9px',
        borderRadius: 999,
        alignSelf: 'flex-start',
        whiteSpace: 'nowrap',
      }}
    >
      <AppText
        variant="label"
        style={{ color: meta.color, lineHeight: '18px', fontSize: 11, letterSpacing: 0.3 }}
      >
        {meta.label}
      </AppText>
    </span>
  );
}

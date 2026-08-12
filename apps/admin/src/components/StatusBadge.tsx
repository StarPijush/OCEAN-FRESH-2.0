import type { OrderStatus } from '@oceanfresh/shared';

import { colors } from '../theme';
import { AppText } from './AppText';

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Draft', color: colors.mutedBright, bg: colors.surface },
  VALIDATING: { label: 'Validating', color: colors.gold, bg: colors.goldDim },
  PENDING_PAYMENT: { label: 'Payment pending', color: colors.gold, bg: colors.goldDim },
  PAYMENT_FAILED: { label: 'Payment failed', color: colors.warn, bg: colors.warnDim },
  PAID: { label: 'Paid', color: colors.aqua, bg: colors.aquaDim },
  CONFIRMED: { label: 'Confirmed', color: colors.aqua, bg: colors.aquaDim },
  PROCESSING: { label: 'Processing', color: colors.aqua, bg: colors.aquaDim },
  PACKED: { label: 'Packed', color: colors.aqua, bg: colors.aquaDim },
  SHIPPED: { label: 'Shipped', color: colors.green, bg: colors.greenDim },
  OUT_FOR_DELIVERY: { label: 'Out for delivery', color: colors.green, bg: colors.greenDim },
  DELIVERED: { label: 'Delivered', color: colors.green, bg: colors.greenDim },
  CANCELLED: { label: 'Cancelled', color: colors.warn, bg: colors.warnDim },
  REFUND_REQUESTED: { label: 'Refund requested', color: colors.gold, bg: colors.goldDim },
  REFUNDED: { label: 'Refunded', color: colors.warn, bg: colors.warnDim },
  ARCHIVED: { label: 'Archived', color: colors.muted, bg: colors.surface },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.ARCHIVED;
  return (
    <span
      style={{
        color: meta.color,
        backgroundColor: meta.bg,
        padding: '4px 10px',
        borderRadius: 999,
        alignSelf: 'flex-start',
        whiteSpace: 'nowrap',
      }}
    >
      <AppText variant="label" style={{ color: meta.color, lineHeight: '18px' }}>
        {meta.label}
      </AppText>
    </span>
  );
}

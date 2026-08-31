import type { OrderStatus } from '@oceanfresh/shared';

const STATUS_META: Record<
  OrderStatus,
  { label: string; bg: string; color: string; border: string }
> = {
  DRAFT: {
    label: 'Draft',
    bg: 'rgba(255,255,255,0.06)',
    color: 'var(--color-muted2)',
    border: 'var(--color-border)',
  },
  VALIDATING: {
    label: 'Validating',
    bg: 'rgba(240,180,41,0.12)',
    color: 'var(--color-gold)',
    border: 'rgba(240,180,41,0.2)',
  },
  PENDING_PAYMENT: {
    label: 'Pending',
    bg: 'rgba(240,180,41,0.12)',
    color: 'var(--color-gold)',
    border: 'rgba(240,180,41,0.2)',
  },
  PAYMENT_FAILED: {
    label: 'Failed',
    bg: 'rgba(224,122,101,0.12)',
    color: 'var(--color-warn)',
    border: 'rgba(224,122,101,0.2)',
  },
  PAID: {
    label: 'Paid',
    bg: 'var(--color-aqua-dim)',
    color: 'var(--color-aqua)',
    border: 'rgba(74,184,193,0.2)',
  },
  CONFIRMED: {
    label: 'Confirmed',
    bg: 'var(--color-aqua-dim)',
    color: 'var(--color-aqua)',
    border: 'rgba(74,184,193,0.2)',
  },
  PROCESSING: {
    label: 'Processing',
    bg: 'var(--color-aqua-dim)',
    color: 'var(--color-aqua)',
    border: 'rgba(74,184,193,0.2)',
  },
  PACKED: {
    label: 'Packed',
    bg: 'var(--color-aqua-dim)',
    color: 'var(--color-aqua)',
    border: 'rgba(74,184,193,0.2)',
  },
  SHIPPED: {
    label: 'Shipped',
    bg: 'rgba(74,222,128,0.12)',
    color: 'var(--color-green)',
    border: 'rgba(74,222,128,0.2)',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for delivery',
    bg: 'rgba(74,222,128,0.12)',
    color: 'var(--color-green)',
    border: 'rgba(74,222,128,0.2)',
  },
  DELIVERED: {
    label: 'Delivered',
    bg: 'rgba(74,222,128,0.12)',
    color: 'var(--color-green)',
    border: 'rgba(74,222,128,0.2)',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'rgba(224,122,101,0.12)',
    color: 'var(--color-warn)',
    border: 'rgba(224,122,101,0.2)',
  },
  REFUND_REQUESTED: {
    label: 'Refund',
    bg: 'rgba(240,180,41,0.12)',
    color: 'var(--color-gold)',
    border: 'rgba(240,180,41,0.2)',
  },
  REFUNDED: {
    label: 'Refunded',
    bg: 'rgba(224,122,101,0.12)',
    color: 'var(--color-warn)',
    border: 'rgba(224,122,101,0.2)',
  },
  ARCHIVED: {
    label: 'Archived',
    bg: 'rgba(255,255,255,0.06)',
    color: 'var(--color-muted)',
    border: 'var(--color-border)',
  },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.ARCHIVED;
  return (
    <span
      style={{
        color: meta.color,
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        lineHeight: '14px',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {meta.label}
    </span>
  );
}

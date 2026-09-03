import type { OrderStatus } from '@oceanfresh/shared';

const STATUS_META: Record<
  OrderStatus,
  { label: string; bg: string; color: string; border: string }
> = {
  DRAFT: {
    label: 'Draft',
    bg: '#F8FAF9',
    color: '#6C7E75',
    border: 'rgba(11,19,15,0.06)',
  },
  VALIDATING: {
    label: 'Validating',
    bg: 'rgba(74,184,193,0.10)',
    color: '#0d2035',
    border: 'rgba(74,184,193,0.14)',
  },
  PENDING_PAYMENT: {
    label: 'Pending',
    bg: 'rgba(249,115,22,0.10)',
    color: '#F97316',
    border: 'rgba(249,115,22,0.14)',
  },
  PAYMENT_FAILED: {
    label: 'Failed',
    bg: 'rgba(239,68,68,0.10)',
    color: '#EF4444',
    border: 'rgba(239,68,68,0.14)',
  },
  PAID: {
    label: 'Paid',
    bg: 'rgba(34,197,94,0.10)',
    color: '#22C55E',
    border: 'rgba(34,197,94,0.14)',
  },
  CONFIRMED: {
    label: 'Confirmed',
    bg: 'rgba(34,197,94,0.10)',
    color: '#22C55E',
    border: 'rgba(34,197,94,0.14)',
  },
  PROCESSING: {
    label: 'Processing',
    bg: 'rgba(74,184,193,0.10)',
    color: '#0d2035',
    border: 'rgba(74,184,193,0.14)',
  },
  PACKED: {
    label: 'Packed',
    bg: 'rgba(74,184,193,0.10)',
    color: '#0d2035',
    border: 'rgba(74,184,193,0.14)',
  },
  SHIPPED: {
    label: 'Shipped',
    bg: 'rgba(34,197,94,0.10)',
    color: '#22C55E',
    border: 'rgba(34,197,94,0.14)',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for delivery',
    bg: 'rgba(34,197,94,0.10)',
    color: '#22C55E',
    border: 'rgba(34,197,94,0.14)',
  },
  DELIVERED: {
    label: 'Delivered',
    bg: 'rgba(34,197,94,0.10)',
    color: '#22C55E',
    border: 'rgba(34,197,94,0.14)',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'rgba(239,68,68,0.10)',
    color: '#EF4444',
    border: 'rgba(239,68,68,0.14)',
  },
  REFUND_REQUESTED: {
    label: 'Refund',
    bg: 'rgba(239,68,68,0.10)',
    color: '#EF4444',
    border: 'rgba(239,68,68,0.14)',
  },
  REFUNDED: {
    label: 'Refunded',
    bg: 'rgba(239,68,68,0.10)',
    color: '#EF4444',
    border: 'rgba(239,68,68,0.14)',
  },
  ARCHIVED: {
    label: 'Archived',
    bg: '#F8FAF9',
    color: '#6C7E75',
    border: 'rgba(11,19,15,0.06)',
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
        padding: '4px 10px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        lineHeight: '14px',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: 9999,
          background: 'currentColor',
          flexShrink: 0,
        }}
      />
      {meta.label}
    </span>
  );
}

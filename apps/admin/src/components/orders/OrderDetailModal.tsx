import { OrderStatus } from '@oceanfresh/shared';

import { getNextStatus, isCancellable, orderService, STATUS_LABELS } from '../../services';
import type { OrderData } from '../../types.js';
import { formatCurrency, formatDate, formatTime } from '../../utils/format.js';
import { useAdminContext } from '../layout/use-admin-context.js';
import { useAdminToast } from '../shared/use-admin-toast.js';

interface Props {
  order: OrderData;
  onClose: () => void;
  onUpdated: () => void;
}

export function OrderDetailModal({ order, onClose, onUpdated }: Props) {
  const { toast } = useAdminToast();
  const { setPendingCount } = useAdminContext();

  const handleStatusUpdate = async (status: OrderStatus) => {
    const { pendingCount } = await orderService.updateStatus(order.id, status);
    toast(`Order ${order.id} → ${STATUS_LABELS[status]}`, 'success');
    setPendingCount(pendingCount);
    onUpdated();
    onClose();
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Order Details</div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <div
            style={{
              fontSize: '.58rem',
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '3px',
            }}
          >
            Order ID
          </div>
          <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--aqua)' }}>{order.id}</div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '14px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '.58rem',
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '3px',
              }}
            >
              Customer
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--cream)' }}>{order.name}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--muted2)' }}>{order.phone}</div>
          </div>
          <div>
            <div
              style={{
                fontSize: '.58rem',
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '3px',
              }}
            >
              Date & Time
            </div>
            <div style={{ fontSize: '.82rem', color: 'var(--cream)' }}>{formatDate(order.ts)}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--muted2)' }}>{formatTime(order.ts)}</div>
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <div
            style={{
              fontSize: '.58rem',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '6px',
            }}
          >
            Delivery Address
          </div>
          <div style={{ fontSize: '.82rem', color: 'var(--cream)', lineHeight: 1.5 }}>
            {order.address}
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border)', margin: '14px 0' }} />

        <div
          style={{
            fontSize: '.58rem',
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '8px',
          }}
        >
          Items
        </div>
        {(order.items ?? []).map((it, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontSize: '.85rem', color: 'var(--cream)' }}>{it.name}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--muted2)' }}>
                {it.qty}kg × {formatCurrency(it.price)}
              </div>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--aqua)' }}>{formatCurrency(it.sub)}</div>
          </div>
        ))}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 0',
            fontWeight: 700,
            fontSize: '.95rem',
          }}
        >
          <span>Total</span>
          <span style={{ color: 'var(--aqua)' }}>{formatCurrency(order.total)}</span>
        </div>

        <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0 16px' }} />

        <div
          style={{
            fontSize: '.58rem',
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '8px',
          }}
        >
          Update Status
        </div>
        <div style={{ marginBottom: '10px', fontSize: '.85rem', color: 'var(--cream)' }}>
          Current: <strong style={{ color: 'var(--aqua)' }}>{STATUS_LABELS[order.status]}</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {nextStatus && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleStatusUpdate(nextStatus)}
            >
              {STATUS_LABELS[nextStatus]}
            </button>
          )}
          {isCancellable(order.status) && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => handleStatusUpdate(OrderStatus.CANCELLED)}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import type { Order } from '@oceanfresh/shared';
import { useNavigate } from 'react-router-dom';

import { colors, spacing } from '../../theme';
import { formatCurrency, formatTime } from '../../utils/format';
import { AppText } from '../AppText';
import { Card } from '../Card';
import { Skeleton } from '../Skeleton';
import { EmptyState } from '../StateViews';
import { StatusBadge } from '../StatusBadge';

interface RecentOrdersListProps {
  orders: Order[];
  isLoading: boolean;
  onViewAll: () => void;
}

export function RecentOrdersList({ orders, isLoading, onViewAll }: RecentOrdersListProps) {
  const navigate = useNavigate();

  const recentOrders = orders.slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: spacing.md,
            flexWrap: 'wrap',
          }}
        >
          <AppText variant="title">Recent Orders</AppText>
          <button type="button" className="of-btn" onClick={onViewAll}>
            <AppText variant="label" color="aqua">
              View All
            </AppText>
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.md,
            marginTop: spacing.lg,
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={40} />
          ))}
        </div>
      </Card>
    );
  }

  if (!recentOrders.length) {
    return (
      <Card>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: spacing.md,
            flexWrap: 'wrap',
          }}
        >
          <AppText variant="title">Recent Orders</AppText>
          <button type="button" className="of-btn" onClick={onViewAll}>
            <AppText variant="label" color="aqua">
              View All
            </AppText>
          </button>
        </div>
        <EmptyState title="No orders yet" hint="New orders will appear here." />
      </Card>
    );
  }

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: spacing.md,
          flexWrap: 'wrap',
        }}
      >
        <AppText variant="title">Recent Orders</AppText>
        <button type="button" className="of-btn" onClick={onViewAll}>
          <AppText variant="label" color="aqua">
            View All
          </AppText>
        </button>
      </div>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, marginTop: spacing.lg }}
      >
        {recentOrders.map((order) => (
          <button
            key={order.id}
            type="button"
            className="of-btn"
            onClick={() => navigate('/orders')}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: spacing.md,
              paddingTop: spacing.sm,
              paddingBottom: spacing.sm,
              borderBottom: `1px solid ${colors.border}`,
              width: '100%',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              <AppText variant="bodyMedium">{order.orderNumber}</AppText>
              <AppText variant="caption" color="muted">
                {formatTime(order.createdAt.getTime())} · {order.customerSnapshot?.name ?? 'Guest'}
              </AppText>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: spacing.xs,
              }}
            >
              <AppText variant="bodyMedium">
                {formatCurrency(order.totals?.grandTotal?.amount ?? 0)}
              </AppText>
              <StatusBadge status={order.status} />
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

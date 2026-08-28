import { STAT_GUTTER } from '../../theme';
import { formatCurrency } from '../../utils/format';
import { StatCard } from '../StatCard';

interface StatGridProps {
  stats: {
    todaySales: number;
    todayIncome: number;
    weekIncome: number;
    pendingOrders: number;
    totalOrders: number;
    totalIncome: number;
    availableProducts: number;
    totalProducts: number;
  };
}

export function StatGrid({ stats }: StatGridProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: -STAT_GUTTER,
        marginRight: -STAT_GUTTER,
        gap: STAT_GUTTER,
      }}
    >
      <StatCard
        label="Today's Sales"
        value={String(stats.todaySales)}
        tone="aqua"
        icon="cart-outline"
      />
      <StatCard
        label="Today's Income"
        value={formatCurrency(stats.todayIncome)}
        tone="green"
        icon="cash-outline"
      />
      <StatCard
        label="This Week"
        value={formatCurrency(stats.weekIncome)}
        tone="gold"
        icon="trending-up-outline"
      />
      <StatCard
        label="Pending Orders"
        value={String(stats.pendingOrders)}
        tone="warn"
        icon="time-outline"
      />
      <StatCard
        label="Total Orders"
        value={String(stats.totalOrders)}
        tone="muted"
        icon="receipt-outline"
      />
      <StatCard
        label="Total Revenue"
        value={formatCurrency(stats.totalIncome)}
        tone="green"
        icon="wallet-outline"
      />
      <StatCard
        label="Products Active"
        value={`${stats.availableProducts} / ${stats.totalProducts}`}
        tone="aqua"
        icon="fish-outline"
      />
    </div>
  );
}

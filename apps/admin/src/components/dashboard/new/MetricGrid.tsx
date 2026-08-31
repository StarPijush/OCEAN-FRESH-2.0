import { formatCurrency } from '../../../utils/format';
import { MetricCard } from './MetricCard';

interface MetricGridProps {
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

export function MetricGrid({ stats }: MetricGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}
    >
      <MetricCard
        label="Today's Sales"
        value={String(stats.todaySales)}
        tone="aqua"
        icon="cart-outline"
        hint={`${stats.todaySales} orders today`}
      />
      <MetricCard
        label="Today's Income"
        value={formatCurrency(stats.todayIncome)}
        tone="green"
        icon="cash-outline"
        hint="revenue"
      />
      <MetricCard
        label="Pending Orders"
        value={String(stats.pendingOrders)}
        tone="warn"
        icon="time-outline"
        hint="need action"
      />
      <MetricCard
        label="Total Orders"
        value={String(stats.totalOrders)}
        tone="muted"
        icon="receipt-outline"
        hint="all time"
      />
    </div>
  );
}

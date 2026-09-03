import { formatCurrency } from '../../../utils/format';
import { MetricCard } from './MetricCard';

interface MetricGridProps {
  stats: {
    pendingOrders: number;
    totalOrders: number;
    totalIncome: number;
  };
  width: number;
}

export function MetricGrid({ stats, width }: MetricGridProps) {
  const isCompact = width < 375;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minWidth: 0,
        maxWidth: 400,
        width: '100%',
        alignSelf: 'stretch',
      }}
    >
      {/* Hero — Total Sales — primary metric (§8): uses existing totalIncome, no new calc */}
      <MetricCard
        label="Total Sales"
        value={formatCurrency(stats.totalIncome)}
        tone="aqua"
        icon="wallet-outline"
        hint="from paid orders"
        isLead
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isCompact ? '1fr' : 'repeat(2, minmax(0, 1fr))',
          gap: 12,
          minWidth: 0,
        }}
      >
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
    </div>
  );
}

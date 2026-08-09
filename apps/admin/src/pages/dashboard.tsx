import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ChartCard } from '../components/dashboard/ChartCard';
import { RecentOrdersWidget } from '../components/dashboard/RecentOrdersWidget';
import { StatCard } from '../components/dashboard/StatCard';
import { TopProducts } from '../components/dashboard/TopProducts';
import { useAdminContext } from '../components/layout/use-admin-context.js';
import { statsService } from '../services';
import type { DashboardStats } from '../types.js';
import { formatCurrency } from '../utils/format.js';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setPendingCount } = useAdminContext();

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    statsService
      .getDashboardStats()
      .then((s) => {
        setStats(s);
        setPendingCount(s.pendingOrders);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [setPendingCount]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div id="panel-dashboard" className="admin-panel active">
        <div className="panel-header">
          <div className="panel-eyebrow">OceanFresh</div>
          <h1 className="panel-title">Dashboard</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <p className="empty-title">Could not load dashboard</p>
          <p className="empty-text">{error}</p>
          <button className="btn btn-primary" onClick={load} type="button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div id="panel-dashboard" className="admin-panel active">
        <div className="panel-header">
          <div className="panel-eyebrow">OceanFresh</div>
          <h1 className="panel-title">Dashboard</h1>
          <p className="panel-sub">Your shop at a glance — today&apos;s performance and trends.</p>
        </div>
        <div className="empty-state">
          <div className="spinner" aria-label="Loading dashboard" />
          <p className="empty-text">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const s = stats;

  return (
    <div id="panel-dashboard" className="admin-panel active">
      <div className="panel-header">
        <div className="panel-eyebrow">OceanFresh</div>
        <h1 className="panel-title">Dashboard</h1>
        <p className="panel-sub">Your shop at a glance — today&apos;s performance and trends.</p>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Today's Sales"
          value={s ? String(s.todaySales) : '—'}
          delta="orders today"
          deltaType="neu"
          icon="🛒"
        />
        <StatCard
          label="Today's Income"
          value={s ? formatCurrency(s.todayIncome) : '—'}
          delta="↑ revenue"
          deltaType="up"
          icon="💰"
        />
        <StatCard
          label="This Week"
          value={s ? formatCurrency(s.weekIncome ?? 0) : '—'}
          delta="7-day income"
          deltaType="neu"
          icon="📅"
        />
        <StatCard
          label="Pending Orders"
          value={s ? String(s.pendingOrders) : '—'}
          delta="need action"
          deltaType="down"
          icon="⏳"
        />
      </div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <StatCard
          label="Total Orders"
          value={s ? String(s.totalOrders) : '—'}
          delta="all time"
          deltaType="neu"
          icon="📊"
        />
        <StatCard
          label="Total Revenue"
          value={s ? formatCurrency(s.totalIncome) : '—'}
          delta="all time"
          deltaType="up"
          icon="📈"
        />
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div className="stat-card-label">Products Active</div>
          <div className="stat-card-value" id="stat-products">
            {s ? `${s.availableProducts}/${s.totalProducts}` : '—'}
          </div>
          <div className="stat-card-delta delta-neu">available / total</div>
          <div className="stat-card-icon">🐟</div>
        </div>
      </div>

      {s?.chart && <ChartCard data={s.chart} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <div className="table-card">
          <div className="table-head">
            <div className="table-head-title">Top Products · This Month</div>
          </div>
          <TopProducts items={s?.topProducts} />
        </div>

        <div className="table-card">
          <div className="table-head">
            <div className="table-head-title">Recent Orders</div>
            <Link to="/orders" className="btn btn-ghost btn-sm">
              View All
            </Link>
          </div>
          <div className="table-row header-row">
            <div className="col-id">Order ID</div>
            <div className="col-cust">Customer</div>
            <div className="col-total">Amount</div>
            <div className="col-ostatus">Status</div>
          </div>
          <RecentOrdersWidget orders={s?.recentOrders ?? []} />
        </div>
      </div>
    </div>
  );
}

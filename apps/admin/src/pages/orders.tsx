import { useEffect, useState, useCallback } from 'react';
import { orderRepository } from '../repositories';
import type { OrderData } from '../repositories/types';
import { Badge } from '../components/shared/Badge';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';

const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (ts: number) => new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<OrderData | null>(null);

  const load = useCallback(async () => {
    const list = await orderRepository.getAll();
    setOrders(list);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.phone.includes(q);
    }
    return true;
  });

  const filterBtns = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'delivered', label: 'Delivered' },
  ];

  return (
    <div id="panel-orders" className="admin-panel active">
      <div className="panel-header">
        <div className="panel-eyebrow">Order Management</div>
        <h1 className="panel-title">Orders</h1>
      </div>

      <div className="flex-between" style={{ marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div className="search-bar" style={{ maxWidth: '240px' }}>
          <span className="search-bar-icon">🔍</span>
          <input
            className="search-bar-inp"
            type="text"
            placeholder="Search by name, ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span id="order-count" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {filterBtns.map(btn => (
          <button
            key={btn.id}
            className={`btn btn-sm order-filter-btn ${filter === btn.id ? 'active' : 'btn-ghost'}`}
            onClick={() => setFilter(btn.id)}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-row header-row">
          <div className="col-id">Order ID</div>
          <div className="col-cust">Customer</div>
          <div className="col-total">Amount</div>
          <div className="col-ostatus">Status</div>
          <div className="col-date">Date</div>
        </div>

        <div id="orders-tbody">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 16px' }}>
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">No orders found</div>
            </div>
          ) : (
            filtered.map(o => (
              <div
                key={o.id}
                className="table-row"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(o)}
              >
                <div className="col-id">{o.id}</div>
                <div className="col-cust">
                  <div className="cell-name-main">{o.name}</div>
                  <div className="cell-name-sub">{o.phone}</div>
                </div>
                <div className="col-total">{fmt(o.total)}</div>
                <div className="col-ostatus"><Badge status={o.status} /></div>
                <div className="col-date">
                  {fmtDate(o.ts)}<br />
                  <span style={{ fontSize: '.6rem', color: 'var(--muted)' }}>{fmtTime(o.ts)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onUpdated={load}
        />
      )}
    </div>
  );
}

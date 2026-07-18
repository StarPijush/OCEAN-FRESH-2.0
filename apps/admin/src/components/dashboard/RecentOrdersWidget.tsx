import { useNavigate } from 'react-router-dom';
import { Badge } from '../shared/Badge';
import type { OrderData } from '../../repositories/types';

interface Props {
  orders: OrderData[];
}

const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

export function RecentOrdersWidget({ orders }: Props) {
  const navigate = useNavigate();

  if (orders.length === 0) {
    return (
      <div style={{ padding: '16px', color: 'var(--muted)', fontSize: '.78rem' }}>
        No orders yet
      </div>
    );
  }

  return (
    <>
      {orders.map(o => (
        <div key={o.id} className="table-row">
          <div className="col-id">{o.id}</div>
          <div className="col-cust">
            <div className="cell-name-main">{o.name}</div>
            <div className="cell-name-sub">{o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}</div>
          </div>
          <div className="col-total">{fmt(o.total)}</div>
          <div className="col-ostatus"><Badge status={o.status} /></div>
        </div>
      ))}
    </>
  );
}

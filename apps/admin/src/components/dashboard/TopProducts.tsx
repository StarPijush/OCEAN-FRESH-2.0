interface Props {
  items?: { name: string; qty: number }[];
}

export function TopProducts({ items }: Props) {
  if (!items || items.length === 0 || !items[0]) {
    return (
      <div className="empty-state-sub" style={{ padding: '16px', color: 'var(--muted)' }}>
        No data yet
      </div>
    );
  }

  const max = items[0].qty || 1;

  return (
    <div style={{ padding: '0 16px' }}>
      {items.map((p, i) => (
        <div key={p.name} className="top-prod-item">
          <div className="top-prod-rank">{i + 1}</div>
          <div className="top-prod-name">{p.name}</div>
          <div className="top-prod-bar-wrap">
            <div
              className="top-prod-bar"
              style={{ width: `${Math.round((p.qty / max) * 100)}%` }}
            />
          </div>
          <div className="top-prod-qty">{p.qty}kg</div>
        </div>
      ))}
    </div>
  );
}

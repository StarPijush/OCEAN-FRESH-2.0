interface Props {
  label: string;
  value: string;
  delta: string;
  deltaType: 'up' | 'down' | 'neu';
  icon: string;
}

export function StatCard({ label, value, delta, deltaType, icon }: Props) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      <div className={`stat-card-delta delta-${deltaType}`}>{delta}</div>
      <div className="stat-card-icon">{icon}</div>
    </div>
  );
}

interface Props {
  status: string;
}

const map: Record<string, string> = {
  delivered: 'badge-green',
  pending: 'badge-gold',
  preparing: 'badge-aqua',
};

export function Badge({ status }: Props) {
  return <span className={`badge ${map[status] || 'badge-muted'}`}>{status}</span>;
}

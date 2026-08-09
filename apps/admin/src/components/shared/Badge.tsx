interface Props {
  status: string;
  label?: string;
}

const map: Record<string, string> = {
  VALIDATING: 'badge-gold',
  CONFIRMED: 'badge-aqua',
  PROCESSING: 'badge-aqua',
  OUT_FOR_DELIVERY: 'badge-aqua',
  DELIVERED: 'badge-green',
  CANCELLED: 'badge-muted',
};

export function Badge({ status, label }: Props) {
  return <span className={`badge ${map[status] || 'badge-muted'}`}>{label ?? status}</span>;
}

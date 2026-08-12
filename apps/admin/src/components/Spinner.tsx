import { colors } from '../theme';

interface SpinnerProps {
  size?: number;
  color?: string;
}

/** CSS-only loading spinner (ActivityIndicator replacement). */
export function Spinner({ size = 20, color = colors.mutedBright }: SpinnerProps) {
  return (
    <span
      className="of-spinner"
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size, color }}
    />
  );
}

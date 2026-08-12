import type { CSSProperties } from 'react';

import { radius } from '../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radiusValue?: number;
  style?: CSSProperties;
}

/** Pulsing placeholder used while data loads. */
export function Skeleton({
  width = '100%',
  height = 14,
  radiusValue = radius.sm,
  style,
}: SkeletonProps) {
  return (
    <div className="of-skeleton" style={{ width, height, borderRadius: radiusValue, ...style }} />
  );
}

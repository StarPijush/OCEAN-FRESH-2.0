import { colors } from '../theme';
import { AppText } from './AppText';

interface BrandMarkProps {
  size?: number;
}

export function BrandMark({ size = 48 }: BrandMarkProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 5,
        backgroundColor: colors.aqua,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText
        variant="display"
        style={{
          fontSize: size * 0.42,
          lineHeight: `${size * 0.52}px`,
          fontFamily: 'Cormorant Garamond',
          color: colors.bg,
        }}
      >
        OF
      </AppText>
    </div>
  );
}

import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';
import { AppText } from './AppText';

interface BrandMarkProps {
  size?: number;
}

export function BrandMark({ size = 48 }: BrandMarkProps) {
  return (
    <View
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderRadius: size / 5,
        },
      ]}
    >
      <AppText
        variant="display"
        style={{
          fontSize: size * 0.42,
          lineHeight: size * 0.52,
          fontFamily: 'CormorantGaramond_600SemiBold',
          color: colors.bg,
        }}
      >
        OF
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: colors.aqua,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

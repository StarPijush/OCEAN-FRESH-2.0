import { colors } from '../theme';
import { Spinner } from './Spinner';

/** Full-screen loader shown while the admin session is being resolved. */
export function SplashScreen() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
      }}
    >
      <Spinner size={32} color={colors.aqua} />
    </div>
  );
}

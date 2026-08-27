import type { ReactNode } from 'react';

import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';

interface AuthCardProps {
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}

/**
 * Reference editorial auth shell: subtle gradient + grid backdrop and a
 * compact centered card with the serif wordmark, eyebrow and title.
 */
export function AuthCard({ eyebrow, title, subtitle, children }: AuthCardProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: colors.bg,
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(74,184,193,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(74,184,193,0.04) 0%, transparent 50%)',
        }}
      />
      {/* Fine grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div
        className="of-auth-card"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 400,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.borderStrong}`,
          borderRadius: radius.md,
          padding: '40px 36px',
        }}
      >
        <AppText
          variant="title"
          style={{
            fontSize: '1.5rem',
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.cream,
            marginBottom: 4,
          }}
        >
          Ocean
          <AppText
            variant="title"
            style={{
              fontSize: '1.5rem',
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.aqua,
            }}
          >
            Fresh
          </AppText>
        </AppText>
        <AppText
          variant="caption"
          color="muted"
          style={{
            fontSize: '0.6rem',
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontWeight: 500,
            marginBottom: spacing.xxl,
          }}
        >
          {eyebrow}
        </AppText>
        <AppText
          variant="heading"
          style={{ fontSize: '1.7rem', color: colors.cream, marginBottom: 6 }}
        >
          {title}
        </AppText>
        <AppText
          variant="body"
          color="mutedBright"
          style={{ fontSize: '0.78rem', lineHeight: 1.6, marginBottom: spacing.xl }}
        >
          {subtitle}
        </AppText>
        {children}
      </div>
    </div>
  );
}

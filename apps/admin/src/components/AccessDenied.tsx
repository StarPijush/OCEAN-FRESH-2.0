import { BrandMark } from './ui/new/BrandMark';
import { Button } from './ui/new/Button';

export function AccessDenied({
  onSignOut,
  signingOut = false,
}: {
  onSignOut: () => void;
  signingOut?: boolean;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border2)',
          borderRadius: 12,
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          textAlign: 'center',
        }}
      >
        <BrandMark size="lg" />
        <div
          style={{
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            fontWeight: 600,
          }}
        >
          Admin Panel · Access Denied
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 400,
            color: 'var(--color-cream)',
            textAlign: 'center',
          }}
        >
          No admin access
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--color-muted2)',
            lineHeight: 1.6,
            textAlign: 'center',
          }}
        >
          Your account is not registered as an administrator in admin_profiles, or your role is not
          granted admin access.
        </div>
        <Button variant="primary" fullWidth loading={signingOut} onClick={onSignOut}>
          Sign in with a different account
        </Button>
      </div>
    </div>
  );
}

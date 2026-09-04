export function NotFoundPage() {
  return (
    <div
      className="page active"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        minHeight: '70vh',
        padding: '48px 24px',
        textAlign: 'center',
        background: 'var(--color-navy-deep)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle wave decoration */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '120px',
          opacity: 0.06,
          pointerEvents: 'none',
        }}
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
          fill="var(--color-teal)"
        />
      </svg>

      {/* Brand wordmark */}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.75rem',
          fontWeight: 300,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: '32px',
        }}
      >
        OceanFresh
      </span>

      {/* 404 display */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(5rem, 15vw, 9rem)',
          fontWeight: 300,
          lineHeight: 1,
          color: 'var(--color-text-heading)',
          margin: 0,
          letterSpacing: '-0.02em',
        }}
      >
        404
      </h1>

      {/* Label */}
      <span
        style={{
          fontSize: '0.65rem',
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-teal)',
          marginTop: '16px',
          marginBottom: '12px',
        }}
      >
        Page Not Found
      </span>

      {/* Description */}
      <p
        style={{
          fontSize: '0.875rem',
          lineHeight: 1.6,
          color: 'var(--color-text-secondary)',
          maxWidth: '360px',
          margin: '0 auto 36px',
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
          width: '100%',
          maxWidth: '240px',
        }}
      >
        {/* Primary: RELOAD — real browser reload */}
        <button
          onClick={() => window.location.reload()}
          style={{
            width: '100%',
            padding: '14px 32px',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-navy-deep)',
            background: 'var(--color-teal)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background 150ms ease, transform 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-teal-hover)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-teal)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Reload
        </button>

        {/* Secondary: GO HOME — standard link, full navigation */}
        <a
          href="/"
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.05em',
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            padding: '8px',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

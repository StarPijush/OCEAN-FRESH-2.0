export function NotFoundPage() {
  return (
    <div
      id="page-not-found"
      className="page active"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        minHeight: '68vh',
        padding: '56px 20px calc(56px + env(safe-area-inset-bottom, 0px))',
        textAlign: 'center',
        background: 'var(--color-navy-deep)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100px',
          opacity: 0.04,
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

      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.58rem',
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: '28px',
        }}
      >
        OceanFresh
      </span>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(4.8rem, 14vw, 8.5rem)',
          fontWeight: 300,
          lineHeight: 0.9,
          color: 'var(--color-text-heading)',
          margin: 0,
          letterSpacing: '-0.03em',
          textWrap: 'balance',
        }}
      >
        404
      </h1>

      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.60rem',
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--color-teal)',
          marginTop: '14px',
          marginBottom: '12px',
        }}
      >
        Page Not Found
      </span>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.84rem',
          lineHeight: 1.65,
          color: 'var(--color-text-secondary)',
          maxWidth: '32ch',
          margin: '0 auto 32px',
          textWrap: 'pretty',
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
          width: '100%',
          maxWidth: '260px',
        }}
      >
        <button
          onClick={() => window.location.reload()}
          className="btn btn-teal"
          style={{
            width: '100%',
            minHeight: 44,
            padding: '12px 28px',
            fontSize: '0.70rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            borderRadius: '4px',
          }}
        >
          Reload
        </button>

        <a
          href="/"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.72rem',
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 16px',
            transition: 'color 150ms var(--ease-out)',
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

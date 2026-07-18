export function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', padding: '32px 24px' }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.4rem',
        fontWeight: 300,
        color: 'var(--cream)',
        letterSpacing: '0.08em',
        marginBottom: '12px',
      }}>
        OceanFresh
      </div>
      <div style={{
        fontSize: '0.68rem',
        color: 'rgba(245,240,232,0.3)',
        letterSpacing: '0.1em',
        lineHeight: 2,
      }}>
        Shop No. 12, Main Market<br />Jhargram, West Bengal 721507<br />hello@oceanfresh.in
      </div>
      <div style={{
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        fontSize: '0.6rem',
        color: 'rgba(245,240,232,0.2)',
        letterSpacing: '0.12em',
      }}>
        &copy; 2025 OceanFresh &middot; All rights reserved
      </div>
    </footer>
  );
}

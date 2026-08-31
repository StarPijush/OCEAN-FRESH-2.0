import { Component, type ErrorInfo, type ReactNode } from 'react';

import { BrandMark } from './ui/new/BrandMark';
import { Button } from './ui/new/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Render error caught:', error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = import.meta.env.DEV;
      const err = this.state.error;

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
              maxWidth: 480,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border2)',
              borderRadius: 12,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
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
              OceanFresh Admin
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 400,
                color: 'var(--color-cream)',
                textAlign: 'center',
              }}
            >
              Something went wrong
            </div>
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-muted2)',
                lineHeight: 1.6,
                textAlign: 'center',
              }}
            >
              The admin panel encountered an unexpected error and couldn&apos;t render this page.
            </div>

            {isDev && err && (
              <details style={{ width: '100%', marginBottom: 8, textAlign: 'left' }}>
                <summary
                  style={{ cursor: 'pointer', color: 'var(--color-warn)', fontSize: '0.75rem' }}
                >
                  Development Details (click to expand)
                </summary>
                <pre
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: 'var(--color-bg)',
                    borderRadius: 8,
                    fontSize: '0.65rem',
                    overflow: 'auto',
                    maxHeight: 300,
                    color: 'var(--color-muted2)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {err.message}
                  {err.stack ? '\n\n' + err.stack : ''}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <Button variant="primary" fullWidth onClick={this.handleRetry}>
                Try Again
              </Button>
              <Button variant="ghost" fullWidth onClick={this.handleReload}>
                Reload Page
              </Button>
            </div>

            <div
              style={{
                fontSize: 11,
                color: 'var(--color-muted)',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              If this persists, check the browser console for details.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

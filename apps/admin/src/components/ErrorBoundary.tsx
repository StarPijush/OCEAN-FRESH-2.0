import { Component, type ErrorInfo, type ReactNode } from 'react';

import { colors, spacing } from '../theme';
import { AppText } from './AppText';
import { BrandMark } from './BrandMark';
import { Button } from './Button';

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
            backgroundColor: colors.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: 12,
              padding: spacing.xl,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: spacing.md,
            }}
          >
            <BrandMark size={48} />
            <AppText
              variant="label"
              color="mutedBright"
              style={{ letterSpacing: 1.5, textTransform: 'uppercase' }}
            >
              OceanFresh Admin
            </AppText>
            <AppText variant="heading" style={{ textAlign: 'center' }}>
              Something went wrong
            </AppText>
            <AppText
              variant="body"
              color="mutedBright"
              style={{ textAlign: 'center', lineHeight: '22px', marginBottom: spacing.sm }}
            >
              The admin panel encountered an unexpected error and couldn&apos;t render this page.
            </AppText>

            {isDev && err && (
              <details style={{ width: '100%', marginBottom: spacing.md, textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: colors.warn, fontSize: '0.75rem' }}>
                  Development Details (click to expand)
                </summary>
                <pre
                  style={{
                    marginTop: spacing.md,
                    padding: spacing.md,
                    background: colors.bg,
                    borderRadius: 8,
                    fontSize: '0.65rem',
                    overflow: 'auto',
                    maxHeight: 300,
                    color: colors.mutedBright,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {err.message}
                  {err.stack ? '\n\n' + err.stack : ''}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', flexDirection: 'row', gap: spacing.md, width: '100%' }}>
              <Button label="Try Again" fullWidth variant="primary" onPress={this.handleRetry} />
              <Button
                label="Reload Page"
                fullWidth
                variant="secondary"
                onPress={this.handleReload}
              />
            </div>

            <AppText
              variant="caption"
              color="muted"
              style={{ textAlign: 'center', marginTop: spacing.sm }}
            >
              If this persists, check the browser console for details.
            </AppText>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { type ReactNode, useEffect, useRef } from 'react';

import { useBreakpoint } from '../hooks/use-breakpoint';
import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon } from './Icon';

function useDialog(
  visible: boolean,
  onClose: () => void,
  dialogRef: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    const previousActive = document.activeElement as HTMLElement | null;
    // Defer focus until the element is mounted/visible.
    requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previousActive?.focus();
    };
  }, [visible, onClose, dialogRef]);
}

/**
 * Responsive modal container:
 *  - Mobile (< tablet): bottom sheet that slides up, scrollable, safe-area aware.
 *  - Tablet/desktop: centered dialog with a sensible max width.
 */
export function ActionSheet({
  visible,
  title,
  onClose,
  children,
  /** Sticky bar rendered below the scrollable body (e.g. Save/Cancel). */
  footer,
  /** Desktop width cap; ignored on mobile. */
  maxWidth = 560,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
}) {
  const { isTablet } = useBreakpoint();
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialog(visible, onClose, dialogRef);

  if (!visible) return null;

  return (
    <div className="of-modal">
      <div className="of-modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={isTablet ? 'of-modal-dialog' : 'of-modal-sheet'}
        style={{ maxWidth: isTablet ? maxWidth : undefined }}
      >
        {!isTablet ? <div className="of-modal-handle" /> : null}
        <div style={styles.head}>
          <AppText variant="title" style={styles.title}>
            {title}
          </AppText>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="of-btn"
            style={styles.close}
          >
            <Icon name="close" size={20} color={colors.mutedBright} />
          </button>
        </div>
        <div className="of-modal-body" style={styles.body}>
          {children}
        </div>
        {footer ? <div style={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialog(visible, onClose, dialogRef);

  if (!visible) return null;

  return (
    <div className="of-modal">
      <div className="of-modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="of-modal-dialog"
        style={{
          width: '92%',
          maxWidth: 460,
          padding: spacing.xl,
          gap: spacing.md,
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppText variant="title">{title}</AppText>
        <AppText variant="body" color="mutedBright" style={{ lineHeight: '22px' }}>
          {message}
        </AppText>
        <div
          style={{ display: 'flex', flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}
        >
          <Button label={cancelLabel} variant="ghost" onPress={onClose} style={{ flex: 1 }} />
          <Button
            label={confirmLabel}
            variant={danger ? 'danger' : 'primary'}
            loading={loading}
            onPress={onConfirm}
            style={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  head: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: `${spacing.lg}px ${spacing.xl}px ${spacing.sm}px`,
  },
  title: { flex: 1 },
  close: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlive,
    border: 'none',
    color: colors.mutedBright,
  },
  body: {
    padding: `${spacing.sm}px ${spacing.xl}px ${spacing.xl}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.md,
    borderTop: `1px solid ${colors.border}`,
    paddingTop: spacing.md,
    paddingLeft: spacing.xl,
    paddingRight: spacing.xl,
    paddingBottom: spacing.md,
  },
} as const;

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'default' | 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      show: (message: string, type: ToastType = 'default', _duration?: number) => {
        if (typeof window !== 'undefined') {
          console.warn(`[Toast:${type}] ${message} (no provider)`);
        }
      },
      dismiss: () => {},
    } satisfies ToastContextValue;
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = 'default', duration = 2800) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts
      .map((t) =>
        t.duration && t.duration > 0 ? setTimeout(() => dismiss(t.id), t.duration) : null,
      )
      .filter((t): t is ReturnType<typeof setTimeout> => t !== null);
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [toasts, dismiss]);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      {createPortal(
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 500,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none',
            padding: '0 16px',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
            boxSizing: 'border-box',
          }}
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const typeStyles: Record<ToastType, React.CSSProperties> = {
    default: { borderLeftColor: '#4ab8c1' },
    success: { borderLeftColor: '#22C55E' },
    error: { borderLeftColor: '#EF4444' },
    info: { borderLeftColor: '#0d2035' },
  };

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#FFFFFF',
        color: '#0B130F',
        border: '1px solid rgba(11,19,15,0.06)',
        padding: '12px 16px 12px 18px',
        borderRadius: 14,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        maxWidth: 'min(90vw, 360px)',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        boxShadow: '0 10px 30px rgba(11,19,15,0.08)',
        borderLeft: '3px solid',
        opacity: visible ? (exiting ? 0 : 1) : 0,
        transform: visible ? (exiting ? 'translateY(12px)' : 'translateY(0)') : 'translateY(12px)',
        transition: 'all 300ms var(--ease-out)',
        pointerEvents: 'auto',
        ...typeStyles[toast.type],
      }}
      role="status"
      aria-live="polite"
    >
      <span style={{ minWidth: 0, flex: 1 }}>{toast.message}</span>
      <button
        onClick={handleDismiss}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: 9999,
          border: 'none',
          background: '#F8FAF9',
          color: '#6C7E75',
          cursor: 'pointer',
          padding: 0,
          lineHeight: 1,
          marginLeft: 8,
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

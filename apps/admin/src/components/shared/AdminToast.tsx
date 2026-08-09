import { type ReactNode, useCallback, useRef, useState } from 'react';

import { ToastContext } from './toast-context.js';

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const [type, setType] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toast = useCallback((message: string, toastType: '' | 'success' | 'error' = '') => {
    setMsg(message);
    setType(toastType);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        id="admin-toast"
        className={`${visible ? 'show' : ''} ${type}`.trim()}
        role="status"
        aria-live="polite"
      >
        {msg}
      </div>
    </ToastContext.Provider>
  );
}

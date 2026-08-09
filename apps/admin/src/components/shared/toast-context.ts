import { createContext } from 'react';

export interface ToastContextValue {
  toast: (msg: string, type?: '' | 'success' | 'error') => void;
}

export const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

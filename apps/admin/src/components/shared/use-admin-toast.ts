import { useContext } from 'react';

import { ToastContext } from './toast-context.js';

export function useAdminToast() {
  return useContext(ToastContext);
}

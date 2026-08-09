import { type ReactNode, useState } from 'react';

import { AdminContext, type AdminContextValue } from './admin-context.js';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  const value: AdminContextValue = { pendingCount, setPendingCount };
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

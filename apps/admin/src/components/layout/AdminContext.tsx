import { createContext, type ReactNode, useContext, useState } from 'react';

interface AdminContextValue {
  pendingCount: number;
  setPendingCount: (n: number) => void;
}

const AdminContext = createContext<AdminContextValue>({
  pendingCount: 0,
  setPendingCount: () => {},
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  return (
    <AdminContext.Provider value={{ pendingCount, setPendingCount }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  return useContext(AdminContext);
}

import { createContext } from 'react';

export interface AdminContextValue {
  pendingCount: number;
  setPendingCount: (n: number) => void;
}

export const AdminContext = createContext<AdminContextValue>({
  pendingCount: 0,
  setPendingCount: () => {},
});

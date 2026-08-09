import { useContext } from 'react';

import { AdminContext } from './admin-context.js';

export function useAdminContext() {
  return useContext(AdminContext);
}

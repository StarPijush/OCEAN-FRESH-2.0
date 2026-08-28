import type { UserIdentity } from '@oceanfresh/shared';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SupabaseAuthProvider } from '../providers/index.js';
import { type AdminProfile, getAuthRepository } from '../repository/index.js';

export type AdminSessionStatus = 'loading' | 'unauthenticated' | 'authenticated' | 'error';

export interface AdminSessionState {
  status: AdminSessionStatus;
  user: UserIdentity | null;
  adminProfile: AdminProfile | null;
  isAdmin: boolean;
  error: string | null;
  retry: () => void;
}

const INITIAL_STATE: AdminSessionState = {
  status: 'loading',
  user: null,
  adminProfile: null,
  isAdmin: false,
  error: null,
  retry: () => void 0,
};

/**
 * Single source of truth for the admin session. Subscribes to Supabase Auth
 * (persistent session, automatic refresh) and resolves the caller's role by
 * looking up their admin_profiles row through the registered IAuthRepository.
 *
 * Requires `registerAuthRepository()` in the app bootstrap.
 *
 * State lifecycle:
 *   loading         → session is being resolved; guards MUST NOT redirect.
 *   unauthenticated → Supabase confirmed there is no session.
 *   authenticated   → Supabase session resolved; isAdmin reflects the
 *                     admin_profiles role. A null profile (or non-admin role)
 *                     yields authenticated + isAdmin=false so the guard can
 *                     deny access without treating the user as logged out.
 *   error           → session could not be resolved (network / profile
 *                     lookup failure). This is NOT unauthenticated; guards
 *                     must not redirect to /login from this state.
 */
export function useAdminSession(): AdminSessionState {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<AdminSessionState>(INITIAL_STATE);
  const refreshInProgressRef = useRef(false);

  const retry = useCallback(() => {
    setReloadKey((key) => key + 1);
    setState(INITIAL_STATE);
  }, []);

  useEffect(() => {
    const provider = new SupabaseAuthProvider();
    let mounted = true;

    const refresh = async (): Promise<void> => {
      if (refreshInProgressRef.current) {
        return;
      }
      refreshInProgressRef.current = true;

      try {
        let user: UserIdentity | null;
        try {
          user = await provider.getCurrentUser();
        } catch (err) {
          if (!mounted) return;
          setState({
            status: 'error',
            user: null,
            adminProfile: null,
            isAdmin: false,
            error: (err as Error).message ?? 'Failed to resolve the current session',
            retry,
          });
          return;
        }

        if (!user) {
          if (mounted) {
            setState({
              status: 'unauthenticated',
              user: null,
              adminProfile: null,
              isAdmin: false,
              error: null,
              retry,
            });
          }
          return;
        }

        let adminProfile: AdminProfile | null;
        try {
          const repository = getAuthRepository();
          adminProfile = await repository.getAdminProfile(user.id);
        } catch (err) {
          if (!mounted) return;
          setState({
            status: 'error',
            user,
            adminProfile: null,
            isAdmin: false,
            error: (err as Error).message ?? 'Failed to resolve admin profile',
            retry,
          });
          return;
        }

        const isAdmin =
          adminProfile !== null &&
          (adminProfile.role === 'admin' || adminProfile.role === 'super_admin');

        if (mounted) {
          setState({
            status: 'authenticated',
            user,
            adminProfile,
            isAdmin,
            error: null,
            retry,
          });
        }
      } finally {
        refreshInProgressRef.current = false;
      }
    };

    void refresh();
    const unsubscribe = provider.observeAuthState(() => {
      void refresh();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [reloadKey, retry]);

  return state;
}

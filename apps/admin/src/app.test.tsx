import type { AdminSessionState } from '@oceanfresh/auth/hooks';
import type { AdminProfile } from '@oceanfresh/auth/repository';
import {
  AccountStatus,
  AuthProviderType,
  IdentityType,
  type UserIdentity,
} from '@oceanfresh/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './app';

const logout = vi.fn();
let sessionState: AdminSessionState = {
  status: 'loading',
  user: null,
  adminProfile: null,
  isAdmin: false,
  error: null,
  retry: vi.fn(),
};

function makeUser(id: string, email: string): UserIdentity {
  return {
    id,
    email,
    phone: null,
    displayName: 'Admin User',
    photoURL: null,
    provider: AuthProviderType.EMAIL,
    identityType: IdentityType.USER,
    emailVerified: true,
    accountStatus: AccountStatus.ACTIVE,
    isAnonymous: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    lastLoginAt: new Date('2026-08-01T00:00:00.000Z'),
  };
}

function makeAdminProfile(id: string, fullName: string, role: string): AdminProfile {
  return {
    id,
    userId: id,
    fullName,
    mobile: null,
    avatarUrl: null,
    role,
  };
}

vi.mock('@oceanfresh/auth/hooks', () => ({
  useAdminSession: () => sessionState,
}));

vi.mock('../services/auth.service', () => ({
  getAuthProvider: () => ({ login: vi.fn(), logout }),
  sendEmailOtp: vi.fn(),
  resendEmailOtp: vi.fn(),
  verifyEmailOtp: vi.fn(),
  resetPassword: vi.fn(),
  signOutLocally: vi.fn(),
}));

vi.mock('../hooks/use-orders', () => ({
  useOrders: () => ({
    data: undefined,
    isLoading: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  usePendingOrderCount: () => ({ data: 0 }),
  useOrderCounts: () => ({ data: undefined }),
  useUpdateOrderStatus: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
    variables: undefined,
  }),
}));

vi.mock('../hooks/use-products', () => ({
  useCategories: () => ({ data: [] }),
  useProducts: () => ({
    data: { items: [] },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useCreateProduct: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateProduct: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteProduct: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSetProductStatus: () => ({ mutate: vi.fn(), isPending: false }),
  useToggleFeatured: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('../hooks/use-dashboard-stats', () => ({
  useDashboardStats: () => ({
    data: undefined,
    isLoading: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('../hooks/use-settings', () => ({
  useSettings: () => ({ data: undefined, isPending: true }),
  useAdminProfile: () => ({ data: undefined }),
  useUpdateSettings: () => ({ mutateAsync: vi.fn() }),
  useUpdateAdminProfile: () => ({ mutateAsync: vi.fn() }),
}));

function renderAt(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('App session gate and routes', () => {
  beforeEach(() => {
    sessionState = {
      status: 'loading',
      user: null,
      adminProfile: null,
      isAdmin: false,
      error: null,
      retry: vi.fn(),
    };
  });

  it('shows the splash screen while the session loads', () => {
    renderAt('/dashboard');
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
  });

  it('shows the session error state with retry when resolution fails', () => {
    sessionState = {
      status: 'error',
      user: null,
      adminProfile: null,
      isAdmin: false,
      error: 'Could not reach the network',
      retry: vi.fn(),
    };
    renderAt('/dashboard');
    expect(screen.getByText('Could not reach the network')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('routes guests to the login screen', () => {
    sessionState = {
      status: 'unauthenticated',
      user: null,
      adminProfile: null,
      isAdmin: false,
      error: null,
      retry: vi.fn(),
    };
    renderAt('/dashboard');
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('renders the admin dashboard for an authenticated admin', () => {
    sessionState = {
      status: 'authenticated',
      user: makeUser('u1', 'admin@oceanfresh.in'),
      adminProfile: makeAdminProfile('u1', 'Ada Admin', 'admin'),
      isAdmin: true,
      error: null,
      retry: vi.fn(),
    };
    renderAt('/dashboard');
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
  });

  it('blocks non-admin users with the access denied screen', () => {
    sessionState = {
      status: 'authenticated',
      user: makeUser('u2', 'viewer@oceanfresh.in'),
      adminProfile: makeAdminProfile('u2', 'Vera Viewer', 'viewer'),
      isAdmin: false,
      error: null,
      retry: vi.fn(),
    };
    renderAt('/dashboard');
    expect(screen.getByText('No admin access')).toBeInTheDocument();
  });
});

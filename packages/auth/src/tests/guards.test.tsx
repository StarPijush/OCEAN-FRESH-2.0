import { Permission, Role } from '@oceanfresh/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AuthGuard } from '../guards/auth.guard.js';
import { FeatureGate } from '../guards/feature.guard.js';
import { PermissionGate } from '../guards/permission.guard.js';
import { RoleGate } from '../guards/role.guard.js';

vi.mock('../queries/index.js', () => ({
  useIsAuthenticated: vi.fn(),
  useRole: vi.fn(),
  useRequirePermission: vi.fn(),
}));

import { useIsAuthenticated, useRequirePermission, useRole } from '../queries/index.js';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'Wrapper';
  return Wrapper;
}

describe('AuthGuard', () => {
  it('renders children when authenticated', () => {
    vi.mocked(useIsAuthenticated).mockReturnValue({ data: true, isLoading: false } as Record<
      string,
      unknown
    >);
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText('Protected Content')).toBeDefined();
  });

  it('renders fallback when not authenticated', () => {
    vi.mocked(useIsAuthenticated).mockReturnValue({ data: false, isLoading: false } as Record<
      string,
      unknown
    >);
    render(
      <AuthGuard fallback={<div>Please Login</div>}>
        <div>Protected</div>
      </AuthGuard>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText('Please Login')).toBeDefined();
  });

  it('renders loading fallback when loading', () => {
    vi.mocked(useIsAuthenticated).mockReturnValue({ data: undefined, isLoading: true } as Record<
      string,
      unknown
    >);
    render(
      <AuthGuard loadingFallback={<div>Loading...</div>}>
        <div>Protected</div>
      </AuthGuard>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText('Loading...')).toBeDefined();
  });
});

describe('RoleGate', () => {
  it('renders children when user has sufficient role', () => {
    vi.mocked(useRole).mockReturnValue({ data: Role.ADMIN } as Record<string, unknown>);
    render(
      <RoleGate requiredRole={Role.MODERATOR}>
        <div>Admin Content</div>
      </RoleGate>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText('Admin Content')).toBeDefined();
  });

  it('renders fallback when user does not have sufficient role', () => {
    vi.mocked(useRole).mockReturnValue({ data: Role.GUEST } as Record<string, unknown>);
    render(
      <RoleGate requiredRole={Role.ADMIN} fallback={<div>Access Denied</div>}>
        <div>Admin Content</div>
      </RoleGate>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText('Access Denied')).toBeDefined();
  });
});

describe('PermissionGate', () => {
  it('renders children when user has required permissions', () => {
    vi.mocked(useRequirePermission).mockReturnValue({ data: true } as Record<string, unknown>);
    render(
      <PermissionGate permissions={[Permission.ADMIN_ACCESS]}>
        <div>Admin Only</div>
      </PermissionGate>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText('Admin Only')).toBeDefined();
  });

  it('renders fallback when user lacks permissions', () => {
    vi.mocked(useRequirePermission).mockReturnValue({ data: false } as Record<string, unknown>);
    render(
      <PermissionGate permissions={[Permission.ADMIN_ACCESS]} fallback={<div>No Access</div>}>
        <div>Admin</div>
      </PermissionGate>,
      { wrapper: createWrapper() },
    );
    expect(screen.getByText('No Access')).toBeDefined();
  });
});

describe('FeatureGate', () => {
  it('renders children by default', () => {
    render(
      <FeatureGate feature="dark-mode">
        <div>Feature Content</div>
      </FeatureGate>,
    );
    expect(screen.getByText('Feature Content')).toBeDefined();
  });
});

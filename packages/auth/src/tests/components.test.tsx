import { Permission, Role } from '@oceanfresh/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AuthStatus } from '../components/auth-status.js';
import { LoginForm } from '../components/login-form.js';
import { PasswordStrength } from '../components/password-strength.js';
import { PermissionGate } from '../components/permission-gate.js';
import { Protected } from '../components/protected.js';
import { RegisterForm } from '../components/register-form.js';
import { RoleGate } from '../components/role-gate.js';
import { SessionExpiredDialog } from '../components/session-expired-dialog.js';
import { UserAvatar } from '../components/user-avatar.js';

vi.mock('../queries/index.js', () => ({
  useIsAuthenticated: vi.fn(),
  useCurrentUser: vi.fn(),
  useAuthState: vi.fn(),
  useRole: vi.fn(),
  useRequirePermission: vi.fn(),
}));

import {
  useAuthState,
  useCurrentUser,
  useIsAuthenticated,
  useRequirePermission,
  useRole,
} from '../queries/index.js';

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('Protected', () => {
  it('renders children when authenticated', () => {
    vi.mocked(useIsAuthenticated).mockReturnValue({ data: true, isLoading: false } as Record<
      string,
      unknown
    >);
    render(
      <Protected>
        <div>Protected Content</div>
      </Protected>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Protected Content')).toBeDefined();
  });

  it('renders fallback when not authenticated', () => {
    vi.mocked(useIsAuthenticated).mockReturnValue({ data: false, isLoading: false } as Record<
      string,
      unknown
    >);
    render(
      <Protected fallback={<div>Login Required</div>}>
        <div>Protected</div>
      </Protected>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Login Required')).toBeDefined();
  });
});

describe('RoleGate (component)', () => {
  it('renders children when sufficient role', () => {
    vi.mocked(useRole).mockReturnValue({ data: Role.ADMIN } as Record<string, unknown>);
    render(
      <RoleGate requiredRole={Role.MODERATOR}>
        <div>Role Content</div>
      </RoleGate>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Role Content')).toBeDefined();
  });
});

describe('PermissionGate (component)', () => {
  it('renders children when has permission', () => {
    vi.mocked(useRequirePermission).mockReturnValue({ data: true } as Record<string, unknown>);
    render(
      <PermissionGate permissions={[Permission.ADMIN_ACCESS]}>
        <div>Perm Content</div>
      </PermissionGate>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText('Perm Content')).toBeDefined();
  });
});

describe('AuthStatus', () => {
  it('shows signed out state when no user', () => {
    vi.mocked(useCurrentUser).mockReturnValue({ data: null } as Record<string, unknown>);
    vi.mocked(useAuthState).mockReturnValue({ data: null } as Record<string, unknown>);
    render(<AuthStatus />, { wrapper: Wrapper });
    expect(screen.getByText('Not signed in')).toBeDefined();
  });

  it('shows user state when signed in', () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      data: { displayName: 'John Doe', photoURL: null },
    } as Record<string, unknown>);
    vi.mocked(useAuthState).mockReturnValue({ data: 'authenticated' } as Record<string, unknown>);
    render(<AuthStatus />, { wrapper: Wrapper });
    expect(screen.getByText('John Doe')).toBeDefined();
  });
});

describe('UserAvatar', () => {
  it('renders initials when no photoURL', () => {
    render(<UserAvatar user={{ displayName: 'John Doe', photoURL: null }} />);
    expect(screen.getByText('JD')).toBeDefined();
  });

  it('renders single initial', () => {
    render(<UserAvatar user={{ displayName: 'John', photoURL: null }} />);
    expect(screen.getByText('J')).toBeDefined();
  });

  it('renders question mark when no display name', () => {
    render(<UserAvatar user={{ displayName: '', photoURL: null }} />);
    expect(screen.getByText('?')).toBeDefined();
  });

  it('renders image when photoURL provided', () => {
    const { container } = render(
      <UserAvatar user={{ displayName: 'John', photoURL: 'https://example.com/photo.jpg' }} />,
    );
    const img = container.querySelector('img');
    expect(img).toBeDefined();
    expect((img as HTMLImageElement).src).toBe('https://example.com/photo.jpg');
  });
});

describe('LoginForm', () => {
  it('renders all fields', () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByText('Sign In')).toBeDefined();
  });

  it('shows error message', () => {
    render(<LoginForm onSubmit={vi.fn()} error="Invalid credentials" />);
    expect(screen.getByText('Invalid credentials')).toBeDefined();
  });

  it('disables button while submitting', () => {
    render(<LoginForm onSubmit={vi.fn()} isSubmitting={true} />);
    expect(screen.getByText('Signing in...')).toBeDefined();
  });

  it('calls onSubmit with form data', () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByText('Sign In'));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass123',
      rememberMe: false,
    });
  });
});

describe('RegisterForm', () => {
  it('renders all fields', () => {
    render(<RegisterForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Full Name')).toBeDefined();
    expect(screen.getByLabelText('Email')).toBeDefined();
    expect(screen.getByLabelText('Password')).toBeDefined();
    expect(screen.getByText('Create Account')).toBeDefined();
  });

  it('shows password strength', () => {
    render(<RegisterForm onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPass1!' } });
    expect(screen.getByText(/Password strength:/)).toBeDefined();
  });

  it('calls onSubmit with form data', () => {
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPass1' } });
    fireEvent.click(screen.getByText('Create Account'));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'StrongPass1',
      displayName: 'John Doe',
      phone: undefined,
    });
  });
});

describe('PasswordStrength', () => {
  it('renders nothing for empty password', () => {
    const { container } = render(<PasswordStrength password="" />);
    expect(container.innerHTML).toBe('');
  });

  it('shows Weak for short password', () => {
    render(<PasswordStrength password="ab" />);
    expect(screen.getByText(/Password strength: Weak/)).toBeDefined();
  });

  it('shows Very Strong for complex password', () => {
    render(<PasswordStrength password="Str0ng!Pass123" />);
    expect(screen.getByText(/Password strength: Very Strong/)).toBeDefined();
  });
});

describe('SessionExpiredDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<SessionExpiredDialog isOpen={false} onLogin={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders dialog when open', () => {
    render(<SessionExpiredDialog isOpen={true} onLogin={vi.fn()} />);
    expect(screen.getByText('Session Expired')).toBeDefined();
    expect(screen.getByText('Sign In Again')).toBeDefined();
  });

  it('calls onLogin when button clicked', () => {
    const onLogin = vi.fn();
    render(<SessionExpiredDialog isOpen={true} onLogin={onLogin} />);
    fireEvent.click(screen.getByText('Sign In Again'));
    expect(onLogin).toHaveBeenCalled();
  });

  it('shows custom message', () => {
    render(<SessionExpiredDialog isOpen={true} onLogin={vi.fn()} message="Custom message" />);
    expect(screen.getByText('Custom message')).toBeDefined();
  });
});

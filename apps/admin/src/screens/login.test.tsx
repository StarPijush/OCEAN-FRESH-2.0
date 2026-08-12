import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginScreen } from './LoginScreen';

const login = vi.fn();

vi.mock('../services/auth.service', () => ({
  getAuthProvider: () => ({ login, logout: vi.fn() }),
  sendEmailOtp: vi.fn(),
  resendEmailOtp: vi.fn(),
  verifyEmailOtp: vi.fn(),
  resetPassword: vi.fn(),
  signOutLocally: vi.fn(),
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginScreen />
    </MemoryRouter>,
  );
}

describe('LoginScreen', () => {
  beforeEach(() => {
    login.mockReset();
    login.mockResolvedValue(undefined);
  });

  it('renders the sign-in form', () => {
    renderLogin();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Forgot password?' })).toBeInTheDocument();
  });

  it('shows a validation error when fields are empty', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Enter your email address and password.')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('calls the auth provider with trimmed credentials', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: '  admin@oceanfresh.in  ' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ email: 'admin@oceanfresh.in', password: 'secret' });
    });
  });

  it('surfaces the provider error message', async () => {
    login.mockRejectedValue(new Error('Invalid login credentials'));
    renderLogin();
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'admin@oceanfresh.in' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument();
  });

  it('submits via the form (Enter key)', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'admin@oceanfresh.in' },
    });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    const form = screen.getByLabelText('Password').closest('form') as HTMLFormElement | null;
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);
    await waitFor(() => expect(login).toHaveBeenCalled());
  });
});

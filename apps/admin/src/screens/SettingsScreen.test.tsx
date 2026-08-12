import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsScreen } from './SettingsScreen';

const updateProfile = vi.fn();
const updateSettings = vi.fn();

const PROFILE = { id: 'u1', fullName: 'Ada Admin', role: 'admin', mobile: '+91 90000 00000' };
const SETTINGS = {
  storeName: 'OceanFresh',
  tagline: 'Fresh from the sea',
  deliveryFee: 40,
  freeDeliveryAbove: 500,
};

vi.mock('@oceanfresh/auth/hooks', () => ({
  useAdminSession: () => ({
    status: 'authenticated',
    user: { id: 'u1', email: 'admin@oceanfresh.in' },
    adminProfile: null,
    isAdmin: true,
    error: null,
    retry: vi.fn(),
  }),
}));

vi.mock('../hooks/use-settings', () => ({
  useSettings: () => ({ data: SETTINGS, isPending: false }),
  useAdminProfile: () => ({ data: PROFILE }),
  useUpdateSettings: () => ({ mutateAsync: updateSettings }),
  useUpdateAdminProfile: () => ({ mutateAsync: updateProfile }),
}));

vi.mock('../services/auth.service', () => ({
  getAuthProvider: () => ({ login: vi.fn(), logout: vi.fn() }),
  sendEmailOtp: vi.fn(),
  resendEmailOtp: vi.fn(),
  verifyEmailOtp: vi.fn(),
  resetPassword: vi.fn(),
  signOutLocally: vi.fn(),
}));

vi.mock('../env', () => ({ STOREFRONT_URL: 'http://localhost:3000' }));

describe('SettingsScreen', () => {
  beforeEach(() => {
    updateProfile.mockReset();
    updateSettings.mockReset();
    updateProfile.mockResolvedValue(undefined);
    updateSettings.mockResolvedValue(undefined);
  });

  it('renders pre-filled profile and store fields', () => {
    render(<SettingsScreen />);
    expect(screen.getByLabelText('Full name')).toHaveValue('Ada Admin');
    expect(screen.getByLabelText('Store name')).toHaveValue('OceanFresh');
    expect(screen.getByText('admin@oceanfresh.in')).toBeInTheDocument();
  });

  it('saves the profile with trimmed values', async () => {
    render(<SettingsScreen />);
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));
    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({
        fullName: 'Ada Lovelace',
        mobile: '+91 90000 00000',
      });
    });
    expect(await screen.findByText('Saved.')).toBeInTheDocument();
  });

  it('saves store settings', async () => {
    render(<SettingsScreen />);
    fireEvent.change(screen.getByLabelText('Delivery charge (₹)'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save store settings' }));
    await waitFor(() => {
      expect(updateSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          storeName: 'OceanFresh',
          deliveryFee: 50,
          freeDeliveryAbove: 500,
        }),
      );
    });
  });

  it('rejects mismatched passwords with a local error', async () => {
    render(<SettingsScreen />);
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'secret1' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), {
      target: { value: 'secret2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Change password' }));
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminLayout } from './AdminLayout';

const logout = vi.fn();
const adminSession = {
  status: 'authenticated' as const,
  user: { id: 'u1', email: 'admin@oceanfresh.in' },
  adminProfile: { id: 'u1', fullName: 'Ada Admin', role: 'admin' as const },
  isAdmin: true,
  error: null,
  retry: vi.fn(),
};

vi.mock('@oceanfresh/auth/hooks', () => ({
  useAdminSession: () => adminSession,
}));

vi.mock('../services/auth.service', () => ({
  getAuthProvider: () => ({ login: vi.fn(), logout }),
}));

vi.mock('../hooks/use-orders', () => ({
  usePendingOrderCount: () => ({ data: 0 }),
}));

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
          <Route path="/products" element={<div>Products page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

function requireElement(selector: string): Element {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`Expected element "${selector}" to exist`);
  return el;
}

describe('AdminLayout', () => {
  beforeEach(() => {
    window.innerWidth = 390;
    fireEvent.resize(window);
  });

  it('renders the mobile header with a hamburger button below desktop width', () => {
    renderLayout();
    expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
  });

  it('opens the drawer on hamburger click and closes it on Escape', () => {
    renderLayout();
    const drawer = () => requireElement('.of-drawer');
    expect(drawer().className).not.toContain('open');
    fireEvent.click(screen.getByLabelText('Open navigation menu'));
    expect(drawer().className).toContain('open');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(drawer().className).not.toContain('open');
  });

  it('closes the drawer when clicking the overlay', () => {
    renderLayout();
    fireEvent.click(screen.getByLabelText('Open navigation menu'));
    const drawer = () => requireElement('.of-drawer');
    fireEvent.click(requireElement('.of-drawer-overlay'));
    expect(drawer().className).not.toContain('open');
  });

  it('navigates and closes the drawer when a nav item is pressed', () => {
    renderLayout();
    fireEvent.click(screen.getByLabelText('Open navigation menu'));
    fireEvent.click(screen.getByRole('button', { name: 'Products' }));
    expect(screen.getByText('Products page')).toBeInTheDocument();
    expect(requireElement('.of-drawer').className).not.toContain('open');
  });

  it('locks background scroll while the drawer is open', () => {
    renderLayout();
    fireEvent.click(screen.getByLabelText('Open navigation menu'));
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('renders a permanent sidebar on desktop width', () => {
    window.innerWidth = 1280;
    fireEvent.resize(window);
    renderLayout();
    expect(screen.queryByLabelText('Open navigation menu')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});

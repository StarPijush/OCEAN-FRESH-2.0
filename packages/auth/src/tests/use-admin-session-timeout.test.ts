import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminSession } from '../hooks/use-admin-session.js';

const mockGetCurrentUser = vi.fn();
const mockObserveAuthState = vi.fn(() => vi.fn());
const mockGetAdminProfile = vi.fn();

vi.mock('../providers/index.js', () => ({
  SupabaseAuthProvider: vi.fn().mockImplementation(() => ({
    getCurrentUser: mockGetCurrentUser,
    observeAuthState: mockObserveAuthState,
  })),
}));

vi.mock('../repository/index.js', () => ({
  getAuthRepository: () => ({
    getAdminProfile: mockGetAdminProfile,
  }),
}));

function makeUser(id = 'u1') {
  return {
    id,
    email: 'admin@oceanfresh.in',
    phone: null,
    displayName: 'Admin',
    photoURL: null,
    provider: 'email' as const,
    identityType: 'user' as const,
    emailVerified: true,
    accountStatus: 'active' as const,
    isAnonymous: false,
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };
}

describe('useAdminSession — timeout & guard', () => {
  beforeEach(() => {
    vi.useRealTimers();
    mockGetCurrentUser.mockReset();
    mockGetAdminProfile.mockReset();
    mockObserveAuthState.mockReturnValue(vi.fn());
  });

  it('starts unauthenticated (no startup loading)', () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const { result } = renderHook(() => useAdminSession());
    expect(result.current.status).toBe('unauthenticated');
  });

  it('transitions to authenticated+isAdmin when admin profile is admin', async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser('u1'));
    mockGetAdminProfile.mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      fullName: 'Ada',
      role: 'admin',
      mobile: null,
      avatarUrl: null,
    });
    const { result } = renderHook(() => useAdminSession());
    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    expect(result.current.isAdmin).toBe(true);
  });

  it('transitions to authenticated+!isAdmin when profile is non-admin', async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser('u2'));
    mockGetAdminProfile.mockResolvedValue({
      id: 'p2',
      userId: 'u2',
      fullName: 'Viewer',
      role: 'viewer',
      mobile: null,
      avatarUrl: null,
    });
    const { result } = renderHook(() => useAdminSession());
    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    expect(result.current.isAdmin).toBe(false);
  });

  it('transitions to error when getCurrentUser throws', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => useAdminSession());
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/network down/);
  });

  it('transitions to error on getCurrentUser timeout', async () => {
    mockGetCurrentUser.mockRejectedValue(
      new DOMException('auth.getUser timed out after 10000ms', 'TimeoutError'),
    );
    const { result } = renderHook(() => useAdminSession());
    expect(result.current.status).toBe('unauthenticated');
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/timed out/);
  });

  it('transitions to error on adminProfile timeout', async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser('u1'));
    mockGetAdminProfile.mockRejectedValue(
      new DOMException('adminProfile.get timed out after 10000ms', 'TimeoutError'),
    );
    const { result } = renderHook(() => useAdminSession());
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/timed out/);
  });

  it('releases guard after timeout so retry can succeed', async () => {
    mockGetCurrentUser.mockRejectedValueOnce(
      new DOMException('auth.getUser timed out after 10000ms', 'TimeoutError'),
    );
    const { result } = renderHook(() => useAdminSession());
    await waitFor(() => expect(result.current.status).toBe('error'));

    // second attempt after retry should be able to run
    mockGetCurrentUser.mockResolvedValue(null);
    // trigger retry
    result.current.retry();
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));
  });

  it('transitions to error when getCurrentUser hangs forever (never-resolving promise)', async () => {
    vi.useFakeTimers();
    mockGetCurrentUser.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAdminSession());
    expect(result.current.status).toBe('unauthenticated');
    await vi.advanceTimersByTimeAsync(10_100);
    vi.useRealTimers();
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/auth\.getUser timed out after 10000ms/);
  });

  it('transitions to error when getAdminProfile hangs forever', async () => {
    vi.useFakeTimers();
    mockGetCurrentUser.mockResolvedValue(makeUser('u1'));
    mockGetAdminProfile.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAdminSession());
    await vi.advanceTimersByTimeAsync(10_100);
    vi.useRealTimers();
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/adminProfile\.get timed out after 10000ms/);
  });

  it('recovers via retry after a hanging getCurrentUser', async () => {
    vi.useFakeTimers();
    mockGetCurrentUser.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useAdminSession());
    await vi.advanceTimersByTimeAsync(10_100);
    vi.useRealTimers();
    await waitFor(() => expect(result.current.status).toBe('error'));

    mockGetCurrentUser.mockResolvedValue(null);
    result.current.retry();
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));
  });
});

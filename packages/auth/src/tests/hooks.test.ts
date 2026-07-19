import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAuthForm } from '../hooks/use-auth-form.js';

describe('useAuthForm', () => {
  it('returns login schema for login mode', () => {
    const { result } = renderHook(() => useAuthForm({ mode: 'login' }));
    expect(result.current.schema).toBeDefined();
    expect(result.current.mode).toBe('login');
  });

  it('returns register schema for register mode', () => {
    const { result } = renderHook(() => useAuthForm({ mode: 'register' }));
    expect(result.current.schema).toBeDefined();
    expect(result.current.mode).toBe('register');
  });

  it('returns resetPassword schema for resetPassword mode', () => {
    const { result } = renderHook(() => useAuthForm({ mode: 'resetPassword' }));
    expect(result.current.schema).toBeDefined();
    expect(result.current.mode).toBe('resetPassword');
  });

  it('returns default values from initialData', () => {
    const { result } = renderHook(() =>
      useAuthForm({ mode: 'login', initialData: { email: 'a@b.com' } }),
    );
    expect(result.current.defaultValues).toEqual({ email: 'a@b.com' });
  });

  it('returns empty default values when no initialData', () => {
    const { result } = renderHook(() => useAuthForm({ mode: 'login' }));
    expect(result.current.defaultValues).toEqual({});
  });
});

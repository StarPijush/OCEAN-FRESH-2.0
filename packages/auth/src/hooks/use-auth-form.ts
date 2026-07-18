import { useMemo } from 'react';
import { loginSchema, registerSchema, resetPasswordSchema } from '@oceanfresh/shared';
import type { LoginInput, RegisterInput, ResetPasswordInput } from '@oceanfresh/shared';

export interface AuthFormOptions {
  mode: 'login' | 'register' | 'resetPassword';
  initialData?: Record<string, unknown>;
}

export function useAuthForm<T = LoginInput | RegisterInput | ResetPasswordInput>(options: AuthFormOptions) {
  const schema = useMemo(() => {
    switch (options.mode) {
      case 'login': return loginSchema;
      case 'register': return registerSchema;
      case 'resetPassword': return resetPasswordSchema;
    }
  }, [options.mode]);

  const defaultValues = useMemo<Partial<T>>(
    () => options.initialData as Partial<T> ?? {} as Partial<T>,
    [options.initialData],
  );

  return { schema, defaultValues, mode: options.mode };
}

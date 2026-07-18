import { z } from 'zod';
import { AuthProviderType, AccountStatus, MfaFactorType, Role, Permission } from '../types/index.js';

export const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  displayName: z.string().min(1, 'Display name is required').max(100),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  photoURL: z.string().url().optional().nullable(),
  phone: z.string().regex(/^[0-9]{10}$/).optional().nullable(),
});

export const reauthenticateSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const assignRoleSchema = z.object({
  uid: z.string().min(1, 'User ID is required'),
  role: z.nativeEnum(Role, { errorMap: () => ({ message: 'Invalid role' }) }),
});

export const grantPermissionSchema = z.object({
  uid: z.string().min(1),
  permissions: z.array(z.nativeEnum(Permission)).min(1),
  reason: z.string().min(1).max(500).optional(),
  expiresAt: z.number().optional(),
});

export const mfaEnrollSchema = z.object({
  factorType: z.nativeEnum(MfaFactorType),
  name: z.string().max(50).optional(),
});

export const mfaVerifySchema = z.object({
  challengeId: z.string().min(1),
  code: z.string().min(1),
});

export const authQuerySchema = z.object({
  role: z.nativeEnum(Role).optional(),
  accountStatus: z.nativeEnum(AccountStatus).optional(),
  provider: z.nativeEnum(AuthProviderType).optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  includeDeleted: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ReauthenticateInput = z.infer<typeof reauthenticateSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type GrantPermissionInput = z.infer<typeof grantPermissionSchema>;
export type MfaEnrollInput = z.infer<typeof mfaEnrollSchema>;
export type MfaVerifyInput = z.infer<typeof mfaVerifySchema>;
export type AuthQueryInput = z.infer<typeof authQuerySchema>;

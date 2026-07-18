import type { Timestamp } from './common.js';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Timestamp | null;
  createdAt: Timestamp;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark';
}

export interface AuthUser {
  uid: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  permissions: string[];
}

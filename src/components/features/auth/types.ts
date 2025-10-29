/**
 * Auth Domain Types
 * 
 * Type definitions for authentication and authorization
 */

export type AuthProvider = 'email' | 'google' | 'github';

export type UserRole = 'user' | 'facility_manager' | 'admin';

export interface IAuthUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  provider: AuthProvider;
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ISignupData {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
}

export interface IPasswordReset {
  email: string;
}

export interface IPasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IAuthSession {
  user: IAuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

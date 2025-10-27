/**
 * Authentication Service
 *
 * Handles all authentication operations including:
 * - Email/password authentication
 * - Social authentication (Google, etc.)
 * - Session management
 * - Password reset
 * - Email verification
 *
 * @module services/supabase/auth
 */

import { supabase } from './client';
import {
  handleSupabaseError,
  UnauthorizedError,
  ValidationError,
  ServiceError,
} from './errors';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

export interface SignUpParams {
  readonly email: string;
  readonly password: string;
  readonly fullName?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface SignInParams {
  readonly email: string;
  readonly password: string;
}

export interface ResetPasswordParams {
  readonly email: string;
  readonly redirectTo?: string;
}

export interface UpdatePasswordParams {
  readonly newPassword: string;
}

export interface UpdateProfileParams {
  readonly fullName?: string;
  readonly avatarUrl?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface AuthResponse {
  readonly user: User | null;
  readonly session: Session | null;
}

// ============================================================================
// Authentication Service
// ============================================================================

export class AuthService {
  /**
   * Sign up a new user with email and password
   *
   * @param params - Sign up parameters
   * @returns User and session
   * @throws {ValidationError} If email/password invalid
   */
  async signUp(params: SignUpParams): Promise<AuthResponse> {
    try {
      this.validateEmail(params.email);
      this.validatePassword(params.password);

      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            ...params.metadata,
          },
        },
      });

      if (error) {
        throw this.handleAuthError(error);
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      throw handleSupabaseError(error, 'signUp');
    }
  }

  /**
   * Sign in with email and password
   *
   * @param params - Sign in parameters
   * @returns User and session
   * @throws {UnauthorizedError} If credentials invalid
   */
  async signIn(params: SignInParams): Promise<AuthResponse> {
    try {
      this.validateEmail(params.email);
      this.validatePassword(params.password);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });

      if (error) {
        throw this.handleAuthError(error);
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      throw handleSupabaseError(error, 'signIn');
    }
  }

  /**
   * Sign in with Google OAuth
   *
   * @param redirectTo - URL to redirect after authentication
   */
  async signInWithGoogle(redirectTo?: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo ?? window.location.origin,
        },
      });

      if (error) {
        throw this.handleAuthError(error);
      }
    } catch (error) {
      throw handleSupabaseError(error, 'signInWithGoogle');
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw this.handleAuthError(error);
      }
    } catch (error) {
      throw handleSupabaseError(error, 'signOut');
    }
  }

  /**
   * Get the current user
   *
   * @returns Current user or null
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        throw this.handleAuthError(error);
      }

      return user;
    } catch (error) {
      throw handleSupabaseError(error, 'getCurrentUser');
    }
  }

  /**
   * Get the current session
   *
   * @returns Current session or null
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        throw this.handleAuthError(error);
      }

      return session;
    } catch (error) {
      throw handleSupabaseError(error, 'getCurrentSession');
    }
  }

  /**
   * Check if user is authenticated
   *
   * @returns True if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      return session !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Send password reset email
   *
   * @param params - Reset password parameters
   */
  async resetPassword(params: ResetPasswordParams): Promise<void> {
    try {
      this.validateEmail(params.email);

      const { error } = await supabase.auth.resetPasswordForEmail(params.email, {
        redirectTo: params.redirectTo ?? `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw this.handleAuthError(error);
      }
    } catch (error) {
      throw handleSupabaseError(error, 'resetPassword');
    }
  }

  /**
   * Update user password
   *
   * @param params - Update password parameters
   * @throws {UnauthorizedError} If user not authenticated
   */
  async updatePassword(params: UpdatePasswordParams): Promise<void> {
    try {
      this.validatePassword(params.newPassword);

      const { error } = await supabase.auth.updateUser({
        password: params.newPassword,
      });

      if (error) {
        throw this.handleAuthError(error);
      }
    } catch (error) {
      throw handleSupabaseError(error, 'updatePassword');
    }
  }

  /**
   * Update user profile
   *
   * @param params - Update profile parameters
   * @returns Updated user
   */
  async updateProfile(params: UpdateProfileParams): Promise<User> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: params.fullName,
          avatar_url: params.avatarUrl,
          ...params.metadata,
        },
      });

      if (error) {
        throw this.handleAuthError(error);
      }

      if (!data.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      return data.user;
    } catch (error) {
      throw handleSupabaseError(error, 'updateProfile');
    }
  }

  /**
   * Refresh the current session
   *
   * @returns Refreshed session
   */
  async refreshSession(): Promise<Session> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw this.handleAuthError(error);
      }

      if (!data.session) {
        throw new UnauthorizedError('Failed to refresh session');
      }

      return data.session;
    } catch (error) {
      throw handleSupabaseError(error, 'refreshSession');
    }
  }

  /**
   * Resend verification email
   *
   * @param email - User email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      this.validateEmail(email);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        throw this.handleAuthError(error);
      }
    } catch (error) {
      throw handleSupabaseError(error, 'resendVerificationEmail');
    }
  }

  /**
   * Listen to authentication state changes
   *
   * @param callback - Callback function
   * @returns Unsubscribe function
   */
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }

  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      throw new ValidationError('Invalid email format', {
        email: ['Please provide a valid email address'],
      });
    }
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new ValidationError('Invalid password', {
        password: ['Password must be at least 8 characters long'],
      });
    }

    // Additional password strength checks
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      throw new ValidationError('Weak password', {
        password: [
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        ],
      });
    }
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: AuthError): ServiceError {
    switch (error.message) {
      case 'Invalid login credentials':
      case 'Email not confirmed':
        return new UnauthorizedError(error.message);
      case 'User already registered':
        return new ValidationError('Email already in use', {
          email: ['This email is already registered'],
        });
      default:
        return handleSupabaseError(error, 'auth');
    }
  }
}

/**
 * Singleton instance of AuthService
 */
export const authService = new AuthService();

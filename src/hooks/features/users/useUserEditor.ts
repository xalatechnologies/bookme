/**
 * User Editor Hook
 *
 * Manages user creation and editing with business logic separation.
 * Handles form state, validation, role changes, and save operations.
 * Follows clean architecture principles with proper layer separation.
 *
 * @module hooks/features/users/useUserEditor
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import {
  validateUserData,
  validateRoleChange,
  type IUserWithRole,
  type IUserValidationResult,
  type IRoleChangeValidationResult,
} from '@/services/business/user.business.service';
import {
  validatePasswordStrength,
  validatePasswordMatch,
  type PasswordStrengthResult,
  type ValidationResult,
} from '@/services/business/auth.business.service';
import type { OrgRole } from '@/constants/roles';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * User editor options
 */
export interface IUseUserEditorOptions {
  readonly userId?: string;
  readonly isNewUser?: boolean;
  readonly onSaveSuccess?: (user: Profile) => void;
  readonly onSaveError?: (error: Error) => void;
}

/**
 * User form data interface
 */
export interface IUserFormData {
  readonly email?: string;
  readonly display_name?: string;
  readonly phone?: string;
  readonly role?: OrgRole;
  readonly password?: string;
  readonly confirmPassword?: string;
  readonly avatar_url?: string;
}

/**
 * Hook return interface
 */
export interface IUseUserEditorReturn {
  // Data
  readonly user: Profile | null;
  readonly editedUser: IUserFormData | null;
  readonly isLoading: boolean;
  readonly isSaving: boolean;
  readonly error: Error | null;

  // Validation
  readonly validationErrors: readonly string[];
  readonly isValid: boolean;
  readonly passwordStrength: PasswordStrengthResult | null;
  readonly passwordMatchErrors: readonly string[];
  readonly roleChangeValidation: IRoleChangeValidationResult | null;

  // State
  readonly hasUnsavedChanges: boolean;
  readonly showSaveMessage: boolean;

  // Actions
  readonly updateField: <K extends keyof IUserFormData>(field: K, value: IUserFormData[K]) => void;
  readonly updateFields: (fields: Partial<IUserFormData>) => void;
  readonly validatePassword: (password: string) => PasswordStrengthResult;
  readonly validatePasswordsMatch: () => ValidationResult;
  readonly validateRoleChange: (newRole: OrgRole) => IRoleChangeValidationResult;
  readonly save: () => Promise<void>;
  readonly cancel: () => void;
  readonly reset: () => void;
}

/**
 * Hook for editing users with clean architecture
 *
 * Provides comprehensive user form management including:
 * - Form state management with change tracking
 * - Real-time validation with business rules
 * - Password strength validation
 * - Role change validation with permission checks
 * - Save operations with error handling
 * - Optimistic UI updates
 *
 * @param options - Configuration options for the editor
 * @returns Complete user editor interface
 *
 * @example
 * ```tsx
 * function UserEditorPage({ userId }: { userId?: string }) {
 *   const {
 *     editedUser,
 *     isLoading,
 *     isSaving,
 *     validationErrors,
 *     isValid,
 *     passwordStrength,
 *     roleChangeValidation,
 *     updateField,
 *     save,
 *     cancel,
 *   } = useUserEditor({
 *     userId,
 *     isNewUser: !userId,
 *     onSaveSuccess: (user) => {
 *       toast.success('User saved!');
 *       navigate(`/users/${user.id}`);
 *     },
 *   });
 *
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     if (!isValid) {
 *       toast.error('Please fix validation errors');
 *       return;
 *     }
 *     await save();
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <Input
 *         label="Email"
 *         value={editedUser?.email}
 *         onChange={(e) => updateField('email', e.target.value)}
 *         error={validationErrors.find(e => e.includes('email'))}
 *       />
 *       <Input
 *         label="Display Name"
 *         value={editedUser?.display_name}
 *         onChange={(e) => updateField('display_name', e.target.value)}
 *       />
 *       <RoleSelect
 *         value={editedUser?.role}
 *         onChange={(role) => updateField('role', role)}
 *         disabled={roleChangeValidation && !roleChangeValidation.canChange}
 *       />
 *       {passwordStrength && (
 *         <PasswordStrengthIndicator strength={passwordStrength.strength} />
 *       )}
 *       <button type="submit" disabled={!isValid || isSaving}>
 *         {isSaving ? 'Saving...' : 'Save User'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export const useUserEditor = (
  options: IUseUserEditorOptions
): IUseUserEditorReturn => {
  const { userId, isNewUser = false, onSaveSuccess, onSaveError } = options;

  const navigate = useNavigate();
  const orgId = useOrganizationId();
  const { user: currentUser } = useAuth();

  // Data layer - TODO: Connect to actual Supabase hooks when available
  const user: Profile | null = null; // TODO: useUser(userId || '', !isNewUser)
  const isLoading = false; // TODO: from useUser
  const error = null; // TODO: from useUser

  // Placeholder mutations - replace with actual hooks
  const createUserMutation = {
    mutateAsync: async (data: IUserFormData & { org_id: string }): Promise<Profile> => {
      // TODO: Connect to actual create mutation
      console.log('Create user:', data);
      return {} as Profile;
    },
    isPending: false,
  };

  const updateUserMutation = {
    mutateAsync: async (params: { id: string; updates: Partial<IUserFormData> }): Promise<void> => {
      // TODO: Connect to actual update mutation
      console.log('Update user:', params);
    },
    isPending: false,
  };

  // Local state
  const [editedUser, setEditedUser] = useState<IUserFormData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);
  const [roleChangeValidation, setRoleChangeValidation] =
    useState<IRoleChangeValidationResult | null>(null);

  // Initialize edited user
  useEffect(() => {
    if (isNewUser) {
      // Create new user template
      setEditedUser({
        email: '',
        display_name: '',
        phone: '',
        role: 'customer',
        password: '',
        confirmPassword: '',
        avatar_url: '',
      });
    } else if (user) {
      setEditedUser({
        email: user.email || '',
        display_name: user.display_name || '',
        phone: user.phone || '',
        role: (user as IUserWithRole).role || 'customer', // TODO: Fix type when profile includes role
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user, isNewUser]);

  // Validation
  const validation: IUserValidationResult = validateUserData({
    email: editedUser?.email,
    display_name: editedUser?.display_name,
    phone: editedUser?.phone,
    password: isNewUser ? editedUser?.password : undefined,
  });

  // Password validation
  const validatePasswordFn = useCallback((password: string): PasswordStrengthResult => {
    const result = validatePasswordStrength(password);
    setPasswordStrength(result);
    return result;
  }, []);

  const validatePasswordsMatchFn = useCallback((): ValidationResult => {
    if (!editedUser?.password || !editedUser?.confirmPassword) {
      return { isValid: false, errors: ['Both password fields are required'], errorsNo: [] };
    }

    return validatePasswordMatch(editedUser.password, editedUser.confirmPassword);
  }, [editedUser]);

  // Role change validation
  const validateRoleChangeFn = useCallback(
    (newRole: OrgRole): IRoleChangeValidationResult => {
      if (!currentUser?.id || !userId || !currentUser.role) {
        return {
          canChange: false,
          reason: 'Insufficient permissions to change roles',
        };
      }

      const result = validateRoleChange(
        currentUser.role as OrgRole,
        userId,
        currentUser.id,
        newRole
      );

      setRoleChangeValidation(result);
      return result;
    },
    [currentUser, userId]
  );

  // Validate password on change
  useEffect(() => {
    if (editedUser?.password && editedUser.password.length > 0) {
      validatePasswordFn(editedUser.password);
    }
  }, [editedUser?.password, validatePasswordFn]);

  // Validate role change when role changes
  useEffect(() => {
    if (editedUser?.role && !isNewUser) {
      validateRoleChangeFn(editedUser.role);
    }
  }, [editedUser?.role, isNewUser, validateRoleChangeFn]);

  // Actions
  const updateField = useCallback(
    <K extends keyof IUserFormData>(field: K, value: IUserFormData[K]): void => {
      setEditedUser((prev) => {
        if (!prev) return prev;
        return { ...prev, [field]: value };
      });
      setHasUnsavedChanges(true);
    },
    []
  );

  const updateFields = useCallback((fields: Partial<IUserFormData>): void => {
    setEditedUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...fields };
    });
    setHasUnsavedChanges(true);
  }, []);

  const save = useCallback(async (): Promise<void> => {
    if (!editedUser) {
      throw new Error('No user data to save');
    }

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Validate password for new users
    if (isNewUser) {
      if (!editedUser.password) {
        throw new Error('Password is required for new users');
      }

      const passwordValidation = validatePasswordFn(editedUser.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      const passwordMatchValidation = validatePasswordsMatchFn();
      if (!passwordMatchValidation.isValid) {
        throw new Error(passwordMatchValidation.errors.join(', '));
      }
    }

    // Validate role change for existing users
    if (!isNewUser && editedUser.role) {
      const roleValidation = validateRoleChangeFn(editedUser.role);
      if (!roleValidation.canChange) {
        throw new Error(roleValidation.reason || 'Cannot change user role');
      }
    }

    try {
      if (isNewUser) {
        // Create new user
        const newUser = await createUserMutation.mutateAsync({
          ...editedUser,
          org_id: orgId,
        });
        setHasUnsavedChanges(false);
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 3000);

        if (onSaveSuccess) {
          onSaveSuccess(newUser);
        } else {
          navigate(`/users/${newUser.id}`);
        }
      } else if (userId) {
        // Update existing user
        const { password, confirmPassword, ...updateData } = editedUser;
        await updateUserMutation.mutateAsync({
          id: userId,
          updates: updateData,
        });
        setHasUnsavedChanges(false);
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 3000);

        if (onSaveSuccess && user) {
          onSaveSuccess(user);
        }
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      if (onSaveError && error instanceof Error) {
        onSaveError(error);
      }
      throw error;
    }
  }, [
    editedUser,
    validation,
    isNewUser,
    userId,
    user,
    orgId,
    validatePasswordFn,
    validatePasswordsMatchFn,
    validateRoleChangeFn,
    createUserMutation,
    updateUserMutation,
    navigate,
    onSaveSuccess,
    onSaveError,
  ]);

  const cancel = useCallback((): void => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmCancel) return;
    }

    if (isNewUser) {
      navigate('/users');
    } else if (user) {
      setEditedUser({
        email: user.email || '',
        display_name: user.display_name || '',
        phone: user.phone || '',
        role: (user as IUserWithRole).role || 'customer',
        avatar_url: user.avatar_url || '',
      });
      setHasUnsavedChanges(false);
    }
  }, [hasUnsavedChanges, isNewUser, user, navigate]);

  const reset = useCallback((): void => {
    if (user) {
      setEditedUser({
        email: user.email || '',
        display_name: user.display_name || '',
        phone: user.phone || '',
        role: (user as IUserWithRole).role || 'customer',
        avatar_url: user.avatar_url || '',
      });
      setHasUnsavedChanges(false);
      setPasswordStrength(null);
      setRoleChangeValidation(null);
    }
  }, [user]);

  // Compute password match errors
  const passwordMatchErrors = editedUser?.confirmPassword
    ? validatePasswordsMatchFn().errors
    : [];

  return {
    // Data
    user,
    editedUser,
    isLoading,
    isSaving: createUserMutation.isPending || updateUserMutation.isPending,
    error,

    // Validation
    validationErrors: validation.errors,
    isValid: validation.isValid && (!isNewUser || Boolean(passwordStrength?.isValid)),
    passwordStrength,
    passwordMatchErrors,
    roleChangeValidation,

    // State
    hasUnsavedChanges,
    showSaveMessage,

    // Actions
    updateField,
    updateFields,
    validatePassword: validatePasswordFn,
    validatePasswordsMatch: validatePasswordsMatchFn,
    validateRoleChange: validateRoleChangeFn,
    save,
    cancel,
    reset,
  };
};

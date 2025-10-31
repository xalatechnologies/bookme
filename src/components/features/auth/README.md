# Auth Domain

Authentication and authorization feature domain.

## Structure

```
auth/
├── components/          # Auth UI components
│   ├── ForgotPasswordForm.tsx
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── SocialAuthButtons.tsx
├── hooks/              # Auth-specific hooks
│   └── index.ts
├── types.ts            # Auth type definitions
├── constants.ts        # Config, i18n, RBAC, design, animations
├── index.ts            # Barrel export
└── README.md           # This file
```

## Key Features

- **Email/Password Authentication**: Traditional login/signup
- **Social Authentication**: Google, GitHub providers
- **Password Reset**: Forgot password flow
- **Role-Based Access Control**: user, facility_manager, admin roles
- **Session Management**: Token-based authentication
- **Email Verification**: Account verification flow

## Usage Examples

### Login
```tsx
import { LoginForm } from '@/components/features/auth';
import { AUTH_I18N_KEYS } from '@/components/features/auth';

<LoginForm onSuccess={() => navigate('/dashboard')} />
```

### Check Permissions
```tsx
import { hasAuthPermission, AUTH_PERMISSIONS } from '@/components/features/auth';

if (hasAuthPermission(user.roles, 'MANAGE_USERS')) {
  // Show admin UI
}
```

### Role Hierarchy
```tsx
import { hasMinimumRole } from '@/components/features/auth';

if (hasMinimumRole(userRole, 'facility_manager')) {
  // User is facility_manager or admin
}
```

## Localization

Translation namespace: `auth`

Key structure in `constants.ts`:
- `AUTH_I18N_KEYS.LOGIN.*` - Login form
- `AUTH_I18N_KEYS.SIGNUP.*` - Signup form
- `AUTH_I18N_KEYS.RESET.*` - Password reset
- `AUTH_I18N_KEYS.ERRORS.*` - Error messages

## RBAC

Permissions defined in `AUTH_PERMISSIONS`:
- `LOGIN` - Who can login
- `SIGNUP` - Who can register
- `MANAGE_USERS` - Admin only
- `MANAGE_ROLES` - Admin only

Role hierarchy: `user < facility_manager < admin`

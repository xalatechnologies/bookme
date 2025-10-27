# TypeScript Standards for BookMe

## 🎯 Overview

This document defines strict TypeScript standards for the BookMe project, emphasizing type safety, consistency, and maintainability. All code MUST adhere to these standards.

## 📋 Core Principles

### 1. Strict TypeScript Configuration

**File: `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    // STRICT RULES - MANDATORY
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noImplicitOverride": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 2. Interface Design Standards

#### ✅ REQUIRED: Readonly Properties

```typescript
// ✅ CORRECT: All interface properties must be readonly
interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// ❌ FORBIDDEN: Mutable properties
interface BadUserProfile {
  id: string;           // Missing readonly
  name: string;         // Missing readonly
  email: string;        // Missing readonly
}
```

#### ✅ REQUIRED: Explicit Return Types

```typescript
// ✅ CORRECT: Explicit return type for all functions
export const getUserById = async (id: string): Promise<UserProfile | null> => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// ✅ CORRECT: Explicit return type for React components
export const UserCard = ({ user }: UserCardProps): JSX.Element => {
  return (
    <Card>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </Card>
  );
};

// ❌ FORBIDDEN: Implicit return types
export const getUserById = async (id: string) => { // Missing Promise<UserProfile | null>
  return await db.user.findUnique({ where: { id } });
};
```

#### ✅ REQUIRED: Strict Union Types

```typescript
// ✅ CORRECT: Strict union types with const assertions
export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor', 
  VIEWER: 'viewer'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// ✅ CORRECT: Discriminated unions for state management
interface LoadingState {
  readonly status: 'loading';
}

interface SuccessState {
  readonly status: 'success';
  readonly data: UserProfile[];
}

interface ErrorState {
  readonly status: 'error';
  readonly error: string;
}

export type ApiState = LoadingState | SuccessState | ErrorState;

// ❌ FORBIDDEN: String literal types without const assertion
export type BadUserRole = 'admin' | 'editor' | 'viewer'; // Not connected to constants
```

## 🧩 Component Type Standards

### React Component Interfaces

```typescript
// ✅ REQUIRED: Comprehensive component interface
interface ArticleCardProps {
  readonly article: {
    readonly id: string;
    readonly title: string;
    readonly excerpt: string;
    readonly author: {
      readonly name: string;
      readonly avatar?: string;
    };
    readonly publishedAt: Date;
    readonly tags: readonly string[];
    readonly status: 'draft' | 'published' | 'archived';
  };
  readonly showActions?: boolean;
  readonly onEdit?: (articleId: string) => void;
  readonly onDelete?: (articleId: string) => void;
  readonly onPublish?: (articleId: string) => void;
  readonly className?: string;
}

export const ArticleCard = ({
  article,
  showActions = false,
  onEdit,
  onDelete,
  onPublish,
  className
}: ArticleCardProps): JSX.Element => {
  const handleEdit = useCallback(() => {
    onEdit?.(article.id);
  }, [onEdit, article.id]);

  const handleDelete = useCallback(() => {
    onDelete?.(article.id);
  }, [onDelete, article.id]);

  const handlePublish = useCallback(() => {
    onPublish?.(article.id);
  }, [onPublish, article.id]);

  return (
    <Card className={className}>
      {/* Component implementation */}
    </Card>
  );
};
```

### Hook Type Definitions

```typescript
// ✅ REQUIRED: Strictly typed custom hooks
interface UseApiOptions<T> {
  readonly enabled?: boolean;
  readonly refetchInterval?: number;
  readonly onSuccess?: (data: T) => void;
  readonly onError?: (error: Error) => void;
}

interface UseApiResult<T> {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: Error | null;
  readonly refetch: () => Promise<void>;
}

export const useApi = <T>(
  endpoint: string, 
  options: UseApiOptions<T> = {}
): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const result = await response.json() as T;
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    if (options.enabled !== false) {
      void refetch();
    }
  }, [refetch, options.enabled]);

  return { data, loading, error, refetch };
};
```

## 🔧 Utility Type Patterns

### API Response Types

```typescript
// ✅ REQUIRED: Generic API response wrapper
interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
  readonly errors?: readonly string[];
  readonly meta?: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
  };
}

// ✅ REQUIRED: Paginated response type
interface PaginatedResponse<T> extends ApiResponse<readonly T[]> {
  readonly meta: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

// ✅ REQUIRED: Error response type
interface ErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
  };
  readonly timestamp: string;
}
```

### Form Handling Types

```typescript
// ✅ REQUIRED: Form field validation
interface FormFieldValidation {
  readonly required?: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: RegExp;
  readonly custom?: (value: string) => string | null;
}

interface FormField<T = string> {
  readonly value: T;
  readonly error: string | null;
  readonly touched: boolean;
  readonly validation?: FormFieldValidation;
}

interface ContactFormData {
  readonly name: FormField;
  readonly email: FormField;
  readonly message: FormField;
  readonly subject: FormField;
  readonly priority: FormField<'low' | 'medium' | 'high'>;
}

// ✅ REQUIRED: Form submission handler type
type FormSubmitHandler<T> = (data: T) => Promise<ApiResponse<unknown> | ErrorResponse>;
```

## 🛡️ Error Handling Types

### Comprehensive Error Types

```typescript
// ✅ REQUIRED: Application error hierarchy
abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
}

export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;
}

export class InternalServerError extends AppError {
  readonly code = 'INTERNAL_SERVER_ERROR';
  readonly statusCode = 500;
}

// ✅ REQUIRED: Result pattern for error handling
type Result<T, E = AppError> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export const createResult = <T>(data: T): Result<T> => ({
  success: true,
  data
});

export const createError = <E extends AppError>(error: E): Result<never, E> => ({
  success: false,
  error
});
```

## 📊 Data Modeling Standards

### Database Entity Types

```typescript
// ✅ REQUIRED: Base entity interface
interface BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

// ✅ REQUIRED: User entity with complete typing
interface User extends BaseEntity {
  readonly email: string;
  readonly name: string;
  readonly avatar: string | null;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly lastLoginAt: Date | null;
  readonly emailVerifiedAt: Date | null;
  readonly preferences: {
    readonly theme: 'light' | 'dark' | 'system';
    readonly language: 'en' | 'nb' | 'ar';
    readonly notifications: {
      readonly email: boolean;
      readonly push: boolean;
      readonly inApp: boolean;
    };
  };
}

// ✅ REQUIRED: Article entity with multilingual support
interface Article extends BaseEntity {
  readonly slug: string;
  readonly status: 'draft' | 'review' | 'published' | 'archived';
  readonly authorId: string;
  readonly author?: User;
  readonly publishedAt: Date | null;
  readonly scheduledAt: Date | null;
  readonly translations: {
    readonly en?: {
      readonly title: string;
      readonly content: string;
      readonly excerpt: string;
      readonly seoTitle?: string;
      readonly seoDescription?: string;
    };
    readonly nb?: {
      readonly title: string;
      readonly content: string;
      readonly excerpt: string;
      readonly seoTitle?: string;
      readonly seoDescription?: string;
    };
    readonly ar?: {
      readonly title: string;
      readonly content: string;
      readonly excerpt: string;
      readonly seoTitle?: string;
      readonly seoDescription?: string;
    };
  };
  readonly tags: readonly string[];
  readonly categories: readonly string[];
  readonly featured: boolean;
  readonly viewCount: number;
}
```

## 🔍 Type Guards and Validators

### Runtime Type Validation

```typescript
// ✅ REQUIRED: Type guard functions
export const isUser = (value: unknown): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as User).id === 'string' &&
    typeof (value as User).email === 'string' &&
    typeof (value as User).name === 'string' &&
    Object.values(USER_ROLES).includes((value as User).role)
  );
};

export const isApiResponse = <T>(
  value: unknown,
  dataValidator: (data: unknown) => data is T
): value is ApiResponse<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ApiResponse<T>).success === 'boolean' &&
    dataValidator((value as ApiResponse<T>).data)
  );
};

// ✅ REQUIRED: Zod schema validation
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'editor', 'viewer']),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable()
});

export type UserSchemaType = z.infer<typeof UserSchema>;
```

## 🚫 Forbidden Patterns

### ❌ NEVER Use These Patterns

```typescript
// ❌ FORBIDDEN: Any type usage
const userData: any = await fetchUser(); // NEVER USE ANY

// ❌ FORBIDDEN: Implicit return types
const getUserName = (user) => user.name; // Missing parameter and return types

// ❌ FORBIDDEN: Mutable interfaces
interface BadUser {
  id: string;        // Should be readonly
  name: string;      // Should be readonly
  email: string;     // Should be readonly
}

// ❌ FORBIDDEN: Non-null assertion without validation
const user = userData!; // Dangerous assertion
const userName = user.name!; // Dangerous property access

// ❌ FORBIDDEN: Type casting without validation
const user = data as User; // Unsafe casting

// ❌ FORBIDDEN: Optional chaining abuse
const result = user?.profile?.settings?.theme?.mode?.preference; // Too deep
```

## ✅ Required Patterns

### ✅ ALWAYS Use These Patterns

```typescript
// ✅ REQUIRED: Explicit typing with validation
const validateAndGetUser = (data: unknown): User | null => {
  if (!isUser(data)) {
    return null;
  }
  return data;
};

// ✅ REQUIRED: Safe property access
const getUserTheme = (user: User | null): string => {
  return user?.preferences?.theme ?? 'system';
};

// ✅ REQUIRED: Comprehensive error handling
const fetchUserSafely = async (id: string): Promise<Result<User>> => {
  try {
    const response = await api.get(`/users/${id}`);
    const user = validateAndGetUser(response.data);
    
    if (!user) {
      return createError(new ValidationError('Invalid user data'));
    }
    
    return createResult(user);
  } catch (error) {
    if (error instanceof Error) {
      return createError(new InternalServerError(error.message));
    }
    return createError(new InternalServerError('Unknown error occurred'));
  }
};

// ✅ REQUIRED: Strict event handler typing
interface ButtonClickHandler {
  (event: React.MouseEvent<HTMLButtonElement>): void;
}

const handleButtonClick: ButtonClickHandler = (event) => {
  event.preventDefault();
  // Handle click logic
};
```

## 📋 Pre-Commit Checklist

**Before committing TypeScript code, verify:**

- [ ] ✅ No `any` types used anywhere
- [ ] ✅ All interfaces use readonly properties
- [ ] ✅ All functions have explicit return types
- [ ] ✅ All React components return `JSX.Element`
- [ ] ✅ Type guards used for runtime validation
- [ ] ✅ Error handling with Result pattern
- [ ] ✅ No non-null assertions without validation
- [ ] ✅ No unsafe type casting
- [ ] ✅ Strict null checks passing
- [ ] ✅ No TypeScript errors or warnings

## 🎯 Success Metrics

**Every TypeScript file MUST achieve:**
- ✅ 100% type coverage (no `any` types)
- ✅ Zero TypeScript errors
- ✅ Zero TypeScript warnings
- ✅ Strict mode compliance
- ✅ Proper error handling patterns
- ✅ Runtime type validation where needed
- ✅ Consistent interface design
- ✅ Explicit return type annotations

**VIOLATION CONSEQUENCES**: Code that doesn't meet these TypeScript standards will be rejected during code review and must be refactored to comply.
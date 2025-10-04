# TypeScript Style Guide

## Type Definitions

### shadcn/ui Component Props
```typescript
// ✅ Import and extend shadcn/ui types
import type { ButtonProps, CardProps, ModalProps } from '@/components/ui/button';

// ✅ Extend shadcn/ui props for custom components
interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

// ✅ Form data interfaces
interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  acceptTerms: boolean;
}
```

### Event Handler Types
```typescript
// ✅ Proper event handler typing
interface FormComponentProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  onChange: (field: keyof UserFormData, value: string | boolean) => void;
  onError: (error: string) => void;
}

// ✅ Modal event handlers
interface ModalComponentProps extends Omit<ModalProps, 'onClose'> {
  onClose: () => void;
  onConfirm?: () => Promise<void>;
  onCancel?: () => void;
}
```

## Component Type Patterns

### Functional Components
```typescript
import { FC, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ✅ Explicit return type for components
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  onAddToCart: (productId: string) => void;
}

const ProductCard: FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const handleAddToCart = (): void => {
    onAddToCart(product.id);
  };

  return (
    <Card className="max-w-sm">
      <CardContent className="p-4">
        <img src={product.image} alt={product.name} />
        <h5 className="text-xl font-bold">{product.name}</h5>
        <span className="text-2xl font-bold">${product.price}</span>
        <Button onClick={handleAddToCart}>Add to Cart</Button>
      </CardContent>
    </Card>
  );
};
```

### Generic Components
```typescript
// ✅ Generic table component with shadcn/ui
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (item: T) => void;
}

function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick
}: DataTableProps<T>): JSX.Element {
  return (
    <Table>
      <TableHeader>
        {columns.map((column) => (
          <TableHead key={String(column.key)}>
            {column.header}
          </TableHead>
        ))}
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow
            key={item.id}
            onClick={() => onRowClick?.(item)}
            className={onRowClick ? 'cursor-pointer' : ''}
          >
            {columns.map((column) => (
              <TableCell key={String(column.key)}>
                {column.render
                  ? column.render(item[column.key], item)
                  : String(item[column.key])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Hook Typing

### State Hooks
```typescript
import { useState, useEffect } from 'react';
import type { User } from '@/types/user';

// ✅ Explicit state typing
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);

// ✅ Form state with proper typing
interface FormState {
  data: UserFormData;
  errors: Partial<Record<keyof UserFormData, string>>;
  isSubmitting: boolean;
}

const [formState, setFormState] = useState<FormState>({
  data: {
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    acceptTerms: false
  },
  errors: {},
  isSubmitting: false
});
```

### Custom Hooks
```typescript
// ✅ Custom hook with proper return typing
interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);

  const open = (): void => setIsOpen(true);
  const close = (): void => setIsOpen(false);
  const toggle = (): void => setIsOpen(prev => !prev);

  return { isOpen, open, close, toggle };
}

// ✅ API hook with error handling
interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useApi<T>(url: string): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: T = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}
```

## Form Validation Types

### Validation Schema
```typescript
// ✅ Validation rule types
type ValidationRule<T> = (value: T) => string | null;

interface ValidationSchema<T> {
  [K in keyof T]?: ValidationRule<T[K]>[];
}

// ✅ Form validation implementation
const userValidationSchema: ValidationSchema<UserFormData> = {
  firstName: [
    (value: string) => value.length < 2 ? 'First name must be at least 2 characters' : null,
    (value: string) => value.length > 50 ? 'First name must be less than 50 characters' : null
  ],
  email: [
    (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(value) ? 'Please enter a valid email address' : null;
    }
  ],
  acceptTerms: [
    (value: boolean) => !value ? 'You must accept the terms and conditions' : null
  ]
};

// ✅ Validation function with proper typing
function validateForm<T>(
  data: T,
  schema: ValidationSchema<T>
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const field in schema) {
    const rules = schema[field];
    if (rules) {
      for (const rule of rules) {
        const error = rule(data[field]);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    }
  }

  return errors;
}
```

## API Integration Types

### Response Types
```typescript
// ✅ API response interfaces
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ Error response type
interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}
```

### Service Functions
```typescript
// ✅ Typed API service functions
class UserService {
  private static readonly BASE_URL = '/api/users';

  static async getUsers(): Promise<User[]> {
    const response = await fetch(this.BASE_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    
    const result: ApiResponse<User[]> = await response.json();
    return result.data;
  }

  static async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const response = await fetch(this.BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message);
    }

    const result: ApiResponse<User> = await response.json();
    return result.data;
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await fetch(`${this.BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message);
    }

    const result: ApiResponse<User> = await response.json();
    return result.data;
  }
}
```

## Strict Mode Configuration

### TSConfig Settings
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

### Type Guards
```typescript
// ✅ Type guard functions
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    'firstName' in obj &&
    'lastName' in obj
  );
}

// ✅ Usage with type guards
function processUserData(data: unknown): User | null {
  if (!isUser(data)) {
    console.error('Invalid user data received');
    return null;
  }
  
  return data; // TypeScript knows this is User type
}
```

## Error Handling Types

### Error Boundaries
```typescript
import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      return (
        <Alert variant="destructive">
          <AlertDescription>
            <span className="font-medium">Something went wrong!</span>
            <p>{this.state.error.message}</p>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

# Development Best Practices

## Context

Global development guidelines for Agent OS projects.

<conditional-block context-check="core-principles">
IF this Core Principles section already read in current context:
  SKIP: Re-reading this section
  NOTE: "Using Core Principles already in context"
ELSE:
  READ: The following principles

## Core Principles

### Keep It Simple
- Implement code in the fewest lines possible
- Avoid over-engineering solutions
- Choose straightforward approaches over clever ones

### Optimize for Readability
- Prioritize code clarity over micro-optimizations
- Write self-documenting code with clear variable names
- Add comments for "why" not "what"

### DRY (Don't Repeat Yourself)
- Extract repeated business logic to private methods
- Use shadcn/ui components instead of custom UI markup
- Leverage shadcn/ui's pre-built component library (built on Radix UI + Tailwind) to avoid reinventing common patterns
- Create utility functions for common operations
- Extend shadcn/ui components when customization is needed rather than building from scratch

### File Structure
- Keep files focused on a single responsibility
- Group related functionality together
- Use consistent naming conventions
</conditional-block>

<conditional-block context-check="dependencies" task-condition="choosing-external-library">
IF current task involves choosing an external library:
  IF Dependencies section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Dependencies guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Dependencies section not relevant to current task

## Dependencies

### Choose Libraries Wisely
When adding third-party dependencies:
- **Prioritize shadcn/ui components** for all UI elements before considering alternatives
- Use shadcn/ui (https://ui.shadcn.com/) for React/Next.js projects
- Follow shadcn/ui's installation and usage guide (https://ui.shadcn.com/docs/installation)
- For non-UI dependencies, select the most popular and actively maintained option
- Check the library's GitHub repository for:
  - Recent commits (within last 6 months)
  - Active issue resolution
  - Number of stars/downloads
  - Clear documentation
</conditional-block>

<conditional-block context-check="shadcn-guidelines" task-condition="ui-development">
IF current task involves UI development or component creation:
  IF shadcn/ui guidelines already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using shadcn/ui guidelines already in context"
  ELSE:
    READ: The following shadcn/ui integration guidelines

## shadcn/ui Integration Guidelines

### Component Usage Priority
1. **First Choice**: Use existing shadcn/ui components from @/components/ui
2. **Second Choice**: Extend shadcn/ui components with custom variants/styling
3. **Last Resort**: Create custom components only when shadcn/ui doesn't provide the functionality

### shadcn/ui Integration
- Install: `npx shadcn-ui@latest init`
- Import components: `import { Button } from "@/components/ui/button"`
- Use shadcn/ui's TypeScript definitions for type safety
- Follow shadcn/ui's theming system with CSS variables for consistent styling

### Next.js Specific Guidelines
- Configure shadcn/ui in `components.json` as per official documentation
- Use shadcn/ui's server-side rendering compatible components (built on Radix UI)
- Implement shadcn/ui's dark mode support through CSS variables and next-themes
- Leverage shadcn/ui's responsive design patterns with Tailwind CSS

### Customization Best Practices
- Use shadcn/ui's CSS variable system for global styling changes
- Extend component variants rather than overriding CSS classes
- Maintain shadcn/ui's accessibility standards when customizing (inherited from Radix UI)
- Document any custom extensions for team consistency

ELSE:
  SKIP: shadcn/ui guidelines not relevant to current task
</conditional-block>

## Code Quality Standards

### TypeScript Requirements (Zero Tolerance)
- Use explicit return types for ALL functions
- Prohibit 'any' type usage - create specific interfaces/types
- Enable strict mode in all TypeScript configurations
- Handle null/undefined cases explicitly with proper type guards
- Use exact optional property types (?:)

### Code Structure Standards
- Maximum file length: 200 lines
- Maximum function length: 20 lines
- Add comprehensive JSDoc to all public methods and classes
- Follow SOLID principles strictly
- Prefer composition over inheritance
- Maintain cyclomatic complexity under 10

### Frontend Architecture Rules
- Never use raw HTML elements (div, span, p, h1-h6) in pages
- Always use semantic components from Flowbite React
- Extend all pages from BasePage component pattern
- Use Flowbite design tokens for all styling decisions
- Never hardcode colors, spacing, or typography values
- Implement class-variance-authority for component variants

## Flowbite Development Patterns

### Component Composition
```typescript
// Good: Compose Flowbite components
import { Card, Button, Badge } from 'flowbite-react';

interface ProductCardProps {
  title: string;
  price: number;
  status: 'available' | 'sold' | 'pending';
}

const ProductCard: React.FC<ProductCardProps> = ({ title, price, status }) => (
  <Card className="max-w-sm">
    <div className="flex justify-between items-start">
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h5>
      <Badge color={status === 'available' ? 'green' : status === 'sold' ? 'red' : 'yellow'}>
        {status}
      </Badge>
    </div>
    <p className="font-normal text-gray-700 dark:text-gray-400">
      ${price.toFixed(2)}
    </p>
    <Button>
      {status === 'available' ? 'Add to cart' : 'View details'}
    </Button>
  </Card>
);
```

### State Management with Flowbite
```typescript
import { useState } from 'react';
import { Modal, Button, Alert } from 'flowbite-react';

const useFlowbiteModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setError(null);
  };

  const handleAction = async (action: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await action();
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { isOpen, loading, error, openModal, closeModal, handleAction };
};
```

### Form Handling with Flowbite
```typescript
import { useForm } from 'react-hook-form';
import { TextInput, Label, Button, Alert } from 'flowbite-react';

interface FormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="email" value="Your email" />
        <TextInput
          id="email"
          type="email"
          {...register('email', { required: 'Email is required' })}
          color={errors.email ? 'failure' : undefined}
          helperText={errors.email?.message}
        />
      </div>
      
      <div>
        <Label htmlFor="password" value="Your password" />
        <TextInput
          id="password"
          type="password"
          {...register('password', { required: 'Password is required' })}
          color={errors.password ? 'failure' : undefined}
          helperText={errors.password?.message}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};
```

## Performance Best Practices

### Component Optimization
```typescript
import { memo, useMemo, useCallback } from 'react';
import { Card, Button } from 'flowbite-react';

interface OptimizedCardProps {
  items: Array<{ id: string; title: string; price: number }>;
  onItemClick: (id: string) => void;
}

const OptimizedCard = memo<OptimizedCardProps>(({ items, onItemClick }) => {
  const sortedItems = useMemo(() => 
    items.sort((a, b) => a.price - b.price), 
    [items]
  );

  const handleClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedItems.map(item => (
        <Card key={item.id} className="max-w-sm">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {item.title}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            ${item.price.toFixed(2)}
          </p>
          <Button onClick={() => handleClick(item.id)}>
            View details
          </Button>
        </Card>
      ))}
    </div>
  );
});
```

### Lazy Loading Flowbite Components
```typescript
import { lazy, Suspense } from 'react';
import { Spinner } from 'flowbite-react';

// Lazy load heavy components
const DataTable = lazy(() => import('./components/DataTable'));
const Chart = lazy(() => import('./components/Chart'));

const Dashboard: React.FC = () => (
  <div className="space-y-6">
    <Suspense fallback={<Spinner size="xl" />}>
      <DataTable />
    </Suspense>
    
    <Suspense fallback={<Spinner size="xl" />}>
      <Chart />
    </Suspense>
  </div>
);
```

## Accessibility Standards

### ARIA Implementation
```typescript
import { Button, Modal, Alert } from 'flowbite-react';
import { useState } from 'react';

const AccessibleModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        aria-describedby="modal-description"
      >
        Open Modal
      </Button>
      
      <Modal 
        show={isOpen} 
        onClose={() => setIsOpen(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Modal.Header id="modal-title">
          Accessible Modal Title
        </Modal.Header>
        <Modal.Body>
          <p id="modal-description">
            This modal follows accessibility best practices with proper ARIA labels.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
```

### Keyboard Navigation
```typescript
import { useEffect, useRef } from 'react';
import { Button } from 'flowbite-react';

const KeyboardNavigableComponent: React.FC = () => {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus first button on mount
    firstButtonRef.current?.focus();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Handle escape key
      event.currentTarget.blur();
    }
  };

  return (
    <div onKeyDown={handleKeyDown} role="toolbar" aria-label="Action buttons">
      <Button ref={firstButtonRef} tabIndex={0}>
        First Action
      </Button>
      <Button tabIndex={0}>
        Second Action
      </Button>
    </div>
  );
};
```

## Error Handling Patterns

### Error Boundaries with Flowbite
```typescript
import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button } from 'flowbite-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class FlowbiteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert color="failure" className="m-4">
          <div className="flex flex-col space-y-4">
            <div>
              <h3 className="text-lg font-medium">Something went wrong</h3>
              <p className="text-sm">{this.state.error?.message}</p>
            </div>
            <Button 
              size="sm" 
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Try again
            </Button>
          </div>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling
```typescript
import { useState } from 'react';
import { Alert, Button, Spinner } from 'flowbite-react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const useApiCall = <T,>(apiCall: () => Promise<T>) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async () => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      });
    }
  };

  return { ...state, execute };
};

// Usage
const DataComponent: React.FC = () => {
  const { data, loading, error, execute } = useApiCall(fetchData);

  if (loading) return <Spinner size="xl" />;
  
  if (error) {
    return (
      <Alert color="failure">
        <div className="flex justify-between items-center">
          <span>{error}</span>
          <Button size="sm" onClick={execute}>
            Retry
          </Button>
        </div>
      </Alert>
    );
  }

  return <div>{/* Render data */}</div>;
};
```

## Testing Strategies

### Component Testing
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Button, Modal } from 'flowbite-react';
import { vi } from 'vitest';

describe('Flowbite Component Integration', () => {
  it('should handle modal interactions correctly', async () => {
    const onClose = vi.fn();
    
    render(
      <Modal show={true} onClose={onClose}>
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    );

    // Test modal is visible
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    
    // Test close functionality
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle button states correctly', () => {
    const onClick = vi.fn();
    
    render(
      <Button onClick={onClick} disabled={false}>
        Click me
      </Button>
    );

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).not.toBeDisabled();
    
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

## Security Best Practices

### Input Validation
```typescript
import { TextInput, Label, Alert } from 'flowbite-react';
import { useState } from 'react';

const SecureForm: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const validateInput = (value: string): boolean => {
    // Sanitize and validate input
    const sanitized = value.trim();
    
    if (sanitized.length < 3) {
      setError('Input must be at least 3 characters');
      return false;
    }
    
    if (!/^[a-zA-Z0-9\s]+$/.test(sanitized)) {
      setError('Input contains invalid characters');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    validateInput(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="secure-input" value="Secure Input" />
        <TextInput
          id="secure-input"
          value={input}
          onChange={handleChange}
          color={error ? 'failure' : 'gray'}
          helperText={error}
        />
      </div>
      
      {error && (
        <Alert color="failure">
          {error}
        </Alert>
      )}
    </div>
  );
};
```

## Deployment Considerations

### Environment Configuration
```typescript
// config/flowbite.config.ts
export const flowbiteConfig = {
  theme: {
    extend: {
      colors: {
        primary: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#3b82f6',
        secondary: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#6b7280',
      },
    },
  },
  darkMode: process.env.NEXT_PUBLIC_DARK_MODE_ENABLED === 'true',
  plugins: [require('flowbite/plugin')],
};
```

### Build Optimization
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config) => {
    // Optimize Flowbite bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
      'flowbite-react': 'flowbite-react/lib/esm',
    };
    return config;
  },
};
```

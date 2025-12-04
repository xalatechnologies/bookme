# Contributing to BookMe

First off, thank you for considering contributing to BookMe! It's people like you that make BookMe such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm
- Git
- Supabase account (for backend development)

### Setup Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/bookme-1.git
   cd bookme-1
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Setup Test Users** (optional)
   ```bash
   node scripts/setup/users/setup-test-users.js
   ```

For detailed setup instructions, see [docs/guides/DEVELOPMENT_SETUP.md](docs/guides/).

## Development Process

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Workflow

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following our coding standards
   - Add/update tests
   - Update documentation

3. **Test Locally**
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define types for all functions and variables
- Avoid `any` type - use `unknown` if necessary
- Use interfaces for object shapes

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad
function getUser(id: any): any {
  // ...
}
```

### React Components

- Use functional components with hooks
- Use named exports for components
- Keep components small and focused
- Extract reusable logic into custom hooks

```typescript
// ✅ Good
export function UserProfile({ userId }: { userId: string }) {
  const { data, loading } = useUser(userId);
  
  if (loading) return <Spinner />;
  return <div>{data.name}</div>;
}

// ❌ Bad
export default function UserProfile(props: any) {
  // ... complex logic
}
```

### File Organization

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── features/        # Feature-specific components
│   └── shared/          # Shared utilities
├── hooks/               # Custom React hooks
├── services/            # API services
├── types/               # TypeScript types
└── utils/               # Utility functions
```

### Naming Conventions

- **Components:** PascalCase (`UserProfile.tsx`)
- **Hooks:** camelCase starting with 'use' (`useAuth.ts`)
- **Utilities:** camelCase (`formatDate.ts`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Types/Interfaces:** PascalCase (`User`, `AuthState`)

### Styling

- Use Tailwind CSS classes
- Follow mobile-first approach
- Use CSS variables for theme colors
- Avoid inline styles

```tsx
// ✅ Good
<button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
  Click Me
</button>

// ❌ Bad
<button style={{ padding: '8px 16px', backgroundColor: 'blue' }}>
  Click Me
</button>
```

### Internationalization

- Use translation keys, not hardcoded strings
- Add translations for both Norwegian (primary) and English
- Use the `useTranslation` hook

```typescript
// ✅ Good
const { t } = useTranslation();
return <h1>{t('welcome.title')}</h1>;

// ❌ Bad
return <h1>Welcome to BookMe</h1>;
```

### Testing

- Write tests for new features
- Maintain or improve code coverage
- Test edge cases and error scenarios

```typescript
// Component test example
describe('UserProfile', () => {
  it('displays user name', async () => {
    render(<UserProfile userId="123" />);
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<UserProfile userId="123" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

## Submitting Changes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(auth): add password reset functionality

- Add reset password API endpoint
- Create reset password form component
- Add email notification

Closes #123
```

### Pull Request Process

1. **Update Documentation**
   - Update README if needed
   - Add/update relevant docs in `/docs`
   - Update CHANGELOG.md

2. **Ensure Tests Pass**
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

3. **Create Pull Request**
   - Use clear, descriptive title
   - Fill out PR template completely
   - Link related issues
   - Add screenshots for UI changes

4. **Code Review**
   - Address reviewer comments
   - Keep discussion focused and professional
   - Make requested changes promptly

5. **Merge**
   - Squash commits if needed
   - Delete branch after merge

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code sections
- [ ] Updated documentation
- [ ] Added tests for new features
- [ ] All tests pass locally
- [ ] No new warnings or errors
- [ ] Updated CHANGELOG.md

## Reporting Bugs

### Before Submitting

1. Check existing issues
2. Verify it's reproducible
3. Test with latest version
4. Gather relevant information

### Bug Report Template

```markdown
**Describe the Bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]
- App version: [e.g., 1.0.0]

**Additional Context**
Any other relevant information.
```

## Feature Requests

We welcome feature requests! Please provide:

1. **Clear Description**
   - What problem does it solve?
   - How would it work?

2. **Use Cases**
   - Who would use this?
   - When would they use it?

3. **Alternatives**
   - What alternatives have you considered?
   - Why is this approach better?

4. **Additional Context**
   - Mockups or diagrams
   - Examples from other apps
   - Technical considerations

## Questions?

- Check [Documentation](docs/README.md)
- Ask in discussions/issues
- Contact maintainers

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributors page

Thank you for contributing! 🎉

---

**Need Help?** See our [Development Setup Guide](docs/guides/) or create an issue.

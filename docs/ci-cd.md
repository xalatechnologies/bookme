# CI/CD Pipeline Documentation

This document describes the continuous integration and continuous deployment pipeline for the Booknor Portal application.

## GitHub Actions Workflow

The CI/CD pipeline is implemented using GitHub Actions and is defined in `.github/workflows/ci.yml`.

### Workflow Triggers

The workflow is triggered on:
- Push events to the `main` branch
- Pull request events to the `main` branch

### Jobs

#### build-and-test
This job runs on Ubuntu latest with Node.js versions 18.x and 20.x.

**Steps:**
1. Checkout repository
2. Setup Node.js environment
3. Install pnpm package manager
4. Install project dependencies
5. Run TypeScript type checking
6. Run ESLint code linting
7. Run unit tests with coverage
8. Build the application
9. Upload coverage to Codecov

### Environment Variables

The workflow requires the following secrets:
- `CODECOV_TOKEN`: Token for uploading coverage reports to Codecov

## Quality Gates

The CI pipeline enforces several quality gates:

### Type Checking
- Runs `pnpm run type-check` to ensure TypeScript compilation succeeds
- Prevents merging code with type errors

### Code Linting
- Runs `pnpm run lint` to enforce code style and quality standards
- Prevents merging code that doesn't meet linting requirements

### Unit Tests
- Runs `pnpm run test:ci` to execute the test suite
- Generates coverage reports for Codecov integration
- Ensures code changes don't break existing functionality

### Build Process
- Runs `pnpm run build` to verify the application can be built successfully
- Ensures production builds are working correctly

## Bundle Analysis

The build process includes bundle analysis using `rollup-plugin-visualizer`:

- Generates `stats.html` with detailed bundle size information
- Provides gzip and brotli size information
- Helps identify opportunities for bundle size optimization

To analyze the bundle locally:
```bash
pnpm run build
open stats.html
```

## Branch Protection Rules

The `main` branch should have the following protection rules:

1. Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Status checks: build-and-test job from CI workflow

2. Require linear history
3. Require signed commits (optional but recommended)
4. Allow force pushes (disabled)
5. Allow deletions (disabled)

## Deployment Strategy

### Development
- Automatic deployment on push to `main` branch
- Deploys to staging environment for testing

### Production
- Manual deployment triggered by release creation
- Deploys to production environment
- Requires approval from designated team members

## Monitoring and Observability

### Code Coverage
- Codecov integration provides coverage reports
- Coverage thresholds can be configured to prevent merging low-coverage code

### Performance Monitoring
- Web Vitals integration for performance metrics
- Bundle size monitoring through visualizer reports

### Error Tracking
- Sentry integration for frontend error tracking (if configured)
- Logging best practices should be followed in application code

## Best Practices

### Pull Requests
1. Ensure all CI checks pass before requesting review
2. Keep pull requests small and focused
3. Include relevant tests for new functionality
4. Update documentation when making significant changes

### Commit Messages
1. Follow conventional commit format
2. Include issue references when applicable
3. Keep commits focused on single changes

### Code Review
1. At least one approval required before merging
2. Reviewers should check for security issues
3. Reviewers should verify code quality and best practices
4. Reviewers should ensure adequate test coverage
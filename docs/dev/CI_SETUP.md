# CI/CD Setup Guide

This document describes the Continuous Integration and Continuous Deployment (CI/CD) setup for the Booknor project.

## Overview

The Booknor project uses a comprehensive testing and quality assurance pipeline that should be integrated into your CI/CD system. This guide provides configuration examples for popular CI/CD platforms.

## Test Infrastructure

### Testing Tools

- **Vitest**: Unit and integration testing
- **Playwright**: End-to-end (E2E) testing
- **ESLint**: Code linting and style checking
- **TypeScript**: Type checking

### Available Test Commands

```bash
# Linting
npm run lint                 # Run ESLint on all files

# Unit Tests
npm run test:unit            # Run unit tests
npm run test:integration     # Run integration tests
npm run test:watch           # Run tests in watch mode
npm run test:ui              # Run tests with UI
npm run test:coverage        # Run tests with coverage report

# E2E Tests
npm run test:e2e             # Run all E2E tests
npm run test:e2e:ui          # Run E2E tests with UI
npm run test:e2e:headed      # Run E2E tests in headed mode
npm run test:e2e:debug       # Run E2E tests in debug mode
npm run test:e2e:chromium    # Run E2E tests in Chromium only
npm run test:e2e:firefox     # Run E2E tests in Firefox only
npm run test:e2e:webkit      # Run E2E tests in WebKit only

# All Tests
npm run test:all             # Run all tests (unit + integration + e2e)

# Build
npm run build                # Build production bundle
```

## CI Pipeline Stages

A typical CI pipeline should include the following stages:

### 1. Install Dependencies

```bash
npm ci
```

> **Note**: Use `npm ci` instead of `npm install` for faster, more reliable installs in CI environments.

### 2. Lint

```bash
npm run lint
```

**Purpose**: Ensure code quality and consistency

**Exit Code**: Should be 0 for pipeline to continue

### 3. Type Check

TypeScript compilation is included in the build step, but you can add an explicit type check:

```bash
npx tsc --noEmit
```

### 4. Unit Tests

```bash
npm run test:unit
```

**Purpose**: Test individual components and functions in isolation

**Coverage Thresholds** (configured in `vitest.config.ts`):
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

### 5. Integration Tests

```bash
npm run test:integration
```

**Purpose**: Test interactions between components and services

### 6. Build

```bash
npm run build
```

**Purpose**: Verify that the application builds successfully

**Artifacts**: Production-ready files in `dist/` directory

### 7. E2E Tests (Optional)

```bash
npm run test:e2e
```

**Purpose**: Test complete user flows in a real browser

**Note**: E2E tests require a running application and may take longer. Consider running these:
- On main/production branches only
- As a separate job/stage
- With retry logic (configured in `playwright.config.ts`)

## GitHub Actions Configuration

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    name: Lint and Test
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Build application
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7
  
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: lint-and-test
    
    env:
      PLAYWRIGHT_BASE_URL: http://localhost:5173
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
      
      - name: Upload test videos
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-videos
          path: test-results/
          retention-days: 7
```

## Azure DevOps Pipeline

Create `azure-pipelines.yml`:

```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '20.x'

stages:
  - stage: Build
    displayName: 'Build and Test'
    jobs:
      - job: LintAndTest
        displayName: 'Lint and Test'
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)
            displayName: 'Install Node.js'
          
          - script: npm ci
            displayName: 'Install dependencies'
          
          - script: npm run lint
            displayName: 'Run linter'
          
          - script: npm run test:unit
            displayName: 'Run unit tests'
          
          - script: npm run test:integration
            displayName: 'Run integration tests'
          
          - script: npm run build
            displayName: 'Build application'
          
          - task: PublishBuildArtifacts@1
            inputs:
              pathToPublish: 'dist'
              artifactName: 'dist'
            displayName: 'Publish build artifacts'
      
      - job: E2ETests
        displayName: 'E2E Tests'
        dependsOn: LintAndTest
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: $(nodeVersion)
            displayName: 'Install Node.js'
          
          - script: npm ci
            displayName: 'Install dependencies'
          
          - script: npx playwright install --with-deps
            displayName: 'Install Playwright browsers'
          
          - script: npm run test:e2e
            displayName: 'Run E2E tests'
            env:
              CI: true
          
          - task: PublishTestResults@2
            condition: always()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results/junit.xml'
            displayName: 'Publish test results'
          
          - task: PublishBuildArtifacts@1
            condition: always()
            inputs:
              pathToPublish: 'playwright-report'
              artifactName: 'playwright-report'
            displayName: 'Publish Playwright report'
```

## GitLab CI

Create `.gitlab-ci.yml`:

```yaml
image: node:20

stages:
  - install
  - lint
  - test
  - build
  - e2e

cache:
  paths:
    - node_modules/
    - .npm/

install:
  stage: install
  script:
    - npm ci --cache .npm --prefer-offline
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 day

lint:
  stage: lint
  dependencies:
    - install
  script:
    - npm run lint

unit-tests:
  stage: test
  dependencies:
    - install
  script:
    - npm run test:unit
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

integration-tests:
  stage: test
  dependencies:
    - install
  script:
    - npm run test:integration

build:
  stage: build
  dependencies:
    - install
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

e2e-tests:
  stage: e2e
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  dependencies:
    - install
  script:
    - npm run test:e2e
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    expire_in: 1 week
  only:
    - main
    - develop
```

## Environment Variables

### Required Environment Variables

The following environment variables should be configured in your CI/CD system:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox (if using maps)
VITE_MAPBOX_TOKEN=your_mapbox_token

# Test Environment
CI=true
PLAYWRIGHT_BASE_URL=http://localhost:5173
```

### Secrets Management

- **GitHub Actions**: Use GitHub Secrets
- **Azure DevOps**: Use Variable Groups with secret variables
- **GitLab CI**: Use CI/CD Variables with "Masked" and "Protected" flags

## Caching Strategy

### Node Modules

Cache `node_modules/` to speed up subsequent builds:

**GitHub Actions**:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

**Azure DevOps**:
```yaml
- task: Cache@2
  inputs:
    key: 'npm | "$(Agent.OS)" | package-lock.json'
    path: $(npm_config_cache)
```

**GitLab CI**:
```yaml
cache:
  paths:
    - node_modules/
    - .npm/
```

### Playwright Browsers

Playwright browsers can be cached to avoid re-downloading:

```yaml
- task: Cache@2
  inputs:
    key: 'playwright | "$(Agent.OS)" | package-lock.json'
    path: ~/.cache/ms-playwright
```

## Test Reporting

### Coverage Reports

Coverage reports are generated in multiple formats:
- **Text**: Console output
- **HTML**: `coverage/index.html`
- **LCOV**: `coverage/lcov.info` (for tools like Codecov, Coveralls)
- **JSON**: `coverage/coverage-final.json`

### E2E Test Reports

Playwright generates:
- **HTML Report**: `playwright-report/index.html`
- **JSON Report**: `test-results/results.json`
- **JUnit XML**: `test-results/junit.xml` (for CI integration)

## Quality Gates

### Recommended Quality Gates

1. **Lint**: Must pass with 0 errors
2. **Unit Tests**: Must pass with >80% coverage
3. **Integration Tests**: Must pass
4. **Build**: Must complete successfully
5. **E2E Tests**: Must pass (on main/develop branches)

### Failing the Pipeline

Configure your CI to fail if:
- Linting has errors
- Any test fails
- Coverage drops below threshold
- Build fails

## Performance Optimization

### Parallel Execution

Run independent jobs in parallel:
- Lint + Unit Tests + Integration Tests can run in parallel
- E2E tests should run after build succeeds

### Selective Test Execution

For pull requests, consider:
- Running only unit and integration tests
- Running E2E tests only on merge to main/develop
- Running specific E2E tests based on changed files

### Build Optimization

- Use `npm ci` instead of `npm install`
- Cache dependencies between runs
- Use build artifacts to avoid rebuilding

## Monitoring and Alerts

### Recommended Integrations

- **Slack/Teams**: Notify on build failures
- **Email**: Send reports to team
- **Dashboard**: Display build status
- **Codecov/Coveralls**: Track coverage trends

## Troubleshooting

### Common Issues

**Issue**: E2E tests fail in CI but pass locally
- **Solution**: Ensure environment variables are set correctly
- **Solution**: Check that the dev server is running before tests start
- **Solution**: Increase timeouts in `playwright.config.ts`

**Issue**: Tests are flaky
- **Solution**: Enable retries in Playwright config (already configured)
- **Solution**: Use proper wait conditions instead of fixed timeouts
- **Solution**: Run tests sequentially if they have shared state

**Issue**: Build takes too long
- **Solution**: Enable caching for node_modules and Playwright browsers
- **Solution**: Run jobs in parallel where possible
- **Solution**: Use a faster CI runner

## Local Verification

Before pushing code, verify locally:

```bash
# Run all checks that CI will run
npm run lint
npm run test:unit
npm run test:integration
npm run build

# Optional: Run E2E tests
npm run test:e2e
```

## Next Steps

1. Choose your CI/CD platform (GitHub Actions, Azure DevOps, GitLab CI, etc.)
2. Copy the appropriate configuration file to your repository
3. Configure environment variables and secrets
4. Enable the CI/CD pipeline in your platform
5. Test the pipeline with a pull request
6. Monitor and optimize based on results

## References

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure Pipelines Documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/)
- [GitLab CI Documentation](https://docs.gitlab.com/ee/ci/)

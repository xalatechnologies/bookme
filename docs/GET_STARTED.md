# 🚀 Get Started with BookMe Testing

## Quick Installation Guide

### Step 1: Install Dependencies

```bash
# Install all NPM dependencies (including testing packages)
npm install
```

This will install:
- Playwright for E2E testing
- Vitest for unit/integration testing
- React Testing Library
- Coverage tools
- And all other testing dependencies

### Step 2: Install Playwright Browsers

```bash
# Install browser drivers for E2E testing
npx playwright install
```

This installs Chromium, Firefox, and WebKit browsers for cross-browser testing.

### Step 3: Verify Installation

```bash
# Run verification script
./verify-testing-setup.sh
```

You should see all green checkmarks ✅ if everything is set up correctly.

### Step 4: Set Up Test Environment

Make sure `.env.test` exists with your test configuration:

```bash
# The file is already created, but verify it has:
cat .env.test
```

Should contain:
```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-test-anon-key
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password-123
TEST_ORG_ID=test-org-123
PLAYWRIGHT_BASE_URL=http://localhost:5173
```

### Step 5: Start Supabase (For Integration Tests)

```bash
# Start Supabase local development server
npx supabase start
```

This is only needed for integration tests. Unit and E2E tests don't require it.

### Step 6: Run Your First Test

```bash
# Option 1: Interactive E2E testing (Recommended for first time)
npm run test:e2e:ui

# Option 2: Run all tests
npm run test:all

# Option 3: Run only unit tests (fastest)
npm run test:unit
```

## 🎯 What to Try First

### 1. Interactive E2E Testing (Recommended)

```bash
npm run test:e2e:ui
```

This opens Playwright's UI where you can:
- See all test files
- Run tests individually
- Watch tests execute in real-time
- Debug failures easily
- See screenshots and videos

### 2. Watch Mode for Development

```bash
npm run test:watch
```

Great for TDD (Test-Driven Development):
- Automatically re-runs tests when you save files
- Fast feedback loop
- Perfect for writing new tests

### 3. Generate Coverage Report

```bash
npm run test:coverage
```

Then open the report:
```bash
open coverage/index.html
```

You'll see:
- Line coverage
- Function coverage
- Branch coverage
- Statement coverage
- Which files need more tests

## 📚 Learning the Tests

### Start with Simple Tests

1. **Unit Tests** - Easiest to understand
   ```bash
   # Look at a unit test example
   cat tests/unit/services/facilities.service.test.ts

   # Run just this test
   npm run test -- tests/unit/services/facilities.service.test.ts
   ```

2. **E2E Tests** - Most comprehensive
   ```bash
   # Look at an E2E test example
   cat tests/e2e/auth/login.spec.ts

   # Run just this test
   npx playwright test tests/e2e/auth/login.spec.ts --headed
   ```

3. **Integration Tests** - Real database operations
   ```bash
   # Look at integration test
   cat tests/integration/services/facilities-integration.test.ts

   # Run with Supabase running
   npx supabase start
   npm run test:integration
   ```

## 🔧 Common Tasks

### Running Specific Tests

```bash
# Run specific test file
npm run test -- path/to/test.test.ts

# Run tests matching a pattern
npm run test -- -t "should create booking"

# Run E2E test for specific feature
npx playwright test tests/e2e/bookings
```

### Debugging Tests

```bash
# Debug E2E test (opens debugger)
npm run test:e2e:debug

# Run E2E test in headed mode (see browser)
npm run test:e2e:headed

# Run specific E2E test in debug mode
npx playwright test tests/e2e/auth/login.spec.ts --debug
```

### Updating Tests

```bash
# Watch mode - auto re-run on changes
npm run test:watch

# Update snapshots
npm run test -- -u
```

## 📖 Documentation Quick Links

- **Complete Guide**: [TESTING_README.md](./TESTING_README.md)
- **Quick Reference**: [TESTING_QUICK_REFERENCE.md](./TESTING_QUICK_REFERENCE.md)
- **Implementation Details**: [TESTING_IMPLEMENTATION_COMPLETE.md](./TESTING_IMPLEMENTATION_COMPLETE.md)
- **All Files Created**: [FILES_CREATED.md](./FILES_CREATED.md)

## 🎨 Test Types Explained

### Unit Tests (30+ tests)
- **What**: Test individual functions and hooks
- **Speed**: Very fast (milliseconds)
- **When**: During development, before commits
- **Command**: `npm run test:unit`
- **Example**: Testing if `facilitiesService.create()` creates a facility

### Integration Tests (20+ tests)
- **What**: Test services with real Supabase database
- **Speed**: Medium (seconds)
- **When**: Before deployment, in CI/CD
- **Command**: `npm run test:integration`
- **Example**: Testing full CRUD operations with real database

### E2E Tests (121+ tests)
- **What**: Test complete user workflows in browser
- **Speed**: Slower (seconds to minutes)
- **When**: Before releases, in CI/CD
- **Command**: `npm run test:e2e`
- **Example**: Testing complete booking creation flow

## 🐛 Troubleshooting

### Tests Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules/.vite
npm run test -- --no-cache
```

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Browsers Not Installed

```bash
# Reinstall Playwright browsers
npx playwright install --force
```

### Supabase Not Running

```bash
# Check Supabase status
npx supabase status

# Start if not running
npx supabase start
```

## 🎯 Recommended Workflow

### For New Features

```bash
# 1. Start watch mode
npm run test:watch

# 2. Write failing test
# 3. Write code to make it pass
# 4. Refactor if needed
# 5. Run all tests before commit
npm run test:all
```

### Before Committing

```bash
# Run all tests
npm run test:all

# Check coverage
npm run test:coverage

# Ensure no failures
```

### Before Deploying

```bash
# 1. Start Supabase
npx supabase start

# 2. Run all tests
npm run test:all

# 3. Check coverage meets 80%+
npm run test:coverage

# 4. Review test report
npm run test:e2e:report
```

## 📊 Test Statistics

Your testing infrastructure includes:

- **171+ tests** across all types
- **9 E2E test suites** (121+ tests)
- **2 unit test suites** (30+ tests)
- **1 integration test suite** (20+ tests)
- **80%+ coverage target**
- **Multi-browser support** (Chrome, Firefox, Safari, Mobile)

## 🎉 You're Ready!

Everything is set up and ready to go. Start with:

```bash
# Quick start
npm install && npx playwright install && npm run test:e2e:ui
```

Or follow the steps above for a more detailed walkthrough.

For any questions or issues, refer to:
- [TESTING_README.md](./TESTING_README.md) - Complete troubleshooting guide
- [TESTING_QUICK_REFERENCE.md](./TESTING_QUICK_REFERENCE.md) - Quick command reference

**Happy Testing! 🚀**

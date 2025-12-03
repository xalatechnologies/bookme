# 🚀 Booknor Testing - Quick Reference Card

## ⚡ Installation (One-Time Setup)

```bash
# Install all dependencies
npm install

# Install Playwright browsers
npx playwright install

# Verify setup
./verify-testing-setup.sh
```

## 🎯 Running Tests

### All Tests
```bash
npm run test:all          # Run unit + integration + E2E
```

### Unit Tests (Fast)
```bash
npm run test:unit         # Run unit tests
npm run test:watch        # Watch mode for development
npm run test:ui           # Interactive UI mode
```

### Integration Tests (Requires Supabase)
```bash
npx supabase start        # Start Supabase local (first time)
npm run test:integration  # Run integration tests
```

### E2E Tests (Browser-based)
```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Interactive Playwright UI ⭐ Recommended
npm run test:e2e:headed   # See browser while testing
npm run test:e2e:debug    # Debug mode with pause
```

### Specific Browsers
```bash
npm run test:e2e:chromium # Chrome only
npm run test:e2e:firefox  # Firefox only
npm run test:e2e:webkit   # Safari only
```

### Coverage
```bash
npm run test:coverage     # Generate coverage report
open coverage/index.html  # View in browser
```

### Reports
```bash
npm run test:e2e:report   # View Playwright HTML report
```

## 📁 Test File Structure

```
tests/
├── e2e/                    # End-to-end tests (121+ tests)
│   ├── auth/               # Authentication (9 tests)
│   ├── bookings/           # Bookings (26 tests)
│   ├── facilities/         # Facilities (26 tests)
│   ├── favorites/          # Favorites (12 tests)
│   ├── messages/           # Messages (15 tests)
│   ├── notifications/      # Notifications (17 tests)
│   └── support/            # Support (16 tests)
│
├── unit/                   # Unit tests (30+ tests)
│   └── services/           # Service layer tests
│
├── integration/            # Integration tests (20+ tests)
│   └── services/           # Real Supabase tests
│
└── setup/                  # Test helpers
    ├── vitest-setup.ts
    ├── supabase-helpers.ts
    └── auth.setup.ts
```

## 🔧 Common Commands

| Task | Command |
|------|---------|
| Watch mode | `npm run test:watch` |
| Single file | `npm run test -- path/to/file.test.ts` |
| Update snapshots | `npm run test -- -u` |
| Debug specific test | `npx playwright test path/to/test.spec.ts --debug` |
| Run specific test | `npx playwright test -g "test name"` |
| Show test report | `npm run test:e2e:report` |

## 🐛 Troubleshooting

### Port Already in Use
```bash
lsof -ti:5173 | xargs kill -9
```

### Browsers Not Installed
```bash
npx playwright install
```

### Supabase Not Running
```bash
npx supabase start
```

### Auth State Issues
```bash
rm -rf tests/setup/.auth
npx playwright test --project=setup
```

### Clear Test Cache
```bash
rm -rf node_modules/.vite
npm run test -- --no-cache
```

## 📊 Test Statistics

- **Total Tests**: 171+
- **E2E Tests**: 121+ (9 files)
- **Unit Tests**: 30+ (2 files)
- **Integration Tests**: 20+ (1 file)
- **Coverage Target**: 80%+

## 🎨 Test Commands by Feature

### Authentication
```bash
npx playwright test tests/e2e/auth
```

### Facilities
```bash
npx playwright test tests/e2e/facilities
```

### Bookings
```bash
npx playwright test tests/e2e/bookings
```

### Favorites
```bash
npx playwright test tests/e2e/favorites
```

### Messages
```bash
npx playwright test tests/e2e/messages
```

### Support
```bash
npx playwright test tests/e2e/support
```

### Notifications
```bash
npx playwright test tests/e2e/notifications
```

## 🔍 Debugging Tips

### Playwright Inspector
```bash
npm run test:e2e:debug
```

### Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Pause on Specific Test
```typescript
test('my test', async ({ page }) => {
  await page.pause(); // Pauses here
  // ... rest of test
});
```

### Console Logs
```typescript
test('debug test', async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  // Your test code
});
```

## 📚 Documentation

- **Complete Guide**: `TESTING_README.md`
- **Implementation Details**: `TESTING_IMPLEMENTATION_COMPLETE.md`
- **Verification Script**: `./verify-testing-setup.sh`

## 🎯 Common Workflows

### Development Workflow
```bash
# 1. Start watch mode
npm run test:watch

# 2. Write code and tests
# 3. Tests auto-run on save
```

### Before Commit
```bash
# Run all tests
npm run test:all

# Check coverage
npm run test:coverage
```

### CI/CD Pipeline
```bash
# 1. Install dependencies
npm ci

# 2. Install browsers
npx playwright install --with-deps

# 3. Run tests
npm run test:all
```

## ⚙️ Environment Variables

Create `.env.test`:
```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-key
TEST_USER_EMAIL=test@example.com
TEST_ORG_ID=test-org-123
PLAYWRIGHT_BASE_URL=http://localhost:5173
```

## 🆘 Quick Help

```bash
# Verify setup
./verify-testing-setup.sh

# View all test scripts
npm run

# Playwright help
npx playwright test --help

# Vitest help
npx vitest --help
```

## 📞 Support Resources

- Playwright Docs: https://playwright.dev
- Vitest Docs: https://vitest.dev
- Testing Library: https://testing-library.com

---

**🎉 You're ready to test! Start with:**
```bash
npm install && npx playwright install && npm run test:all
```

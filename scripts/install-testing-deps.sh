#!/bin/bash

echo "📦 Installing BookMe Testing Dependencies..."
echo ""

echo "1️⃣ Installing NPM packages..."
npm install --save-dev \
  @playwright/test@^1.49.1 \
  @testing-library/jest-dom@^6.6.3 \
  @testing-library/react@^16.1.0 \
  @testing-library/user-event@^14.5.2 \
  @vitest/ui@^2.1.8 \
  @vitest/coverage-v8@^2.1.8 \
  dotenv@^16.4.7 \
  jsdom@^25.0.1 \
  vitest@^2.1.8

echo ""
echo "2️⃣ Installing Playwright browsers..."
npx playwright install

echo ""
echo "✅ Testing dependencies installed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Review .env.test configuration"
echo "  2. Start Supabase local: npx supabase start"
echo "  3. Run tests: npm run test:all"
echo ""
echo "📚 See TESTING_README.md for complete guide"

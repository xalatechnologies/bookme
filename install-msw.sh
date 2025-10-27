#!/bin/bash

# Install MSW (Mock Service Worker) for testing
# This script installs MSW if it's not already installed

echo "📦 Installing MSW for testing..."

# Check if MSW is installed
if npm list msw &>/dev/null; then
  echo "✅ MSW is already installed"
else
  echo "⏳ Installing MSW..."
  npm install -D msw@latest
  echo "✅ MSW installed successfully"
fi

# Verify installation
if npm list msw &>/dev/null; then
  echo ""
  echo "✨ Testing infrastructure is ready!"
  echo ""
  echo "Available test commands:"
  echo "  npm test              - Run unit tests"
  echo "  npm run test:unit     - Run unit tests"
  echo "  npm run test:integration - Run integration tests"
  echo "  npm run test:coverage - Run tests with coverage"
  echo "  npm run test:ui       - Open Vitest UI"
  echo "  npm run test:e2e      - Run E2E tests with Playwright"
  echo ""
  echo "📖 See TESTING_INFRASTRUCTURE.md for full documentation"
else
  echo "❌ Failed to install MSW"
  exit 1
fi

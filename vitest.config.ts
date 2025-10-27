import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest configuration for unit and integration testing
 *
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  plugins: [],

  test: {
    // Test environment
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./tests/setup/vitest-setup.ts'],

    // Global test utilities
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
        'src/types/database.ts', // Generated file
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },

    // Test patterns
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
    ],

    // Mock config
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,

    // Test timeout
    testTimeout: 10000,

    // Pool options
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

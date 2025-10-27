import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for Node.js environment (Vitest tests)
 *
 * This server intercepts HTTP requests during tests and returns
 * mock responses defined in the handlers.
 */
export const server = setupServer(...handlers);

/**
 * Start the server before tests
 */
export const startServer = (): void => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
};

/**
 * Reset handlers between tests
 */
export const resetServer = (): void => {
  server.resetHandlers();
};

/**
 * Stop the server after tests
 */
export const stopServer = (): void => {
  server.close();
};

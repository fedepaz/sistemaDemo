// apps/frontend/vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { server } from './src/__tests__/setup';
import { afterAll, afterEach, beforeAll } from 'vitest';

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

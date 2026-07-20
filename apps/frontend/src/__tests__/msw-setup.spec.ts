// apps/frontend/src/__tests__/msw-setup.spec.ts
import { describe, it, expect } from 'vitest';
import { server } from './setup';
import { http, HttpResponse } from 'msw';

describe('MSW Setup', () => {
  it('intercepts API requests', async () => {
    const response = await fetch('/api/users');
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('can override handlers per test', async () => {
    // Override the default handler for this test only
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json({
          data: [{ id: '1', username: 'test' }],
          total: 1,
        });
      })
    );

    const response = await fetch('/api/users');
    const data = await response.json();
    expect(data.data).toHaveLength(1);
    expect(data.data[0].username).toBe('test');
  });

  it('resets handlers after each test', async () => {
    // After the previous test's override, handlers should be reset
    const response = await fetch('/api/users');
    const data = await response.json();
    expect(data.data).toHaveLength(0);
  });
});

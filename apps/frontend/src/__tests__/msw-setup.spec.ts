import { server } from './setup';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('MSW Setup', () => {
  it('intercepts API requests', async () => {
    const response = await fetch('http://localhost/api/users');
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('can override handlers per test', async () => {
    server.use(
      http.get('http://localhost/api/users', () => {
        return HttpResponse.json({
          data: [{ id: '1', username: 'test' }],
          total: 1,
        });
      })
    );

    const response = await fetch('http://localhost/api/users');
    const data = await response.json();
    expect(data.data).toHaveLength(1);
    expect(data.data[0].username).toBe('test');
  });

  it('resets handlers after each test', async () => {
    const response = await fetch('http://localhost/api/users');
    const data = await response.json();
    expect(data.data).toHaveLength(0);
  });
});

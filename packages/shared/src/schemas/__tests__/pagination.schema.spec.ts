// packages/shared/src/schemas/__tests__/pagination.schema.spec.ts
import { paginationParamsSchema } from '../pagination.schema';

describe('paginationParamsSchema', () => {
  it('defaults page to 1 when missing', () => {
    const result = paginationParamsSchema.parse({});
    expect(result.page).toBe(1);
  });

  it('defaults limit to 50 when missing', () => {
    const result = paginationParamsSchema.parse({});
    expect(result.limit).toBe(50);
  });

  it('caps limit at 200', () => {
    const result = paginationParamsSchema.parse({ limit: '500' });
    expect(result.limit).toBe(200);
  });

  it('parses valid page number', () => {
    const result = paginationParamsSchema.parse({ page: '3' });
    expect(result.page).toBe(3);
  });

  it('parses valid limit', () => {
    const result = paginationParamsSchema.parse({ limit: '25' });
    expect(result.limit).toBe(25);
  });

  it('defaults page to 1 for invalid input', () => {
    const result = paginationParamsSchema.parse({ page: 'abc' });
    expect(result.page).toBe(1);
  });

  it('defaults limit to 50 for invalid input', () => {
    const result = paginationParamsSchema.parse({ limit: 'xyz' });
    expect(result.limit).toBe(50);
  });
});

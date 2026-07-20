// packages/shared/src/schemas/__tests__/enums.schema.spec.ts
import { ErrorCodeSchema } from '../../enums/error-codes';

describe('ErrorCodeSchema', () => {
  it('accepts valid error codes', () => {
    expect(ErrorCodeSchema.parse('INTERNAL_ERROR')).toBe('INTERNAL_ERROR');
    expect(ErrorCodeSchema.parse('AUTH_INVALID_CREDENTIALS')).toBe('AUTH_INVALID_CREDENTIALS');
    expect(ErrorCodeSchema.parse('VALIDATION_ERROR')).toBe('VALIDATION_ERROR');
    expect(ErrorCodeSchema.parse('NOT_FOUND')).toBe('NOT_FOUND');
  });

  it('rejects invalid error codes', () => {
    expect(() => ErrorCodeSchema.parse('INVALID_CODE')).toThrow();
    expect(() => ErrorCodeSchema.parse('')).toThrow();
  });

  it('has all expected error codes', () => {
    const values = ErrorCodeSchema.options;
    expect(values).toContain('INTERNAL_ERROR');
    expect(values).toContain('AUTH_INVALID_CREDENTIALS');
    expect(values).toContain('VALIDATION_ERROR');
    expect(values).toContain('FORBIDDEN');
  });
});

// packages/shared/src/schemas/__tests__/user.schema.spec.ts
import { UserProfileSchema, UpdateUserProfileSchema } from '../user.schema';

describe('UserProfileSchema', () => {
  const validUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'john_doe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    tenantName: 'Default Tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('accepts valid user profile', () => {
    const result = UserProfileSchema.parse(validUser);
    expect(result.username).toBe('john_doe');
    expect(result.email).toBe('john@example.com');
  });

  it('accepts user with null email', () => {
    const result = UserProfileSchema.parse({ ...validUser, email: null });
    expect(result.email).toBeNull();
  });

  it('accepts user without optional passwordHash', () => {
    const result = UserProfileSchema.parse(validUser);
    expect(result.passwordHash).toBeUndefined();
  });

  it('rejects empty username', () => {
    expect(() => UserProfileSchema.parse({ ...validUser, username: '' })).toThrow();
  });

  it('rejects invalid email format', () => {
    expect(() => UserProfileSchema.parse({ ...validUser, email: 'not-an-email' })).toThrow();
  });
});

describe('UpdateUserProfileSchema', () => {
  it('accepts valid update with firstName', () => {
    const result = UpdateUserProfileSchema.parse({ firstName: 'John' });
    expect(result.firstName).toBe('John');
  });

  it('accepts valid update with lastName', () => {
    const result = UpdateUserProfileSchema.parse({ lastName: 'Doe' });
    expect(result.lastName).toBe('Doe');
  });

  it('accepts valid update with email', () => {
    const result = UpdateUserProfileSchema.parse({ email: 'new@example.com' });
    expect(result.email).toBe('new@example.com');
  });

  it('accepts empty update', () => {
    const result = UpdateUserProfileSchema.parse({});
    expect(result).toEqual({});
  });

  it('rejects firstName longer than 50 characters', () => {
    expect(() =>
      UpdateUserProfileSchema.parse({ firstName: 'A'.repeat(51) })
    ).toThrow();
  });

  it('rejects invalid email format', () => {
    expect(() =>
      UpdateUserProfileSchema.parse({ email: 'invalid-email' })
    ).toThrow();
  });

  it('does not allow setting passwordHash via profile update', () => {
    const result = UpdateUserProfileSchema.parse({
      firstName: 'John',
      passwordHash: 'secret123',
    });
    expect(result).toEqual({ firstName: 'John' });
    expect('passwordHash' in result).toBe(false);
  });
});

// packages/shared/src/schemas/__tests__/auth.schema.spec.ts
import { passwordRules, ChangePasswordSchema, LoginAuthSchema } from '../auth.schema';

describe('passwordRules', () => {
  it('requires minimum 6 characters', () => {
    expect(() => passwordRules.parse('Ab1')).toThrow();
  });

  it('requires maximum 20 characters', () => {
    expect(() => passwordRules.parse('A'.repeat(21) + 'b1')).toThrow();
  });

  it('requires uppercase letter', () => {
    expect(() => passwordRules.parse('abcdef1')).toThrow();
  });

  it('requires lowercase letter', () => {
    expect(() => passwordRules.parse('ABCDEF1')).toThrow();
  });

  it('requires digit', () => {
    expect(() => passwordRules.parse('Abcdefg')).toThrow();
  });

  it('accepts valid password', () => {
    expect(passwordRules.parse('Abcdef1')).toBe('Abcdef1');
  });

  it('accepts password with special characters', () => {
    expect(passwordRules.parse('Abcdef1!')).toBe('Abcdef1!');
  });
});

describe('ChangePasswordSchema', () => {
  it('validates current password is required', () => {
    expect(() => ChangePasswordSchema.parse({ newPassword: 'Abcdef1' })).toThrow();
  });

  it('validates new password follows rules', () => {
    expect(() =>
      ChangePasswordSchema.parse({
        currentPassword: 'old',
        newPassword: 'weak',
      })
    ).toThrow();
  });

  it('validates new password is different from current', () => {
    expect(() =>
      ChangePasswordSchema.parse({
        currentPassword: 'Abcdef1',
        newPassword: 'Abcdef1',
      })
    ).toThrow();
  });

  it('accepts valid change password', () => {
    const result = ChangePasswordSchema.parse({
      currentPassword: 'old',
      newPassword: 'Newpass1',
    });
    expect(result.currentPassword).toBe('old');
    expect(result.newPassword).toBe('Newpass1');
  });
});

describe('LoginAuthSchema', () => {
  it('accepts valid login', () => {
    const result = LoginAuthSchema.parse({ username: 'admin', password: '1234' });
    expect(result.username).toBe('admin');
  });

  it('rejects empty username', () => {
    expect(() => LoginAuthSchema.parse({ username: '', password: '1234' })).toThrow();
  });

  it('rejects empty password', () => {
    expect(() => LoginAuthSchema.parse({ username: 'admin', password: '' })).toThrow();
  });
});

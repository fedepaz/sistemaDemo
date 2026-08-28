// packages/shared/src/schemas/__tests__/tenant.schema.spec.ts
import { TenantSchema } from '../tenant.schema';

describe('TenantSchema', () => {
  const validTenant = {
    id: 'clx1234567890abcdef123456',
    name: 'Default Tenant',
    users: ['user-1', 'user-2'],
    auditLogs: ['log-1'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('accepts valid tenant', () => {
    const result = TenantSchema.parse(validTenant);
    expect(result.name).toBe('Default Tenant');
    expect(result.users).toHaveLength(2);
  });

  it('accepts tenant with empty users', () => {
    const result = TenantSchema.parse({ ...validTenant, users: [] });
    expect(result.users).toHaveLength(0);
  });

  it('accepts tenant with empty auditLogs', () => {
    const result = TenantSchema.parse({ ...validTenant, auditLogs: [] });
    expect(result.auditLogs).toHaveLength(0);
  });

  it('rejects missing name', () => {
    const { name, ...withoutName } = validTenant;
    expect(() => TenantSchema.parse(withoutName)).toThrow();
  });

  it('rejects missing users array', () => {
    const { users, ...withoutUsers } = validTenant;
    expect(() => TenantSchema.parse(withoutUsers)).toThrow();
  });

  it('rejects non-array users', () => {
    expect(() =>
      TenantSchema.parse({ ...validTenant, users: 'not-an-array' })
    ).toThrow();
  });
});

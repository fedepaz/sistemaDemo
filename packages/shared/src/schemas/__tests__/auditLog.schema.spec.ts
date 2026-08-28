// packages/shared/src/schemas/__tests__/auditLog.schema.spec.ts
import { AuditLogSchema } from '../auditLog.schema';

describe('AuditLogSchema', () => {
  const validAuditLog = {
    id: 'clx1234567890abcdef123456',
    tenantId: 'clx1234567890abcdef123467',
    tenant: {},
    userId: 'clx1234567890abcdef123478',
    user: {
      id: 'clx1234567890abcdef123478',
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      tenantName: 'Default Tenant',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    action: 'CREATE',
    entityId: 'clx1234567890abcdef123489',
    entityType: 'USER_PROFILE',
    changes: { field: 'oldValue', newValue: 'test' },
    timestamp: new Date(),
  };

  it('accepts valid audit log', () => {
    const result = AuditLogSchema.parse(validAuditLog);
    expect(result.id).toBe('clx1234567890abcdef123456');
    expect(result.action).toBe('CREATE');
    expect(result.entityType).toBe('USER_PROFILE');
  });

  it('accepts audit log with optional ipAddress', () => {
    const result = AuditLogSchema.parse({
      ...validAuditLog,
      ipAddress: '192.168.1.1',
    });
    expect(result.ipAddress).toBe('192.168.1.1');
  });

  it('accepts audit log with optional userAgent', () => {
    const result = AuditLogSchema.parse({
      ...validAuditLog,
      userAgent: 'Mozilla/5.0',
    });
    expect(result.userAgent).toBe('Mozilla/5.0');
  });

  it('accepts audit log without optional fields', () => {
    const result = AuditLogSchema.parse(validAuditLog);
    expect(result.ipAddress).toBeUndefined();
    expect(result.userAgent).toBeUndefined();
  });

  it('rejects invalid action type', () => {
    expect(() =>
      AuditLogSchema.parse({ ...validAuditLog, action: 'INVALID' })
    ).toThrow();
  });

  it('rejects invalid entity type', () => {
    expect(() =>
      AuditLogSchema.parse({ ...validAuditLog, entityType: 'INVALID' })
    ).toThrow();
  });

  it('rejects missing required fields', () => {
    expect(() =>
      AuditLogSchema.parse({ id: 'clx1234567890abcdef123456', tenantId: 'clx1234567890abcdef123467' })
    ).toThrow();
  });
});

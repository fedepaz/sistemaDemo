// packages/shared/src/schemas/__tests__/permissions.schema.spec.ts
import {
  PermissionScopeSchema,
  PermissionTypeSchema,
  CrudActionSchema,
  TablePermissionSchema,
  UserPermissionsSchema,
  PermissionCheckSchema,
  EntitySchema,
  UserEntityPermissionSchema,
  CreateEntitySchema,
} from '../permissions.schema';

describe('PermissionScopeSchema', () => {
  it('accepts valid scopes', () => {
    expect(PermissionScopeSchema.parse('NONE')).toBe('NONE');
    expect(PermissionScopeSchema.parse('OWN')).toBe('OWN');
    expect(PermissionScopeSchema.parse('ALL')).toBe('ALL');
  });

  it('rejects invalid scope', () => {
    expect(() => PermissionScopeSchema.parse('WRONG')).toThrow();
  });
});

describe('PermissionTypeSchema', () => {
  it('accepts valid types', () => {
    expect(PermissionTypeSchema.parse('CRUD')).toBe('CRUD');
    expect(PermissionTypeSchema.parse('PROCESS')).toBe('PROCESS');
    expect(PermissionTypeSchema.parse('READ_ONLY')).toBe('READ_ONLY');
  });

  it('rejects invalid type', () => {
    expect(() => PermissionTypeSchema.parse('ADMIN')).toThrow();
  });
});

describe('CrudActionSchema', () => {
  it('accepts all CRUD actions', () => {
    expect(CrudActionSchema.parse('create')).toBe('create');
    expect(CrudActionSchema.parse('read')).toBe('read');
    expect(CrudActionSchema.parse('update')).toBe('update');
    expect(CrudActionSchema.parse('delete')).toBe('delete');
  });

  it('rejects invalid action', () => {
    expect(() => CrudActionSchema.parse('list')).toThrow();
  });
});

describe('TablePermissionSchema', () => {
  const validPermission = {
    canCreate: true,
    canRead: true,
    canUpdate: false,
    canDelete: false,
    scope: 'OWN',
    permissionType: 'CRUD',
  };

  it('accepts valid table permission', () => {
    const result = TablePermissionSchema.parse(validPermission);
    expect(result.canCreate).toBe(true);
    expect(result.scope).toBe('OWN');
  });

  it('applies default scope ALL when not provided', () => {
    const { scope, ...withoutScope } = validPermission;
    const result = TablePermissionSchema.parse(withoutScope);
    expect(result.scope).toBe('ALL');
  });

  it('rejects missing required fields', () => {
    expect(() => TablePermissionSchema.parse({ canCreate: true })).toThrow();
  });

  it('rejects invalid permissionType', () => {
    expect(() =>
      TablePermissionSchema.parse({ ...validPermission, permissionType: 'INVALID' })
    ).toThrow();
  });
});

describe('UserPermissionsSchema', () => {
  it('accepts valid permissions map', () => {
    const result = UserPermissionsSchema.parse({
      usuarios: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'ALL', permissionType: 'CRUD' },
    });
    expect(result.usuarios.canCreate).toBe(true);
  });

  it('accepts empty permissions', () => {
    const result = UserPermissionsSchema.parse({});
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe('PermissionCheckSchema', () => {
  it('accepts valid check', () => {
    const result = PermissionCheckSchema.parse({
      tableName: 'usuarios',
      action: 'read',
    });
    expect(result.tableName).toBe('usuarios');
    expect(result.action).toBe('read');
    expect(result.scope).toBeUndefined();
  });

  it('accepts check with scope', () => {
    const result = PermissionCheckSchema.parse({
      tableName: 'usuarios',
      action: 'update',
      scope: 'OWN',
    });
    expect(result.scope).toBe('OWN');
  });

  it('rejects invalid action', () => {
    expect(() =>
      PermissionCheckSchema.parse({ tableName: 'usuarios', action: 'list' })
    ).toThrow();
  });
});

describe('EntitySchema', () => {
  it('accepts valid entity', () => {
    const result = EntitySchema.parse({
      id: '1',
      name: 'usuarios',
      label: 'Usuarios',
      permissionType: 'CRUD',
    });
    expect(result.name).toBe('usuarios');
  });

  it('accepts entity without optional isActive', () => {
    const result = EntitySchema.parse({
      id: '1',
      name: 'usuarios',
      label: 'Usuarios',
      permissionType: 'CRUD',
    });
    expect(result.isActive).toBeUndefined();
  });
});

describe('UserEntityPermissionSchema', () => {
  it('accepts valid user entity permission', () => {
    const result = UserEntityPermissionSchema.parse({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      permissions: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'ALL', permissionType: 'CRUD' },
      createdAt: new Date(),
    });
    expect(result.username).toBe('admin');
  });

  it('accepts with nullable name fields', () => {
    const result = UserEntityPermissionSchema.parse({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      username: 'admin',
      firstName: null,
      lastName: null,
      permissions: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'ALL', permissionType: 'CRUD' },
      createdAt: new Date(),
    });
    expect(result.firstName).toBeNull();
  });
});

describe('CreateEntitySchema', () => {
  it('accepts valid entity creation', () => {
    const result = CreateEntitySchema.parse({
      name: 'MiEntidad',
      label: 'Mi Entidad',
      permissionType: 'CRUD',
    });
    expect(result.name).toBe('mientidad'); // transforms to lowercase
  });

  it('applies lowercase transform', () => {
    const result = CreateEntitySchema.parse({
      name: 'USUARIOS',
      label: 'Usuarios',
      permissionType: 'READ_ONLY',
    });
    expect(result.name).toBe('usuarios');
  });

  it('rejects name with special characters', () => {
    expect(() =>
      CreateEntitySchema.parse({ name: 'mi-entidad!', label: 'Test', permissionType: 'CRUD' })
    ).toThrow();
  });

  it('rejects name longer than 50 characters', () => {
    expect(() =>
      CreateEntitySchema.parse({ name: 'a'.repeat(51), label: 'Test', permissionType: 'CRUD' })
    ).toThrow();
  });

  it('rejects empty name', () => {
    expect(() =>
      CreateEntitySchema.parse({ name: '', label: 'Test', permissionType: 'CRUD' })
    ).toThrow();
  });

  it('rejects empty label', () => {
    expect(() =>
      CreateEntitySchema.parse({ name: 'test', label: '', permissionType: 'CRUD' })
    ).toThrow();
  });
});

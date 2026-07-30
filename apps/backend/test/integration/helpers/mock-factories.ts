import { AuthUser } from '../../../src/modules/auth/types/auth-user.type';

export const MOCK_USER: AuthUser = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  username: 'testuser',
  tenantId: '12345678-1234-1234-1234-123456789012',
};

export function createAuthMock() {
  return {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    changePassword: jest.fn(),
    validateUser: jest.fn(),
  };
}

export function createUsersMock() {
  return {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    softRemoveUserByUsername: jest.fn(),
    getUserByUsername: jest.fn(),
    getUserByTenantId: jest.fn(),
    recoverUserById: jest.fn(),
  };
}

export function createEntitiesMock() {
  return {
    getAllTables: jest.fn(),
    getTableByName: jest.fn(),
    createEntity: jest.fn(),
    softRemove: jest.fn(),
  };
}

export function createSiembraMock() {
  return {
    getAllSiembra: jest.fn(),
    asignarUbicacionSiembra: jest.fn(),
  };
}

export function createPermissionsMock() {
  return {
    getAllTables: jest.fn(),
    getTableByName: jest.fn(),
    getUserPermissionsByUserId: jest.fn(),
    getUserPermissionsByEntityId: jest.fn(),
    canPerform: jest.fn(),
    canAccessRecord: jest.fn(),
    grantPermission: jest.fn(),
    revokeTablePermissions: jest.fn(),
    setPermissionsForUser: jest.fn(),
  };
}

export function createTenantsMock() {
  return {
    getAllTenants: jest.fn(),
    getTenantById: jest.fn(),
    softDeleteById: jest.fn(),
    recoverById: jest.fn(),
  };
}

export function createAlertsMock() {
  return {
    getSiembraRetrasada: jest.fn(),
    getFaltaGerminacion: jest.fn(),
    getFaltantePlantas: jest.fn(),
    getFaltaPreExpedicion: jest.fn(),
  };
}

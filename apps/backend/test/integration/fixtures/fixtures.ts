export const validLoginPayload = () => ({
  username: 'testuser',
  password: 'Pass1234',
});

export const validRegisterPayload = () => ({
  username: 'newuser',
  firstName: 'New',
  lastName: 'User',
  email: 'new@example.com',
});

export const validChangePasswordPayload = () => ({
  currentPassword: 'OldPass1',
  newPassword: 'NewPass1',
});

export const validRestorePasswordPayload = () => ({
  userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
});

export const validRefreshPayload = () => ({
  refreshToken: 'valid-refresh-token',
});

export const validEntityPayload = () => ({
  name: 'test-entity',
  description: 'Test entity',
});

export const validSiembraPayload = () => ({
  partida: 1,
  ano: 2026,
  indice: 1,
  ubicacion: 100,
  stock_ini: 50,
});

export const mockAuthResponse = () => ({
  user: {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    tenantId: '12345678-1234-1234-1234-123456789012',
  },
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  isDefaultPassword: false,
});

export const mockTokens = () => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
});

export const mockUser = () => ({
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  tenantId: '12345678-1234-1234-1234-123456789012',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

export const mockEntity = () => ({
  id: 'e1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'users',
  description: 'Users entity',
  permissionType: 'READ_ONLY',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

export const mockSiembra = () => ({
  id: 's1b2c3d4-e5f6-7890-abcd-ef1234567890',
  fecha: '2026-01-15',
  camara: 'C1',
  especie: 'Tomate',
  cantidad: 100,
  ubicacion: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

export const validTaskShiftPayload = () => ({
  entityId: 'e1b2c3d4-e5f6-7890-abcd-ef1234567890',
  startTime: '2026-08-11T08:00:00.000Z',
  endTime: '2026-08-11T17:00:00.000Z',
  employeeUserIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
});

export const mockTaskShift = () => ({
  id: 'ts1b2c3d4-e5f6-7890-abcd-ef1234567890',
  createdByUserId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  entityId: 'e1b2c3d4-e5f6-7890-abcd-ef1234567890',
  startTime: '2026-08-11T08:00:00.000Z',
  endTime: '2026-08-11T17:00:00.000Z',
  isActive: true,
  createdAt: '2026-08-10T12:00:00.000Z',
  updatedAt: '2026-08-10T12:00:00.000Z',
  employees: [{ userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }],
});

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
  userId: 'clrestore0000000000000000',
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
    id: 'clauthuser000000000000000',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    tenantId: 'clauthtenant0000000000000',
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
  id: 'clmockuser000000000000000',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  tenantId: 'clmocktenant0000000000000',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

export const mockEntity = () => ({
  id: 'clmockentity0000000000000',
  name: 'users',
  description: 'Users entity',
  permissionType: 'READ_ONLY',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

export const mockSiembra = () => ({
  id: 'clmocksiembra0000000000000',
  fecha: '2026-01-15',
  camara: 'C1',
  especie: 'Tomate',
  cantidad: 100,
  ubicacion: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

export const validTaskShiftPayload = () => ({
  entityId: 'cltaskshiftpayload0000000',
  partidaId: 1,
  anio: 2026,
  indice: 1,
  startTime: '2026-08-11T08:00:00.000Z',
  endTime: '2026-08-11T17:00:00.000Z',
  employeeUserIds: ['clemployee000000000000000'],
});

export const mockTaskShift = () => ({
  id: 'cltaskshiftmock1000000000',
  createdByUserId: 'cltaskshiftmock2000000000',
  entityId: 'cltaskshiftmock3000000000',
  startTime: '2026-08-11T08:00:00.000Z',
  endTime: '2026-08-11T17:00:00.000Z',
  isActive: true,
  createdAt: '2026-08-10T12:00:00.000Z',
  updatedAt: '2026-08-10T12:00:00.000Z',
  employees: [{ userId: 'clemployee000000000000000' }],
});

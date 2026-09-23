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

export const validProgramacionSiembraPayload = () => ({
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

export const mockProgramacionSiembra = () => ({
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

// ── AlertSolved ──────────────────────────────────────────────────────────────

export const validCreateAlertSolvedPayload = () => ({
  partidaId: 1,
  anio: 2026,
  indice: 1,
});

export const mockAlertSolvedDto = () => ({
  id: 'clalertsov0000000000000000',
  partidaId: 1,
  anio: 2026,
  indice: 1,
  userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  userName: 'testuser',
  createdAt: '2026-09-01T10:00:00.000Z',
});

// ── Billboard ────────────────────────────────────────────────────────────────

export const mockBillboardMessage = () => ({
  id: 'clbillbmsg000000000000000',
  title: 'System Update',
  body: 'Scheduled maintenance tonight',
  tag: 'maintenance',
  createdAt: '2026-09-01T10:00:00.000Z',
});

export const validMarkBillboardReadPayload = () => ({
  messageIds: ['clbillbmsg000000000000000'],
});

// ── Mezcla ───────────────────────────────────────────────────────────────────

export const validCreateMezclaPayload = () => ({
  sustrato1Id: 'c000000000000000000000001',
  porcentaje1: 60,
  sustrato2Id: 'c000000000000000000000002',
  porcentaje2: 40,
  sustrato3Id: null,
  porcentaje3: null,
  sustrato4Id: null,
  porcentaje4: null,
});

export const mockMezclaDto = () => ({
  id: 'clmezclamoc000000000000',
  sustrato1Id: 'c00000000000000000000001',
  sustrato1Nombre: 'Turf',
  porcentaje1: 60,
  sustrato2Id: 'c00000000000000000000002',
  sustrato2Nombre: 'Perlite',
  porcentaje2: 40,
  sustrato3Id: null,
  sustrato3Nombre: null,
  porcentaje3: null,
  sustrato4Id: null,
  sustrato4Nombre: null,
  porcentaje4: null,
  isActive: true,
  createdAt: new Date('2026-01-01'),
});

// ── SiembraPartidas ──────────────────────────────────────────────────────────

export const mockSiembraPartidaDto = () => ({
  id: 'clsiepmoc0000000000000000',
  partidaId: 1,
  anio: 2026,
  indice: 1,
  codigoEspecie: 'TOM',
  nombreEspecie: 'Tomate',
  metodoMaquina: true,
  prensadoSustrato: 10,
  profundidadSemilla: '2.5',
  tratamientoSemilla: 'TMT01',
  sustrato: null,
  sustratoNombre: undefined,
  mezclaId: 'c00000000000000000000002',
  userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  mezclaNombre: 'Turf (100%)',
  usuarioNombre: 'testuser',
  createdAt: new Date('2026-01-01').toISOString(),
});

// ── Sustratos ─────────────────────────────────────────────────────────────────

export const validCreateSustratoPayload = () => ({
  nombre: 'Perlita',
});

export const validUpdateSustratoPayload = () => ({
  nombre: 'Perlita Actualizada',
});

export const mockSustratoDto = () => ({
  id: 'clsusmoc0000000000000000',
  nombre: 'Perlita',
  createdAt: new Date('2026-01-01'),
});

// ── AuditLog ──────────────────────────────────────────────────────────────────

export const mockAuditLogEntry = () => ({
  id: 'claudmoc0000000000000000',
  tenantId: '12345678-1234-1234-1234-123456789012',
  userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  action: 'CREATE',
  entityType: 'USER',
  entityId: 'clmockuser000000000000000',
  changes: { endpoint: '/users', method: 'POST' },
  ipAddress: '127.0.0.1',
  userAgent: 'test-agent',
  createdAt: new Date('2026-09-01T10:00:00.000Z'),
});

export const mockAuditLogPaginatedResponse = () => ({
  data: [mockAuditLogEntry()],
  total: 1,
  page: 1,
  limit: 50,
});

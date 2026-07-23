// apps/backend/test/integration/siembra.integration.spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createSiembraMock } from './helpers/mock-factories';
import { mockSiembra, validSiembraPayload } from './fixtures/fixtures';

describe('Siembra (integration)', () => {
  let app: INestApplication;
  let siembraMock: ReturnType<typeof createSiembraMock>;

  beforeAll(async () => {
    siembraMock = createSiembraMock();
    app = await createTestApp({ siembra: siembraMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /l-siembra', () => {
    it('returns 200 + list of siembras', async () => {
      siembraMock.getAllSiembra.mockResolvedValue([mockSiembra()]);

      const response = await request(app.getHttpServer())
        .get('/l-siembra')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect((response.body as Record<string, unknown>[])[0]).toHaveProperty(
        'fecha',
      );
      expect(siembraMock.getAllSiembra).toHaveBeenCalled();
    });

    it('returns 200 + empty array when no siembras', async () => {
      siembraMock.getAllSiembra.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/l-siembra')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /l-siembra/asignar-ubicacion-siembra', () => {
    it('returns 201 on successful assignment', async () => {
      siembraMock.asignarUbicacionSiembra.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/l-siembra/asignar-ubicacion-siembra')
        .send(validSiembraPayload())
        .expect(201);

      expect(siembraMock.asignarUbicacionSiembra).toHaveBeenCalledWith(
        expect.objectContaining({ partida: 1, ano: 2026 }),
      );
    });
  });
});

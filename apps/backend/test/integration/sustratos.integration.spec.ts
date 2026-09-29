// apps/backend/test/integration/sustratos.integration.spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createSustratosMock } from './helpers/mock-factories';
import {
  validCreateSustratoPayload,
  validUpdateSustratoPayload,
  mockSustratoDto,
} from './fixtures/fixtures';

describe('Sustratos (integration)', () => {
  let app: INestApplication;
  let sustratosMock: ReturnType<typeof createSustratosMock>;

  beforeAll(async () => {
    sustratosMock = createSustratosMock();
    app = await createTestApp({ sustratos: sustratosMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /sustratos', () => {
    it('returns 200 + list of sustratos', async () => {
      sustratosMock.getAllSustratos.mockResolvedValue([mockSustratoDto()]);

      const response = await request(app.getHttpServer())
        .get('/sustratos')
        .expect(200);

      const body = response.body as Array<{ id: string; nombre: string }>;
      expect(body).toBeInstanceOf(Array);
      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('nombre');
      expect(sustratosMock.getAllSustratos).toHaveBeenCalledWith(
        expect.any(String),
      );
    });

    it('returns 200 + empty array when no sustratos exist', async () => {
      sustratosMock.getAllSustratos.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/sustratos')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('POST /sustratos', () => {
    it('returns 201 + created sustrato on valid payload', async () => {
      sustratosMock.createSustrato.mockResolvedValue(mockSustratoDto());

      const response = await request(app.getHttpServer())
        .post('/sustratos')
        .send(validCreateSustratoPayload())
        .expect(201);

      const body = response.body as { id: string; nombre: string };
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('nombre', 'Perlita');
      expect(sustratosMock.createSustrato).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Perlita' }),
      );
    });

    it('returns 400 on invalid body (missing nombre)', async () => {
      await request(app.getHttpServer())
        .post('/sustratos')
        .send({})
        .expect(400);
    });

    it('returns 400 on empty nombre', async () => {
      await request(app.getHttpServer())
        .post('/sustratos')
        .send({ nombre: '' })
        .expect(400);
    });
  });

  describe('GET /sustratos/:id', () => {
    it('returns 200 + sustrato when found', async () => {
      sustratosMock.getSustratoById.mockResolvedValue(mockSustratoDto());

      const response = await request(app.getHttpServer())
        .get('/sustratos/clsusmoc0000000000000000')
        .expect(200);

      const body = response.body as { id: string; nombre: string };
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('nombre');
      expect(sustratosMock.getSustratoById).toHaveBeenCalledWith(
        expect.any(String),
        'clsusmoc0000000000000000',
      );
    });

    it('returns 200 + empty body when sustrato not found', async () => {
      sustratosMock.getSustratoById.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/sustratos/nonexistent')
        .expect(200);

      expect(response.body).toEqual({});
    });
  });

  describe('PATCH /sustratos/:id', () => {
    it('returns 200 + updated sustrato on valid payload', async () => {
      const updated = { ...mockSustratoDto(), nombre: 'Perlita Actualizada' };
      sustratosMock.updateSustrato.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch('/sustratos/clsusmoc0000000000000000')
        .send(validUpdateSustratoPayload())
        .expect(200);

      const body = response.body as { nombre: string };
      expect(body).toHaveProperty('nombre', 'Perlita Actualizada');
      expect(sustratosMock.updateSustrato).toHaveBeenCalledWith(
        expect.any(String),
        'clsusmoc0000000000000000',
        expect.objectContaining({ nombre: 'Perlita Actualizada' }),
      );
    });

    it('returns 400 on empty nombre', async () => {
      await request(app.getHttpServer())
        .patch('/sustratos/clsusmoc0000000000000000')
        .send({ nombre: '' })
        .expect(400);
    });

    it('returns 200 on empty body (nombre is optional in update schema)', async () => {
      sustratosMock.updateSustrato.mockResolvedValue(mockSustratoDto());

      await request(app.getHttpServer())
        .patch('/sustratos/clsusmoc0000000000000000')
        .send({})
        .expect(200);

      expect(sustratosMock.updateSustrato).toHaveBeenCalledWith(
        expect.any(String),
        'clsusmoc0000000000000000',
        expect.any(Object),
      );
    });
  });
});

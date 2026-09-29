import {
  INestApplication,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createSiembraPartidasMock } from './helpers/mock-factories';
import { mockSiembraPartidaDto } from './fixtures/fixtures';

describe('SiembraPartidas (integration)', () => {
  let app: INestApplication;
  let siembraPartidasMock: ReturnType<typeof createSiembraPartidasMock>;

  beforeAll(async () => {
    siembraPartidasMock = createSiembraPartidasMock();
    app = await createTestApp({ siembraPartidas: siembraPartidasMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /siembra-partidas', () => {
    it('returns 200 + array of siembra partidas', async () => {
      siembraPartidasMock.getAllSiembraPartidas.mockResolvedValue([
        mockSiembraPartidaDto(),
      ]);

      const response = await request(app.getHttpServer())
        .get('/siembra-partidas')
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            partidaId: expect.any(Number),
            anio: expect.any(Number),
            indice: expect.any(Number),
          }),
        ]),
      );
      expect(siembraPartidasMock.getAllSiembraPartidas).toHaveBeenCalledWith(
        expect.any(String),
      );
    });

    it('returns 200 + empty array when no siembra partidas', async () => {
      siembraPartidasMock.getAllSiembraPartidas.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/siembra-partidas')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /siembra-partidas/pending', () => {
    it('returns 200 + pending siembra partidas', async () => {
      siembraPartidasMock.findPendingSiembraPartidas.mockResolvedValue([
        mockSiembraPartidaDto(),
      ]);

      const response = await request(app.getHttpServer())
        .get('/siembra-partidas/pending')
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
          }),
        ]),
      );
      expect(
        siembraPartidasMock.findPendingSiembraPartidas,
      ).toHaveBeenCalledWith(expect.any(String));
    });

    it('returns 200 + empty array when no pending partidas', async () => {
      siembraPartidasMock.findPendingSiembraPartidas.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/siembra-partidas/pending')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /siembra-partidas/:id', () => {
    it('returns 200 + siembra partida by id', async () => {
      siembraPartidasMock.getSiembraPartidaById.mockResolvedValue(
        mockSiembraPartidaDto(),
      );

      const response = await request(app.getHttpServer())
        .get('/siembra-partidas/clsiepmoc0000000000000000')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'clsiepmoc0000000000000000');
    });

    it('returns 404 when siembra partida not found', async () => {
      siembraPartidasMock.getSiembraPartidaById.mockRejectedValue(
        new NotFoundException('SiembraPartida not found'),
      );

      await request(app.getHttpServer())
        .get('/siembra-partidas/nonexistent-id')
        .expect(404);
    });
  });

  describe('PATCH /siembra-partidas/:id/desautorizar', () => {
    it('returns 200 + updated partida on valid desautorizar', async () => {
      const updated = { ...mockSiembraPartidaDto(), isActive: false };
      siembraPartidasMock.desautorizarSiembra.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch('/siembra-partidas/clsiepmoc0000000000000000/desautorizar')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(siembraPartidasMock.desautorizarSiembra).toHaveBeenCalledWith(
        'clsiepmoc0000000000000000',
        expect.any(String),
      );
    });

    it('returns 404 when siembra partida not found', async () => {
      siembraPartidasMock.desautorizarSiembra.mockRejectedValue(
        new NotFoundException('Registro de siembra no encontrado'),
      );

      await request(app.getHttpServer())
        .patch('/siembra-partidas/nonexistent-id/desautorizar')
        .expect(404);
    });

    it('returns 409 when partida is already completed', async () => {
      siembraPartidasMock.desautorizarSiembra.mockRejectedValue(
        new ConflictException(
          'No se puede desautorizar una partida ya completada',
        ),
      );

      await request(app.getHttpServer())
        .patch('/siembra-partidas/clsiepmoc0000000000000000/desautorizar')
        .expect(409);
    });

    it('returns 409 when partida is already desauthorized', async () => {
      siembraPartidasMock.desautorizarSiembra.mockRejectedValue(
        new ConflictException('Esta partida ya fue desautorizada'),
      );

      await request(app.getHttpServer())
        .patch('/siembra-partidas/clsiepmoc0000000000000000/desautorizar')
        .expect(409);
    });
  });
});

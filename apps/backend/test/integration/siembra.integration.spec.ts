// apps/backend/test/integration/siembra.integration.spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { PartidasController } from '../../src/modules/legacy/partidas/partidas.controller';
import { PartidasService } from '../../src/modules/legacy/partidas/partidas.service';
import { MockAuthGuard, MockPermissionsGuard } from './helpers/mock-guards';

function createPartidasMock() {
  return {
    getAllPartidas: jest.fn(),
    asignarExtendido: jest.fn(),
    asignarSiembra: jest.fn(),
  };
}

describe('Siembra (integration)', () => {
  let app: INestApplication;
  let partidasMock: ReturnType<typeof createPartidasMock>;

  beforeAll(async () => {
    partidasMock = createPartidasMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartidasController],
      providers: [
        { provide: APP_GUARD, useClass: MockAuthGuard },
        { provide: APP_GUARD, useClass: MockPermissionsGuard },
        { provide: PartidasService, useValue: partidasMock },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /l-partidas/asignar-siembra', () => {
    it('returns 201 on successful assignment', async () => {
      partidasMock.asignarSiembra.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/l-partidas/asignar-siembra')
        .send({
          partidaId: 1,
          anio: 2026,
          indice: 1,
          cg: 1,
          cantidaNroCont: 50,
          f_siembra: new Date('2026-01-15'),
          metodoMaquina: true,
          presionSemilla: 1,
          profundidadSemilla: '1.5',
          tratamientoSemilla: '',
          mezclaId: 'clmocksiembra0000000000000',
          entityId: 'cltaskshiftpayload0000000',
          startTime: '2026-01-15T08:00:00.000Z',
          endTime: '2026-01-15T17:00:00.000Z',
        })
        .expect(201);

      expect(partidasMock.asignarSiembra).toHaveBeenCalledWith(
        expect.objectContaining({ partidaId: 1, anio: 2026 }),
        expect.any(String),
      );
    });
  });
});

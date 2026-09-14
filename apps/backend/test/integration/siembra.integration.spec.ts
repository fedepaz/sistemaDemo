// apps/backend/test/integration/siembra.integration.spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { PartidasController } from '../../src/modules/legacy/partidas/partidas.controller';
import { PartidasService } from '../../src/modules/legacy/partidas/partidas.service';
import { SiembraPartidasService } from '../../src/modules/siembraPartidas/siembraPartidas.service';
import { MockAuthGuard, MockPermissionsGuard } from './helpers/mock-guards';

function createPartidasMock() {
  return {
    getAllPartidas: jest.fn(),
    asignarExtendido: jest.fn(),
    completarSiembraLegacy: jest.fn(),
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
        {
          provide: SiembraPartidasService,
          useValue: {
            completarSiembraPartida: jest.fn().mockResolvedValue(undefined),
          },
        },
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

  describe('PATCH /l-partidas/asignar-siembra/:id', () => {
    it('returns 201 on successful assignment', async () => {
      partidasMock.completarSiembraLegacy.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .patch('/l-partidas/asignar-siembra/sp-1')
        .send({
          partidaId: 1,
          anio: 2026,
          indice: 1,
          cg: 1,
          cantidaNroCont: 50,
          f_siembra: new Date('2026-01-15'),
          metodoMaquina: true,
          prensadoSemilla: 1,
          profundidadSemilla: '1.5',
          tratamientoSemilla: '1',
          mezclaId: 'clmocksiembra0000000000000',
          lote: 272,
          anoLote: 2026,
          item: 1,
          semxgr: 421,
          entityId: 'cltaskshiftpayload0000000',
          startTime: '2026-01-15T08:00:00.000Z',
          endTime: '2026-01-15T17:00:00.000Z',
          employeeUserIds: [],
        })
        .expect(200);

      expect(partidasMock.completarSiembraLegacy).toHaveBeenCalledWith(
        expect.objectContaining({ partidaId: 1, anio: 2026 }),
        expect.any(String),
      );
    });
  });
});

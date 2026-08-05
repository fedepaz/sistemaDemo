import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createAlertsMock } from './helpers/mock-factories';
import {
  SiembraRetrasadaDtoSchema,
  FaltaGerminacionDtoSchema,
  FaltantePlantasDtoSchema,
  FaltaPreExpedicionDtoSchema,
} from '@vivero/shared';

describe('Alerts Integration', () => {
  let app: INestApplication;
  let alertsMock: ReturnType<typeof createAlertsMock>;

  const mockSiembraRetrasada = [
    {
      partidaId: 1045,
      anio: 2026,
      indice: 1,
      codigoEspecie: 'EUC01',
      nombreEspecie: 'Eucalipto Grandis',
      injerto: 'I001',
      nrocont: '48',
      semSiembra: '24-2026',
      fechaSugeridaSiembra: '2026-06-01',
      fSiembra: 0,
      semEntrega: '28-2026 1',
      fEnt: '2026-07-15',
      estado: 'PENDIENTE',
      propiedad: 'PRIVADA',
    },
  ];

  const mockFaltaGerminacion = [
    {
      partidaId: 1050,
      anio: 2026,
      indice: 1,
      codigoEspecie: 'ROS01',
      nombreEspecie: 'Rosa Hybrid Tea',
      injerto: 'I002',
      nrocont: '104',
      fPrimer: '2026-07-01',
      pr: '0',
    },
  ];

  const mockFaltantePlantas = [
    {
      partidaId: 1048,
      anio: 2026,
      indice: 1,
      siembras: 3,
      codigoEspecie: 'EUC01',
      nombreEspecie: 'Eucalipto Grandis',
      nrocont: '500',
      solicito: 500,
      producido: 342,
      diferencia: -158,
      commentCount: 0,
    },
  ];

  const mockFaltaPreExpedicion = [
    {
      partidaId: 1052,
      anio: 2026,
      indice: 1,
      codigoEspecie: 'LIM02',
      nombreEspecie: 'Limonero Volkameriano',
      injerto: 'I003',
      nrocont: '96',
      fPreexp: '2026-07-20',
      pe: 0,
    },
  ];

  beforeAll(async () => {
    alertsMock = createAlertsMock();
    alertsMock.getSiembraRetrasada.mockResolvedValue(mockSiembraRetrasada);
    alertsMock.getFaltaGerminacion.mockResolvedValue(mockFaltaGerminacion);
    alertsMock.getFaltantePlantas.mockResolvedValue(mockFaltantePlantas);
    alertsMock.getFaltaPreExpedicion.mockResolvedValue(mockFaltaPreExpedicion);

    app = await createTestApp({ alerts: alertsMock });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /l-alerts/siembra-retrasada', () => {
    it('returns data matching SiembraRetrasadaDtoSchema', async () => {
      const res = await request(app.getHttpServer())
        .get('/l-alerts/siembra-retrasada')
        .expect(200);

      const body = res.body as unknown[];
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);

      const parsed = SiembraRetrasadaDtoSchema.safeParse(body[0]);
      expect(parsed.success).toBe(true);
    });
  });

  describe('GET /l-alerts/falta-germinacion', () => {
    it('returns data matching FaltaGerminacionDtoSchema', async () => {
      const res = await request(app.getHttpServer())
        .get('/l-alerts/falta-germinacion')
        .expect(200);

      const body = res.body as unknown[];
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);

      const parsed = FaltaGerminacionDtoSchema.safeParse(body[0]);
      expect(parsed.success).toBe(true);
    });
  });

  describe('GET /l-alerts/faltante-plantas', () => {
    it('returns data matching FaltantePlantasDtoSchema', async () => {
      const res = await request(app.getHttpServer())
        .get('/l-alerts/faltante-plantas')
        .expect(200);

      const body = res.body as unknown[];
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);

      const parsed = FaltantePlantasDtoSchema.safeParse(body[0]);
      expect(parsed.success).toBe(true);
    });
  });

  describe('GET /l-alerts/falta-pre-expedicion', () => {
    it('returns data matching FaltaPreExpedicionDtoSchema', async () => {
      const res = await request(app.getHttpServer())
        .get('/l-alerts/falta-pre-expedicion')
        .expect(200);

      const body = res.body as unknown[];
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);

      const parsed = FaltaPreExpedicionDtoSchema.safeParse(body[0]);
      expect(parsed.success).toBe(true);
    });
  });
});

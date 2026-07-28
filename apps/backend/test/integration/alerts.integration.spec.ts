import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import {
  SiembraRetrasadaDtoSchema,
  FaltaGerminacionDtoSchema,
  FaltantePlantasDtoSchema,
  FaltaPreExpedicionDtoSchema,
} from '@vivero/shared';

describe('Alerts Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  }, 30000);

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

      if (body.length > 0) {
        const parsed = SiembraRetrasadaDtoSchema.safeParse(body[0]);
        expect(parsed.success).toBe(true);
      }
    });
  });

  describe('GET /l-alerts/falta-germinacion', () => {
    it('returns data matching FaltaGerminacionDtoSchema', async () => {
      const res = await request(app.getHttpServer())
        .get('/l-alerts/falta-germinacion')
        .expect(200);

      const body = res.body as unknown[];
      expect(Array.isArray(body)).toBe(true);

      if (body.length > 0) {
        const parsed = FaltaGerminacionDtoSchema.safeParse(body[0]);
        expect(parsed.success).toBe(true);
      }
    });
  });

  describe('GET /l-alerts/faltante-plantas', () => {
    it('returns data matching FaltantePlantasDtoSchema', async () => {
      const res = await request(app.getHttpServer())
        .get('/l-alerts/faltante-plantas')
        .expect(200);

      const body = res.body as unknown[];
      expect(Array.isArray(body)).toBe(true);

      if (body.length > 0) {
        const parsed = FaltantePlantasDtoSchema.safeParse(body[0]);
        expect(parsed.success).toBe(true);
      }
    });
  });

  describe('GET /l-alerts/falta-pre-expedicion', () => {
    it('returns data matching FaltaPreExpedicionDtoSchema', async () => {
      const res = await request(app.getHttpServer())
        .get('/l-alerts/falta-pre-expedicion')
        .expect(200);

      const body = res.body as unknown[];
      expect(Array.isArray(body)).toBe(true);

      if (body.length > 0) {
        const parsed = FaltaPreExpedicionDtoSchema.safeParse(body[0]);
        expect(parsed.success).toBe(true);
      }
    });
  });
});

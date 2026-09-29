import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createAlertSolvedMock } from './helpers/mock-factories';
import {
  validCreateAlertSolvedPayload,
  mockAlertSolvedDto,
} from './fixtures/fixtures';

describe('AlertSolved (integration)', () => {
  let app: INestApplication;
  let alertSolvedMock: ReturnType<typeof createAlertSolvedMock>;

  beforeAll(async () => {
    alertSolvedMock = createAlertSolvedMock();
    app = await createTestApp({ alertSolved: alertSolvedMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /alert-solved', () => {
    it('returns 200 + array of solved alerts', async () => {
      alertSolvedMock.getSolvedAlerts.mockResolvedValue([mockAlertSolvedDto()]);

      const response = await request(app.getHttpServer())
        .get('/alert-solved')
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
      expect(alertSolvedMock.getSolvedAlerts).toHaveBeenCalledWith(
        expect.any(String),
      );
    });

    it('returns 200 + empty array when no solved alerts', async () => {
      alertSolvedMock.getSolvedAlerts.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/alert-solved')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('POST /alert-solved', () => {
    it('returns 201 on valid payload', async () => {
      alertSolvedMock.createSolvedAlert.mockResolvedValue({ id: 'created-id' });

      await request(app.getHttpServer())
        .post('/alert-solved')
        .send(validCreateAlertSolvedPayload())
        .expect(201);

      expect(alertSolvedMock.createSolvedAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          partidaId: 1,
          anio: 2026,
          indice: 1,
        }),
        expect.any(String),
      );
    });

    it('returns 400 on missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/alert-solved')
        .send({})
        .expect(400);
    });

    it('returns 400 on missing partidaId', async () => {
      await request(app.getHttpServer())
        .post('/alert-solved')
        .send({ anio: 2026, indice: 1 })
        .expect(400);
    });

    it('returns 400 on missing anio', async () => {
      await request(app.getHttpServer())
        .post('/alert-solved')
        .send({ partidaId: 1, indice: 1 })
        .expect(400);
    });
  });
});

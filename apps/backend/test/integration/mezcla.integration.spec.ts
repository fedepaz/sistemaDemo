import { INestApplication, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createMezclaMock } from './helpers/mock-factories';
import { validCreateMezclaPayload, mockMezclaDto } from './fixtures/fixtures';

describe('Mezcla (integration)', () => {
  let app: INestApplication;
  let mezclaMock: ReturnType<typeof createMezclaMock>;

  beforeAll(async () => {
    mezclaMock = createMezclaMock();
    app = await createTestApp({ mezcla: mezclaMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /mezcla', () => {
    it('returns 200 + array of mezclas', async () => {
      mezclaMock.getAllMezcla.mockResolvedValue([mockMezclaDto()]);

      const response = await request(app.getHttpServer())
        .get('/mezcla')
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            sustrato1Id: expect.any(String),
            porcentaje1: expect.any(Number),
            isActive: expect.any(Boolean),
          }),
        ]),
      );
      expect(mezclaMock.getAllMezcla).toHaveBeenCalledWith(expect.any(String));
    });

    it('returns 200 + empty array when no mezclas', async () => {
      mezclaMock.getAllMezcla.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/mezcla')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /mezcla/:id', () => {
    it('returns 200 + mezcla by id', async () => {
      mezclaMock.getMezclaById.mockResolvedValue(mockMezclaDto());

      const response = await request(app.getHttpServer())
        .get('/mezcla/clmezclamoc000000000000')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'clmezclamoc000000000000');
    });

    it('returns 404 when mezcla not found', async () => {
      mezclaMock.getMezclaById.mockRejectedValue(
        new NotFoundException('Mezcla not found'),
      );

      await request(app.getHttpServer())
        .get('/mezcla/nonexistent-id')
        .expect(404);
    });
  });

  describe('POST /mezcla', () => {
    it('returns 201 on valid payload', async () => {
      mezclaMock.createMezcla.mockResolvedValue(mockMezclaDto());

      const response = await request(app.getHttpServer())
        .post('/mezcla')
        .send(validCreateMezclaPayload())
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(mezclaMock.createMezcla).toHaveBeenCalledWith(
        expect.objectContaining({
          sustrato1Id: 'c000000000000000000000001',
          porcentaje1: 60,
          sustrato2Id: 'c000000000000000000000002',
          porcentaje2: 40,
        }),
      );
    });

    it('returns 400 on missing required fields', async () => {
      await request(app.getHttpServer()).post('/mezcla').send({}).expect(400);
    });

    it('returns 400 on missing sustrato1Id', async () => {
      await request(app.getHttpServer())
        .post('/mezcla')
        .send({
          porcentaje1: 100,
          sustrato2Id: null,
          porcentaje2: null,
          sustrato3Id: null,
          porcentaje3: null,
          sustrato4Id: null,
          porcentaje4: null,
        })
        .expect(400);
    });

    it('returns 400 on percentages not summing to 100', async () => {
      await request(app.getHttpServer())
        .post('/mezcla')
        .send({
          sustrato1Id: 'c000000000000000000000001',
          porcentaje1: 50,
          sustrato2Id: 'c000000000000000000000002',
          porcentaje2: 30,
          sustrato3Id: null,
          porcentaje3: null,
          sustrato4Id: null,
          porcentaje4: null,
        })
        .expect(400);
    });
  });
});

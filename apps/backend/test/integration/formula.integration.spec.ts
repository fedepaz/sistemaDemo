import { INestApplication, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createFormulaMock } from './helpers/mock-factories';
import { validCreateFormulaPayload, mockFormulaDto } from './fixtures/fixtures';

describe('Formula (integration)', () => {
  let app: INestApplication;
  let formulaMock: ReturnType<typeof createFormulaMock>;

  beforeAll(async () => {
    formulaMock = createFormulaMock();
    app = await createTestApp({ formula: formulaMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /formula', () => {
    it('returns 200 + array of fórmulas', async () => {
      formulaMock.getAllFormula.mockResolvedValue([mockFormulaDto()]);

      const response = await request(app.getHttpServer())
        .get('/formula')
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            producto1Id: expect.any(String),
            porcentaje1: expect.any(Number),
            isActive: expect.any(Boolean),
          }),
        ]),
      );
      expect(formulaMock.getAllFormula).toHaveBeenCalledWith(
        expect.any(String),
      );
    });

    it('returns 200 + empty array when no fórmulas', async () => {
      formulaMock.getAllFormula.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/formula')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /formula/:id', () => {
    it('returns 200 + fórmula by id', async () => {
      formulaMock.getFormulaById.mockResolvedValue(mockFormulaDto());

      const response = await request(app.getHttpServer())
        .get('/formula/clformulamoc000000000000')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'clformulamoc000000000000');
    });

    it('returns 404 when fórmula not found', async () => {
      formulaMock.getFormulaById.mockRejectedValue(
        new NotFoundException('Formula not found'),
      );

      await request(app.getHttpServer())
        .get('/formula/nonexistent-id')
        .expect(404);
    });
  });

  describe('POST /formula', () => {
    it('returns 201 on valid payload', async () => {
      formulaMock.createFormula.mockResolvedValue(mockFormulaDto());

      const response = await request(app.getHttpServer())
        .post('/formula')
        .send(validCreateFormulaPayload())
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(formulaMock.createFormula).toHaveBeenCalledWith(
        expect.objectContaining({
          producto1Id: 'c000000000000000000000001',
          porcentaje1: 60,
          producto2Id: 'c000000000000000000000002',
          porcentaje2: 40,
        }),
      );
    });

    it('returns 400 on missing required fields', async () => {
      await request(app.getHttpServer()).post('/formula').send({}).expect(400);
    });

    it('returns 400 on missing producto1Id', async () => {
      await request(app.getHttpServer())
        .post('/formula')
        .send({
          porcentaje1: 100,
          producto2Id: null,
          porcentaje2: null,
          producto3Id: null,
          porcentaje3: null,
          producto4Id: null,
          porcentaje4: null,
        })
        .expect(400);
    });

    it('returns 400 on percentages not summing to 100', async () => {
      await request(app.getHttpServer())
        .post('/formula')
        .send({
          producto1Id: 'c000000000000000000000001',
          porcentaje1: 50,
          producto2Id: 'c000000000000000000000002',
          porcentaje2: 30,
          producto3Id: null,
          porcentaje3: null,
          producto4Id: null,
          porcentaje4: null,
        })
        .expect(400);
    });
  });

  describe('DELETE /formula/:id', () => {
    it('returns 200 + soft-deleted fórmula', async () => {
      formulaMock.deleteFormula.mockResolvedValue(mockFormulaDto());

      await request(app.getHttpServer())
        .delete('/formula/clformulamoc000000000000')
        .expect(200);

      expect(formulaMock.deleteFormula).toHaveBeenCalledWith(
        'clformulamoc000000000000',
        expect.any(String),
      );
    });

    it('returns 404 when fórmula is not found', async () => {
      formulaMock.deleteFormula.mockRejectedValue(
        new NotFoundException('Formula not found'),
      );

      await request(app.getHttpServer())
        .delete('/formula/missing-formula')
        .expect(404);
    });
  });
});

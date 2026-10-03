// apps/backend/test/integration/productos.integration.spec.ts
import { INestApplication, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createProductosMock } from './helpers/mock-factories';
import {
  validCreateProductoPayload,
  validUpdateProductoPayload,
  mockProductoDto,
} from './fixtures/fixtures';

describe('Productos (integration)', () => {
  let app: INestApplication;
  let productosMock: ReturnType<typeof createProductosMock>;

  beforeAll(async () => {
    productosMock = createProductosMock();
    app = await createTestApp({ productos: productosMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /productos', () => {
    it('returns 200 + list of productos', async () => {
      productosMock.getAllProductos.mockResolvedValue([mockProductoDto()]);

      const response = await request(app.getHttpServer())
        .get('/productos')
        .expect(200);

      const body = response.body as Array<{ id: string; nombre: string }>;
      expect(body).toBeInstanceOf(Array);
      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('nombre');
      expect(body[0]).toHaveProperty('isActive', true);
      expect(productosMock.getAllProductos).toHaveBeenCalledWith(
        expect.any(String),
      );
    });

    it('returns 200 + empty array when no productos exist', async () => {
      productosMock.getAllProductos.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/productos')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('POST /productos', () => {
    it('returns 201 + created producto on valid payload', async () => {
      productosMock.createProducto.mockResolvedValue(mockProductoDto());

      const response = await request(app.getHttpServer())
        .post('/productos')
        .send(validCreateProductoPayload())
        .expect(201);

      const body = response.body as {
        id: string;
        nombre: string;
        isActive: boolean;
      };
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('nombre', 'Perlita');
      expect(body).toHaveProperty('isActive', true);
      expect(productosMock.createProducto).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Perlita' }),
      );
    });

    it('returns 400 on invalid body (missing nombre)', async () => {
      await request(app.getHttpServer())
        .post('/productos')
        .send({})
        .expect(400);
    });

    it('returns 400 on empty nombre', async () => {
      await request(app.getHttpServer())
        .post('/productos')
        .send({ nombre: '' })
        .expect(400);
    });
  });

  describe('GET /productos/:id', () => {
    it('returns 200 + producto when found', async () => {
      productosMock.getProductoById.mockResolvedValue(mockProductoDto());

      const response = await request(app.getHttpServer())
        .get('/productos/clsusmoc0000000000000000')
        .expect(200);

      const body = response.body as { id: string; nombre: string };
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('nombre');
      expect(body).toHaveProperty('isActive', true);
      expect(productosMock.getProductoById).toHaveBeenCalledWith(
        expect.any(String),
        'clsusmoc0000000000000000',
      );
    });

    it('returns 200 + empty body when producto not found', async () => {
      productosMock.getProductoById.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/productos/nonexistent')
        .expect(200);

      expect(response.body).toEqual({});
    });
  });

  describe('PATCH /productos/:id', () => {
    it('returns 200 + updated producto on valid payload', async () => {
      const updated = { ...mockProductoDto(), nombre: 'Perlita Actualizada' };
      productosMock.updateProducto.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch('/productos/clsusmoc0000000000000000')
        .send(validUpdateProductoPayload())
        .expect(200);

      const body = response.body as { nombre: string; isActive: boolean };
      expect(body).toHaveProperty('nombre', 'Perlita Actualizada');
      expect(body).toHaveProperty('isActive', true);
      expect(productosMock.updateProducto).toHaveBeenCalledWith(
        expect.any(String),
        'clsusmoc0000000000000000',
        expect.objectContaining({ nombre: 'Perlita Actualizada' }),
      );
    });

    it('returns 400 on empty nombre', async () => {
      await request(app.getHttpServer())
        .patch('/productos/clsusmoc0000000000000000')
        .send({ nombre: '' })
        .expect(400);
    });

    it('returns 200 on empty body (nombre is optional in update schema)', async () => {
      productosMock.updateProducto.mockResolvedValue(mockProductoDto());

      await request(app.getHttpServer())
        .patch('/productos/clsusmoc0000000000000000')
        .send({})
        .expect(200);

      expect(productosMock.updateProducto).toHaveBeenCalledWith(
        expect.any(String),
        'clsusmoc0000000000000000',
        expect.any(Object),
      );
    });
  });

  describe('DELETE /productos/:id', () => {
    it('returns 200 + soft-deleted producto', async () => {
      productosMock.deleteProducto.mockResolvedValue(mockProductoDto());

      await request(app.getHttpServer())
        .delete('/productos/clsusmoc0000000000000000')
        .expect(200);

      expect(productosMock.deleteProducto).toHaveBeenCalledWith(
        expect.any(String),
        'clsusmoc0000000000000000',
      );
    });

    it('returns 404 when producto is not found', async () => {
      productosMock.deleteProducto.mockRejectedValue(
        new NotFoundException('Producto not found'),
      );

      await request(app.getHttpServer())
        .delete('/productos/missing-producto')
        .expect(404);
    });
  });
});

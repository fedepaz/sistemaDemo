// apps/backend/test/integration/entities.integration.spec.ts
import {
  ForbiddenException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createEntitiesMock } from './helpers/mock-factories';
import { mockEntity, validUpdateEntityPayload } from './fixtures/fixtures';

describe('Entities (integration)', () => {
  let app: INestApplication;
  let entitiesMock: ReturnType<typeof createEntitiesMock>;

  beforeAll(async () => {
    entitiesMock = createEntitiesMock();
    app = await createTestApp({ entities: entitiesMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /entities/tables', () => {
    it('returns 200 + list of entity tables', async () => {
      entitiesMock.getAllTables.mockResolvedValue([mockEntity()]);

      const response = await request(app.getHttpServer())
        .get('/entities/tables')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect((response.body as Record<string, unknown>[])[0]).toHaveProperty(
        'name',
      );
      expect(entitiesMock.getAllTables).toHaveBeenCalled();
    });
  });

  describe('POST /entities/entity', () => {
    it('returns 201 + created entity', async () => {
      entitiesMock.createEntity.mockResolvedValue(mockEntity());

      const response = await request(app.getHttpServer())
        .post('/entities/entity')
        .send({
          name: 'new_entity',
          label: 'New Entity',
          permissionType: 'READ_ONLY',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(entitiesMock.createEntity).toHaveBeenCalled();
    });

    it('returns 400 on invalid payload', async () => {
      await request(app.getHttpServer())
        .post('/entities/entity')
        .send({})
        .expect(400);
    });
  });

  describe('GET /entities/table/:tableName', () => {
    it('returns 200 + entity by table name', async () => {
      entitiesMock.getTableByName.mockResolvedValue(mockEntity());

      const response = await request(app.getHttpServer())
        .get('/entities/table/users')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'users');
      expect(entitiesMock.getTableByName).toHaveBeenCalledWith('users');
    });

    it('returns 404 when entity not found', async () => {
      entitiesMock.getTableByName.mockRejectedValue(
        new NotFoundException('Entidad no encontrada'),
      );

      await request(app.getHttpServer())
        .get('/entities/table/nonexistent')
        .expect(404);
    });
  });

  describe('GET /entities/:id', () => {
    it('returns 200 + entity by id', async () => {
      entitiesMock.getTableById.mockResolvedValue(mockEntity());

      const response = await request(app.getHttpServer())
        .get('/entities/clmockentity0000000000000')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'users');
      expect(entitiesMock.getTableById).toHaveBeenCalledWith(
        expect.any(String),
        'clmockentity0000000000000',
      );
    });

    it('returns 404 when entity not found', async () => {
      entitiesMock.getTableById.mockRejectedValue(
        new NotFoundException('Entity missing not found'),
      );

      await request(app.getHttpServer()).get('/entities/missing').expect(404);
    });
  });

  describe('PATCH /entities/:id', () => {
    it('returns 200 + updated entity on valid payload', async () => {
      const updated = {
        ...mockEntity(),
        label: 'Usuarios Actualizado',
        permissionType: 'CRUD',
        isActive: true,
      };
      entitiesMock.updateEntity.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch('/entities/clmockentity0000000000000')
        .send(validUpdateEntityPayload())
        .expect(200);

      expect(response.body).toHaveProperty('label', 'Usuarios Actualizado');
      expect(entitiesMock.updateEntity).toHaveBeenCalledWith(
        'clmockentity0000000000000',
        expect.objectContaining({ label: 'Usuarios Actualizado' }),
        expect.any(String),
      );
    });

    it('returns 400 on invalid payload (empty label)', async () => {
      await request(app.getHttpServer())
        .patch('/entities/clmockentity0000000000000')
        .send({ label: '' })
        .expect(400);
    });

    it('returns 200 on empty body (fields are optional in update schema)', async () => {
      entitiesMock.updateEntity.mockResolvedValue(mockEntity());

      await request(app.getHttpServer())
        .patch('/entities/clmockentity0000000000000')
        .send({})
        .expect(200);
    });

    it('returns 404 when entity not found', async () => {
      entitiesMock.updateEntity.mockRejectedValue(
        new NotFoundException('Entity missing not found'),
      );

      await request(app.getHttpServer())
        .patch('/entities/missing')
        .send(validUpdateEntityPayload())
        .expect(404);
    });
  });

  describe('DELETE /entities/:id', () => {
    it('returns 200 on successful soft delete', async () => {
      entitiesMock.softRemove.mockResolvedValue({ success: true });

      await request(app.getHttpServer())
        .delete('/entities/e1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .expect(200);

      expect(entitiesMock.softRemove).toHaveBeenCalled();
    });

    it('returns 403 when deleting a system entity', async () => {
      entitiesMock.softRemove.mockRejectedValue(
        new ForbiddenException('Cannot delete system entity audit_logs'),
      );

      await request(app.getHttpServer())
        .delete('/entities/audit_logs')
        .expect(403);
    });
  });
});

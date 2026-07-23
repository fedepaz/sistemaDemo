// apps/backend/test/integration/entities.integration.spec.ts
import { INestApplication, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createEntitiesMock } from './helpers/mock-factories';
import { mockEntity } from './fixtures/fixtures';

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

  describe('DELETE /entities/:id', () => {
    it('returns 200 on successful soft delete', async () => {
      entitiesMock.softRemove.mockResolvedValue({ success: true });

      await request(app.getHttpServer())
        .delete('/entities/e1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .expect(200);

      expect(entitiesMock.softRemove).toHaveBeenCalled();
    });
  });
});

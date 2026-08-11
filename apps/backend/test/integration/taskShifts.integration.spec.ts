// apps/backend/test/integration/taskShifts.integration.spec.ts
import { INestApplication, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createTaskShiftsMock } from './helpers/mock-factories';
import { mockTaskShift, validTaskShiftPayload } from './fixtures/fixtures';

describe('TaskShifts (integration)', () => {
  let app: INestApplication;
  let taskShiftsMock: ReturnType<typeof createTaskShiftsMock>;

  beforeAll(async () => {
    taskShiftsMock = createTaskShiftsMock();
    app = await createTestApp({ taskShifts: taskShiftsMock });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /task-shifts', () => {
    it('returns 200 + list of task shifts', async () => {
      taskShiftsMock.getAllTaskShifts.mockResolvedValue([mockTaskShift()]);

      const response = await request(app.getHttpServer())
        .get('/task-shifts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect((response.body as Record<string, unknown>[])[0]).toHaveProperty('id');
      expect((response.body as Record<string, unknown>[])[0]).toHaveProperty('employees');
      expect(taskShiftsMock.getAllTaskShifts).toHaveBeenCalled();
    });

    it('returns 200 + empty list when no task shifts exist', async () => {
      taskShiftsMock.getAllTaskShifts.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/task-shifts')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /task-shifts/:id', () => {
    it('returns 200 + task shift by id', async () => {
      const shift = mockTaskShift();
      taskShiftsMock.getTaskShiftById.mockResolvedValue(shift);

      const response = await request(app.getHttpServer())
        .get(`/task-shifts/${shift.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', shift.id);
      expect(response.body).toHaveProperty('entityId');
      expect(response.body).toHaveProperty('employees');
      expect(taskShiftsMock.getTaskShiftById).toHaveBeenCalledWith(
        shift.id,
        expect.any(String),
      );
    });

    it('returns 404 when task shift not found', async () => {
      taskShiftsMock.getTaskShiftById.mockRejectedValue(
        new NotFoundException('Task shift not found'),
      );

      await request(app.getHttpServer())
        .get('/task-shifts/nonexistent-id')
        .expect(404);
    });
  });

  describe('POST /task-shifts', () => {
    it('returns 201 + created task shift', async () => {
      const shift = mockTaskShift();
      taskShiftsMock.createTaskShift.mockResolvedValue(shift);

      const response = await request(app.getHttpServer())
        .post('/task-shifts')
        .send(validTaskShiftPayload())
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('entityId');
      expect(response.body).toHaveProperty('employees');
      expect(taskShiftsMock.createTaskShift).toHaveBeenCalled();
    });

    it('returns 400 on invalid payload (missing entityId)', async () => {
      await request(app.getHttpServer())
        .post('/task-shifts')
        .send({
          startTime: '2026-08-11T08:00:00.000Z',
          endTime: '2026-08-11T17:00:00.000Z',
          employeeUserIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
        })
        .expect(400);
    });

    it('returns 400 on invalid payload (missing startTime)', async () => {
      await request(app.getHttpServer())
        .post('/task-shifts')
        .send({
          entityId: 'e1b2c3d4-e5f6-7890-abcd-ef1234567890',
          endTime: '2026-08-11T17:00:00.000Z',
          employeeUserIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
        })
        .expect(400);
    });

    it('returns 400 on invalid payload (empty employeeUserIds)', async () => {
      await request(app.getHttpServer())
        .post('/task-shifts')
        .send({
          entityId: 'e1b2c3d4-e5f6-7890-abcd-ef1234567890',
          startTime: '2026-08-11T08:00:00.000Z',
          endTime: '2026-08-11T17:00:00.000Z',
          employeeUserIds: [],
        })
        .expect(400);
    });

    it('returns 400 on invalid datetime format', async () => {
      await request(app.getHttpServer())
        .post('/task-shifts')
        .send({
          entityId: 'e1b2c3d4-e5f6-7890-abcd-ef1234567890',
          startTime: 'not-a-date',
          endTime: '2026-08-11T17:00:00.000Z',
          employeeUserIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
        })
        .expect(400);
    });
  });

  describe('PATCH /task-shifts/:id', () => {
    it('returns 200 + updated task shift', async () => {
      const updated = { ...mockTaskShift(), entityId: 'new-entity-id' };
      taskShiftsMock.updateTaskShift.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch(`/task-shifts/${updated.id}`)
        .send({ entityId: 'new-entity-id' })
        .expect(200);

      expect(response.body).toHaveProperty('entityId', 'new-entity-id');
      expect(taskShiftsMock.updateTaskShift).toHaveBeenCalled();
    });

    it('returns 404 when updating non-existent task shift', async () => {
      taskShiftsMock.updateTaskShift.mockRejectedValue(
        new NotFoundException('Task shift not found'),
      );

      await request(app.getHttpServer())
        .patch('/task-shifts/nonexistent-id')
        .send({ entityId: 'new-entity-id' })
        .expect(404);
    });

    it('returns 400 on invalid payload for PATCH', async () => {
      await request(app.getHttpServer())
        .patch('/task-shifts/some-id')
        .send({ startTime: 'not-a-date' })
        .expect(400);
    });
  });
});

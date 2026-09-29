// apps/backend/test/integration/taskShifts.integration.spec.ts
import { INestApplication, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';
import { createTaskShiftsMock } from './helpers/mock-factories';
import { validTaskShiftPayload, mockTaskShift } from './fixtures/fixtures';

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

      const body = response.body as Array<{
        id: string;
        startTime: string;
        endTime: string;
      }>;
      expect(body).toBeInstanceOf(Array);
      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('id');
      expect(body[0]).toHaveProperty('startTime');
      expect(body[0]).toHaveProperty('endTime');
      expect(taskShiftsMock.getAllTaskShifts).toHaveBeenCalledWith(
        expect.any(String),
      );
    });

    it('returns 200 + empty array when no task shifts exist', async () => {
      taskShiftsMock.getAllTaskShifts.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/task-shifts')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('POST /task-shifts', () => {
    it('returns 201 + created task shift on valid payload', async () => {
      taskShiftsMock.createTaskShift.mockResolvedValue(mockTaskShift());

      const response = await request(app.getHttpServer())
        .post('/task-shifts')
        .send(validTaskShiftPayload())
        .expect(201);

      const body = response.body as {
        id: string;
        startTime: string;
        endTime: string;
      };
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('startTime');
      expect(body).toHaveProperty('endTime');
      expect(taskShiftsMock.createTaskShift).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: 'cltaskshiftpayload0000000',
        }),
        expect.any(String),
      );
    });

    it('returns 400 on invalid body (missing entityId)', async () => {
      await request(app.getHttpServer())
        .post('/task-shifts')
        .send({
          partidaId: 1,
          anio: 2026,
          indice: 1,
          startTime: '2026-08-11T08:00:00.000Z',
          endTime: '2026-08-11T17:00:00.000Z',
          employeeUserIds: [],
        })
        .expect(400);
    });

    it('returns 400 on missing startTime', async () => {
      await request(app.getHttpServer())
        .post('/task-shifts')
        .send({
          entityId: 'cltaskshiftpayload0000000',
          partidaId: 1,
          anio: 2026,
          indice: 1,
          endTime: '2026-08-11T17:00:00.000Z',
          employeeUserIds: [],
        })
        .expect(400);
    });

    it('returns 400 on missing endTime', async () => {
      await request(app.getHttpServer())
        .post('/task-shifts')
        .send({
          entityId: 'cltaskshiftpayload0000000',
          partidaId: 1,
          anio: 2026,
          indice: 1,
          startTime: '2026-08-11T08:00:00.000Z',
          employeeUserIds: [],
        })
        .expect(400);
    });
  });

  describe('GET /task-shifts/:id', () => {
    it('returns 200 + task shift when found', async () => {
      taskShiftsMock.getTaskShiftById.mockResolvedValue(mockTaskShift());

      const response = await request(app.getHttpServer())
        .get('/task-shifts/cltaskshiftmock1000000000')
        .expect(200);

      const body = response.body as { id: string; employees: unknown };
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('employees');
      expect(taskShiftsMock.getTaskShiftById).toHaveBeenCalledWith(
        'cltaskshiftmock1000000000',
        expect.any(String),
      );
    });

    it('returns 404 when task shift not found', async () => {
      taskShiftsMock.getTaskShiftById.mockRejectedValue(
        new NotFoundException('Task shift not found'),
      );

      await request(app.getHttpServer())
        .get('/task-shifts/nonexistent')
        .expect(404);
    });
  });

  describe('PATCH /task-shifts/:id', () => {
    it('returns 200 + updated task shift on valid payload', async () => {
      const updated = {
        ...mockTaskShift(),
        startTime: '2026-08-12T09:00:00.000Z',
      };
      taskShiftsMock.updateTaskShift.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch('/task-shifts/cltaskshiftmock1000000000')
        .send({ startTime: '2026-08-12T09:00:00.000Z' })
        .expect(200);

      const body = response.body as { startTime: string };
      expect(body).toHaveProperty('startTime', '2026-08-12T09:00:00.000Z');
      expect(taskShiftsMock.updateTaskShift).toHaveBeenCalledWith(
        'cltaskshiftmock1000000000',
        expect.objectContaining({ startTime: '2026-08-12T09:00:00.000Z' }),
        expect.any(String),
      );
    });

    it('returns 404 when task shift not found on update', async () => {
      taskShiftsMock.updateTaskShift.mockRejectedValue(
        new NotFoundException('Task shift not found'),
      );

      await request(app.getHttpServer())
        .patch('/task-shifts/nonexistent')
        .send({ startTime: '2026-08-12T09:00:00.000Z' })
        .expect(404);
    });

    it('returns 200 with empty body update (no fields)', async () => {
      taskShiftsMock.updateTaskShift.mockResolvedValue(mockTaskShift());

      await request(app.getHttpServer())
        .patch('/task-shifts/cltaskshiftmock1000000000')
        .send({})
        .expect(200);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TaskShiftsRepository } from '../repositories/taskShifts.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('TaskShiftsRepository', () => {
  let repository: TaskShiftsRepository;
  let prisma: {
    taskShift: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    taskShiftEmployee: {
      findMany: jest.Mock;
      createMany: jest.Mock;
      deleteMany: jest.Mock;
    };
    devAccount: {
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockTaskShift = {
    id: 'task-1',
    createdByUserId: 'user-1',
    entityId: 'entity-1',
    startTime: new Date('2026-08-11T08:00:00Z'),
    endTime: new Date('2026-08-11T16:00:00Z'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    deletedByUserId: null,
    employees: [{ userId: 'emp-1' }, { userId: 'emp-2' }],
  };

  beforeEach(async () => {
    prisma = {
      taskShift: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      taskShiftEmployee: {
        findMany: jest.fn(),
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      devAccount: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskShiftsRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<TaskShiftsRepository>(TaskShiftsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all task shifts for dev users', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.taskShift.findMany.mockResolvedValue([mockTaskShift]);

      const result = await repository.findAll('dev-1');

      expect(result).toEqual([mockTaskShift]);
      expect(prisma.taskShift.findMany).toHaveBeenCalledWith({
        include: { employees: { select: { userId: true } } },
        orderBy: { startTime: 'desc' },
      });
    });

    it('should return active non-deleted task shifts for normal users', async () => {
      prisma.taskShift.findMany.mockResolvedValue([mockTaskShift]);

      const result = await repository.findAll('user-1');

      expect(result).toEqual([mockTaskShift]);
      expect(prisma.taskShift.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, isActive: true },
        include: { employees: { select: { userId: true } } },
        orderBy: { startTime: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a task shift by id for dev users', async () => {
      prisma.devAccount.findMany.mockResolvedValue([{ userId: 'dev-1' }]);
      prisma.taskShift.findFirst.mockResolvedValue(mockTaskShift);

      const result = await repository.findById('task-1', 'dev-1');

      expect(result).toEqual(mockTaskShift);
      expect(prisma.taskShift.findFirst).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        include: { employees: { select: { userId: true } } },
      });
    });

    it('should return active task shift for normal users', async () => {
      prisma.taskShift.findFirst.mockResolvedValue(mockTaskShift);

      const result = await repository.findById('task-1', 'user-1');

      expect(result).toEqual(mockTaskShift);
      expect(prisma.taskShift.findFirst).toHaveBeenCalledWith({
        where: { id: 'task-1', deletedAt: null, isActive: true },
        include: { employees: { select: { userId: true } } },
      });
    });

    it('should return null if task shift not found', async () => {
      prisma.taskShift.findFirst.mockResolvedValue(null);

      const result = await repository.findById('nonexistent', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('createWithEmployees', () => {
    it('should create task shift and employees in a transaction', async () => {
      const createdTask = { ...mockTaskShift, id: 'task-new' };
      prisma.$transaction.mockImplementation(
        async (fn: (tx: typeof prisma) => Promise<unknown>) => {
          const tx = {
            taskShift: {
              create: jest.fn().mockResolvedValue(createdTask),
              findUnique: jest.fn().mockResolvedValue(createdTask),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            taskShiftEmployee: {
              createMany: jest.fn().mockResolvedValue({ count: 2 }),
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
            devAccount: { findMany: jest.fn() },
          };
          return fn(tx as unknown as typeof prisma);
        },
      );

      const result = await repository.createWithEmployees(
        {
          createdByUserId: 'user-1',
          entityId: 'entity-1',
          partidaId: 1,
          anio: 2026,
          indice: 0,
          startTime: new Date('2026-08-11T08:00:00Z'),
          endTime: new Date('2026-08-11T16:00:00Z'),
          employeeUserIds: ['emp-1', 'emp-2'],
        },
        'user-1',
      );

      expect(result).toEqual(createdTask);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('updateWithEmployees', () => {
    it('should update task shift fields and re-sync employees', async () => {
      const updatedTask = {
        ...mockTaskShift,
        startTime: new Date('2026-08-11T09:00:00Z'),
      };
      prisma.$transaction.mockImplementation(
        async (fn: (tx: typeof prisma) => Promise<unknown>) => {
          const tx = {
            taskShift: {
              update: jest.fn().mockResolvedValue(updatedTask),
              findUnique: jest.fn().mockResolvedValue(updatedTask),
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            taskShiftEmployee: {
              deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
              createMany: jest.fn().mockResolvedValue({ count: 1 }),
              findMany: jest.fn(),
            },
            devAccount: { findMany: jest.fn() },
          };
          return fn(tx as unknown as typeof prisma);
        },
      );

      const result = await repository.updateWithEmployees(
        'task-1',
        {
          startTime: new Date('2026-08-11T09:00:00Z'),
          employeeUserIds: ['emp-1'],
        },
        'user-1',
      );

      expect(result).toEqual(updatedTask);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should skip field update when only employees change', async () => {
      prisma.$transaction.mockImplementation(
        async (fn: (tx: typeof prisma) => Promise<unknown>) => {
          const tx = {
            taskShift: {
              update: jest.fn(),
              findUnique: jest.fn().mockResolvedValue(mockTaskShift),
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            taskShiftEmployee: {
              deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
              createMany: jest.fn().mockResolvedValue({ count: 2 }),
              findMany: jest.fn(),
            },
            devAccount: { findMany: jest.fn() },
          };
          return fn(tx as unknown as typeof prisma);
        },
      );

      const result = await repository.updateWithEmployees(
        'task-1',
        { employeeUserIds: ['emp-1', 'emp-2'] },
        'user-1',
      );

      expect(result).toEqual(mockTaskShift);
    });
  });

  describe('softDelete', () => {
    it('should delegate to base repository softDelete', async () => {
      const deletedAt = new Date();
      prisma.taskShift.update.mockResolvedValue({
        ...mockTaskShift,
        isActive: false,
        deletedAt,
        deletedByUserId: 'user-1',
      });

      const result = await repository.softDelete('task-1', 'user-1');

      expect(result.isActive).toBe(false);
      expect(result.deletedByUserId).toBe('user-1');
      expect(result.deletedAt).toBe(deletedAt);
      expect(prisma.taskShift.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: {
          deletedAt,
          deletedByUserId: 'user-1',
          isActive: false,
        },
      });
    });
  });
});

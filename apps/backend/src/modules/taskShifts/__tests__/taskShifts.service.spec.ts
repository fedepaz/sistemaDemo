import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TaskShiftsService } from '../taskShifts.service';
import { TaskShiftsRepository } from '../repositories/taskShifts.repository';

describe('TaskShiftsService', () => {
  let service: TaskShiftsService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    createWithEmployees: jest.Mock;
    updateWithEmployees: jest.Mock;
    softDelete: jest.Mock;
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
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      createWithEmployees: jest.fn(),
      updateWithEmployees: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskShiftsService,
        { provide: TaskShiftsRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<TaskShiftsService>(TaskShiftsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTaskShifts', () => {
    it('should return all task shifts', async () => {
      repo.findAll.mockResolvedValue([mockTaskShift]);

      const result = await service.getAllTaskShifts('user-1');

      expect(result).toEqual([mockTaskShift]);
      expect(repo.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getTaskShiftById', () => {
    it('should return a task shift by id', async () => {
      repo.findById.mockResolvedValue(mockTaskShift);

      const result = await service.getTaskShiftById('task-1', 'user-1');

      expect(result).toEqual(mockTaskShift);
      expect(repo.findById).toHaveBeenCalledWith('task-1', 'user-1');
    });

    it('should throw NotFoundException if task shift not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.getTaskShiftById('nonexistent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTaskShift', () => {
    it('should create a task shift with valid data', async () => {
      repo.createWithEmployees.mockResolvedValue(mockTaskShift);

      const dto = {
        entityId: 'entity-1',
        startTime: '2026-08-11T08:00:00.000Z',
        endTime: '2026-08-11T16:00:00.000Z',
        employeeUserIds: ['emp-1', 'emp-2'],
      };

      const result = await service.createTaskShift(dto, 'user-1');

      expect(result).toEqual(mockTaskShift);
      expect(repo.createWithEmployees).toHaveBeenCalledWith(
        {
          createdByUserId: 'user-1',
          entityId: 'entity-1',
          startTime: new Date('2026-08-11T08:00:00.000Z'),
          endTime: new Date('2026-08-11T16:00:00.000Z'),
          employeeUserIds: ['emp-1', 'emp-2'],
        },
        'user-1',
      );
    });

    it('should throw BadRequestException if endTime is before startTime', async () => {
      const dto = {
        entityId: 'entity-1',
        startTime: '2026-08-11T16:00:00.000Z',
        endTime: '2026-08-11T08:00:00.000Z',
        employeeUserIds: ['emp-1'],
      };

      await expect(service.createTaskShift(dto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if endTime equals startTime', async () => {
      const dto = {
        entityId: 'entity-1',
        startTime: '2026-08-11T08:00:00.000Z',
        endTime: '2026-08-11T08:00:00.000Z',
        employeeUserIds: ['emp-1'],
      };

      await expect(service.createTaskShift(dto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateTaskShift', () => {
    it('should update a task shift with valid data', async () => {
      repo.findById.mockResolvedValue(mockTaskShift);
      const updated = { ...mockTaskShift, entityId: 'entity-2' };
      repo.updateWithEmployees.mockResolvedValue(updated);

      const dto = { entityId: 'entity-2' };

      const result = await service.updateTaskShift('task-1', dto, 'user-1');

      expect(result).toEqual(updated);
      expect(repo.updateWithEmployees).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({ entityId: 'entity-2' }),
        'user-1',
      );
    });

    it('should throw NotFoundException if task shift not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.updateTaskShift(
          'nonexistent',
          { entityId: 'entity-2' },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if new endTime is before new startTime', async () => {
      repo.findById.mockResolvedValue(mockTaskShift);

      const dto = {
        startTime: '2026-08-11T16:00:00.000Z',
        endTime: '2026-08-11T08:00:00.000Z',
      };

      await expect(
        service.updateTaskShift('task-1', dto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('softDeleteTaskShift', () => {
    it('should soft delete a task shift', async () => {
      repo.findById.mockResolvedValue(mockTaskShift);
      repo.softDelete.mockResolvedValue({ ...mockTaskShift, isActive: false });

      await service.softDeleteTaskShift('task-1', 'user-1');

      expect(repo.softDelete).toHaveBeenCalledWith('task-1', 'user-1');
    });

    it('should throw NotFoundException if task shift not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.softDeleteTaskShift('nonexistent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

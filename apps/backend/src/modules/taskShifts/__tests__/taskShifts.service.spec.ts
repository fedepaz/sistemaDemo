import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TaskShiftsService } from '../taskShifts.service';
import { TaskShiftsRepository } from '../repositories/taskShifts.repository';
import { TaskShiftDto } from '@vivero/shared';

describe('TaskShiftsService', () => {
  let service: TaskShiftsService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    createWithEmployees: jest.Mock;
    updateWithEmployees: jest.Mock;
  };

  const mockPrismaTaskShift = {
    id: 'task-1',
    createdByUserId: 'user-1',
    entityId: 'entity-1',
    startTime: new Date('2026-08-11T08:00:00.000Z'),
    endTime: new Date('2026-08-11T16:00:00.000Z'),
    isActive: true,
    createdAt: new Date('2026-08-10T12:00:00.000Z'),
    updatedAt: new Date('2026-08-10T12:00:00.000Z'),
    deletedAt: null,
    deletedByUserId: null,
    employees: [{ userId: 'emp-1' }, { userId: 'emp-2' }],
  };

  const expectedDto: TaskShiftDto = {
    id: 'task-1',
    createdByUserId: 'user-1',
    entityId: 'entity-1',
    startTime: '2026-08-11T08:00:00.000Z',
    endTime: '2026-08-11T16:00:00.000Z',
    isActive: true,
    createdAt: '2026-08-10T12:00:00.000Z',
    updatedAt: '2026-08-10T12:00:00.000Z',
    employees: [{ userId: 'emp-1' }, { userId: 'emp-2' }],
  };

  beforeEach(async () => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      createWithEmployees: jest.fn(),
      updateWithEmployees: jest.fn(),
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
    it('should return mapped DTOs', async () => {
      repo.findAll.mockResolvedValue([mockPrismaTaskShift]);

      const result = await service.getAllTaskShifts('user-1');

      expect(result).toEqual([expectedDto]);
      expect(repo.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getTaskShiftById', () => {
    it('should return a mapped DTO by id', async () => {
      repo.findById.mockResolvedValue(mockPrismaTaskShift);

      const result = await service.getTaskShiftById('task-1', 'user-1');

      expect(result).toEqual(expectedDto);
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
    it('should create and return mapped DTO', async () => {
      repo.createWithEmployees.mockResolvedValue(mockPrismaTaskShift);

      const dto = {
        entityId: 'entity-1',
        startTime: '2026-08-11T08:00:00.000Z',
        endTime: '2026-08-11T16:00:00.000Z',
        employeeUserIds: ['emp-1', 'emp-2'],
      };

      const result = await service.createTaskShift(dto, 'user-1');

      expect(result).toEqual(expectedDto);
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
    it('should update and return mapped DTO', async () => {
      repo.findById.mockResolvedValue(mockPrismaTaskShift);
      const updatedPrisma = { ...mockPrismaTaskShift, entityId: 'entity-2' };
      repo.updateWithEmployees.mockResolvedValue(updatedPrisma);

      const dto = { entityId: 'entity-2' };

      const result = await service.updateTaskShift('task-1', dto, 'user-1');

      expect(result).toEqual({ ...expectedDto, entityId: 'entity-2' });
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
      repo.findById.mockResolvedValue(mockPrismaTaskShift);

      const dto = {
        startTime: '2026-08-11T16:00:00.000Z',
        endTime: '2026-08-11T08:00:00.000Z',
      };

      await expect(
        service.updateTaskShift('task-1', dto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

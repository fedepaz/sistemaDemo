// src/modules/alertComments/__tests__/alertComments.repository.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AlertCommentsRepository } from '../repositories/alertComments.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('AlertCommentsRepository', () => {
  let repository: AlertCommentsRepository;
  let prisma: {
    alertComment: {
      findMany: jest.Mock;
      create: jest.Mock;
      groupBy: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      alertComment: {
        findMany: jest.fn(),
        create: jest.fn(),
        groupBy: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertCommentsRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<AlertCommentsRepository>(AlertCommentsRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findByPartida', () => {
    it('queries with correct where clause', async () => {
      const mockRows = [
        {
          id: 'cmt-1',
          alertType: 'SIEMBRA_RETRASADA',
          partidaId: 10,
          anio: 2026,
          indice: 1,
          content: 'Test',
          userId: 'usr-1',
          user: { username: 'admin' },
          createdAt: new Date(),
        },
      ];
      prisma.alertComment.findMany.mockResolvedValue(mockRows);

      const result = await repository.findByPartida(
        'SIEMBRA_RETRASADA',
        10,
        2026,
        1,
      );

      expect(result).toEqual(mockRows);
      expect(prisma.alertComment.findMany).toHaveBeenCalledWith({
        where: {
          alertType: 'SIEMBRA_RETRASADA',
          partidaId: 10,
          anio: 2026,
          indice: 1,
        },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true } } },
      });
    });
  });

  describe('createWithUser', () => {
    it('creates with correct data and includes user', async () => {
      const data = {
        alertType: 'SIEMBRA_RETRASADA',
        partidaId: 10,
        anio: 2026,
        indice: 1,
        content: 'New comment',
        userId: 'usr-1',
      };
      const mockRow = {
        id: 'cmt-2',
        ...data,
        user: { username: 'admin' },
        createdAt: new Date(),
      };
      prisma.alertComment.create.mockResolvedValue(mockRow);

      const result = await repository.createWithUser(data);

      expect(result).toEqual(mockRow);
      expect(prisma.alertComment.create).toHaveBeenCalledWith({
        data,
        include: { user: { select: { username: true } } },
      });
    });
  });

  describe('getCommentCounts', () => {
    it('returns empty map for empty keys', async () => {
      const result = await repository.getCommentCounts('SIEMBRA_RETRASADA', []);

      expect(result.size).toBe(0);
      expect(prisma.alertComment.groupBy).not.toHaveBeenCalled();
    });

    it('maps groupBy results correctly', async () => {
      const keys = [
        { partidaId: 10, anio: 2026, indice: 1 },
        { partidaId: 20, anio: 2026, indice: 2 },
      ];
      const groupByResult = [
        {
          partidaId: 10,
          anio: 2026,
          indice: 1,
          _count: { id: 5 },
        },
        {
          partidaId: 20,
          anio: 2026,
          indice: 2,
          _count: { id: 3 },
        },
      ];
      prisma.alertComment.groupBy.mockResolvedValue(groupByResult);

      const result = await repository.getCommentCounts(
        'SIEMBRA_RETRASADA',
        keys,
      );

      expect(result.get('10-2026-1')).toBe(5);
      expect(result.get('20-2026-2')).toBe(3);
      expect(prisma.alertComment.groupBy).toHaveBeenCalledWith({
        by: ['partidaId', 'anio', 'indice'],
        where: {
          alertType: 'SIEMBRA_RETRASADA',
          OR: [
            { partidaId: 10, anio: 2026, indice: 1 },
            { partidaId: 20, anio: 2026, indice: 2 },
          ],
        },
        _count: { id: true },
      });
    });
  });
});

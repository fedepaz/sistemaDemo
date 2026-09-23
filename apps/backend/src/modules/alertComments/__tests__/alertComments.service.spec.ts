// src/modules/alertComments/__tests__/alertComments.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AlertCommentsService } from '../alertComments.service';
import { AlertCommentsRepository } from '../repositories/alertComments.repository';
import { PartidasRepository } from '../../legacy/partidas/repositories/partidas.repository';
import { AlertCommentWithUser } from '../repositories/alertComments.repository';

describe('AlertCommentsService', () => {
  let service: AlertCommentsService;
  let repo: {
    findByPartida: jest.Mock;
    getCommentCounts: jest.Mock;
    createWithUser: jest.Mock;
  };
  let partidaRepo: {
    findOne: jest.Mock;
  };

  const mockRow: AlertCommentWithUser = {
    id: 'cmt-1',
    alertType: 'SIEMBRA_RETRASADA',
    partidaId: 10,
    anio: 2026,
    indice: 1,
    content: 'Test comment',
    userId: 'usr-1',
    user: { username: 'admin' },
    createdAt: new Date('2026-09-15T10:00:00.000Z'),
  };

  const expectedDto = {
    id: 'cmt-1',
    alertType: 'SIEMBRA_RETRASADA',
    partidaId: 10,
    anio: 2026,
    indice: 1,
    content: 'Test comment',
    userId: 'usr-1',
    userName: 'admin',
    createdAt: '2026-09-15T10:00:00.000Z',
  };

  beforeEach(async () => {
    repo = {
      findByPartida: jest.fn(),
      getCommentCounts: jest.fn(),
      createWithUser: jest.fn(),
    };
    partidaRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertCommentsService,
        { provide: AlertCommentsRepository, useValue: repo },
        { provide: PartidasRepository, useValue: partidaRepo },
      ],
    }).compile();

    service = module.get<AlertCommentsService>(AlertCommentsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getComments', () => {
    it('returns mapped DTOs from repository', async () => {
      repo.findByPartida.mockResolvedValue([mockRow]);

      const result = await service.getComments(
        'SIEMBRA_RETRASADA',
        10,
        2026,
        1,
      );

      expect(result).toEqual([expectedDto]);
      expect(repo.findByPartida).toHaveBeenCalledWith(
        'SIEMBRA_RETRASADA',
        10,
        2026,
        1,
      );
    });

    it('returns empty array when no comments', async () => {
      repo.findByPartida.mockResolvedValue([]);

      const result = await service.getComments(
        'SIEMBRA_RETRASADA',
        10,
        2026,
        1,
      );

      expect(result).toEqual([]);
    });
  });

  describe('getCommentCounts', () => {
    it('delegates to repository', async () => {
      const keys = [{ partidaId: 10, anio: 2026, indice: 1 }];
      const map = new Map([['10-2026-1', 3]]);
      repo.getCommentCounts.mockResolvedValue(map);

      const result = await service.getCommentCounts('SIEMBRA_RETRASADA', keys);

      expect(result).toBe(map);
      expect(repo.getCommentCounts).toHaveBeenCalledWith(
        'SIEMBRA_RETRASADA',
        keys,
      );
    });

    it('returns empty map for empty keys', async () => {
      const emptyMap = new Map<string, number>();
      repo.getCommentCounts.mockResolvedValue(emptyMap);

      const result = await service.getCommentCounts('SIEMBRA_RETRASADA', []);

      expect(result.size).toBe(0);
    });
  });

  describe('createComment', () => {
    it('creates and returns mapped DTO', async () => {
      partidaRepo.findOne.mockResolvedValue({ id: 10 });
      repo.createWithUser.mockResolvedValue(mockRow);

      const dto = {
        alertType: 'SIEMBRA_RETRASADA' as const,
        partidaId: 10,
        anio: 2026,
        indice: 1,
        content: 'Test comment',
      };

      const result = await service.createComment(dto, 'usr-1');

      expect(result).toEqual(expectedDto);
      expect(partidaRepo.findOne).toHaveBeenCalledWith(10);
      expect(repo.createWithUser).toHaveBeenCalledWith({
        alertType: 'SIEMBRA_RETRASADA',
        partidaId: 10,
        anio: 2026,
        indice: 1,
        content: 'Test comment',
        userId: 'usr-1',
      });
    });

    it('throws NotFoundException when partida not found', async () => {
      partidaRepo.findOne.mockResolvedValue(null);

      const dto = {
        alertType: 'SIEMBRA_RETRASADA' as const,
        partidaId: 999,
        anio: 2026,
        indice: 1,
        content: 'Test',
      };

      await expect(service.createComment(dto, 'usr-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.createWithUser).not.toHaveBeenCalled();
    });
  });
});

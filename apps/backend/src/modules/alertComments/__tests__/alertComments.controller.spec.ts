// src/modules/alertComments/__tests__/alertComments.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AlertCommentsController } from '../alertComments.controller';
import { AlertCommentsService } from '../alertComments.service';

describe('AlertCommentsController', () => {
  let controller: AlertCommentsController;
  let service: {
    getComments: jest.Mock;
    createComment: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      getComments: jest.fn(),
      createComment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertCommentsController],
      providers: [{ provide: AlertCommentsService, useValue: service }],
    }).compile();

    controller = module.get<AlertCommentsController>(AlertCommentsController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getComments', () => {
    it('delegates to service with correct params', async () => {
      const mockDtos = [
        {
          id: 'cmt-1',
          alertType: 'SIEMBRA_RETRASADA',
          partidaId: 10,
          anio: 2026,
          indice: 1,
          content: 'Hello',
          userId: 'usr-1',
          userName: 'admin',
          createdAt: '2026-09-15T10:00:00.000Z',
        },
      ];
      service.getComments.mockResolvedValue(mockDtos);

      const result = await controller.getComments(
        'SIEMBRA_RETRASADA',
        10,
        2026,
        1,
      );

      expect(result).toEqual(mockDtos);
      expect(service.getComments).toHaveBeenCalledWith(
        'SIEMBRA_RETRASADA',
        10,
        2026,
        1,
      );
    });
  });

  describe('createComment', () => {
    it('delegates to service with data and user id', async () => {
      const mockDto = {
        id: 'cmt-2',
        alertType: 'SIEMBRA_RETRASADA',
        partidaId: 10,
        anio: 2026,
        indice: 1,
        content: 'New comment',
        userId: 'usr-1',
        userName: 'admin',
        createdAt: '2026-09-20T10:00:00.000Z',
      };
      service.createComment.mockResolvedValue(mockDto);

      const user = { id: 'usr-1', username: 'admin', tenantId: 't-1' };
      const data = {
        alertType: 'SIEMBRA_RETRASADA' as const,
        partidaId: 10,
        anio: 2026,
        indice: 1,
        content: 'New comment',
      };

      const result = await controller.createComment(user, data);

      expect(result).toEqual(mockDto);
      expect(service.createComment).toHaveBeenCalledWith(data, 'usr-1');
    });
  });
});

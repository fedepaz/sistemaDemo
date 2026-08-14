import { Test, TestingModule } from '@nestjs/testing';
import { AlertSolvedController } from '../alertSolved.controller';
import { AlertSolvedService } from '../alertSolved.service';

describe('AlertSolvedController', () => {
  let controller: AlertSolvedController;
  let mockGetSolvedAlerts: jest.Mock;
  let mockCreateSolvedAlert: jest.Mock;

  const mockUser = {
    id: 'user-1',
    username: 'operator1',
    tenantId: 'tenant-1',
  };

  beforeEach(async () => {
    mockGetSolvedAlerts = jest.fn();
    mockCreateSolvedAlert = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertSolvedController],
      providers: [
        {
          provide: AlertSolvedService,
          useValue: {
            getSolvedAlerts: mockGetSolvedAlerts,
            createSolvedAlert: mockCreateSolvedAlert,
          },
        },
      ],
    }).compile();

    controller = module.get<AlertSolvedController>(AlertSolvedController);
    jest.clearAllMocks();
  });

  describe('getSolvedAlerts', () => {
    it('calls service.getSolvedAlerts with user id', async () => {
      const mockDtos = [
        {
          id: 'solved-1',
          partidaId: 1045,
          anio: 2026,
          indice: 1,
          userId: 'user-1',
          userName: 'operator1',
          createdAt: '2026-08-01T10:00:00.000Z',
        },
      ];
      mockGetSolvedAlerts.mockResolvedValue(mockDtos);

      const result = await controller.getSolvedAlerts(mockUser);

      expect(mockGetSolvedAlerts).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockDtos);
    });
  });

  describe('createSolvedAlert', () => {
    it('calls service.createSolvedAlert with data and user id', async () => {
      const dto = { partidaId: 1045, anio: 2026, indice: 1 };
      const mockCreated = {
        id: 'new-id',
        ...dto,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCreateSolvedAlert.mockResolvedValue(mockCreated);

      const result = await controller.createSolvedAlert(mockUser, dto);

      expect(mockCreateSolvedAlert).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual(mockCreated);
    });
  });
});

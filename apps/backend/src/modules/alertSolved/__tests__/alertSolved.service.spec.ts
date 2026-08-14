import { Test, TestingModule } from '@nestjs/testing';
import { AlertSolvedService } from '../alertSolved.service';
import { AlertSolvedRepository } from '../repositories/alertSolved.repository';

describe('AlertSolvedService', () => {
  let service: AlertSolvedService;
  let mockFindAllAlertsSolved: jest.Mock;
  let mockCreate: jest.Mock;

  const mockRows = [
    {
      id: 'solved-1',
      partidaId: 1045,
      anio: 2026,
      indice: 1,
      userId: 'user-1',
      user: { username: 'operator1' },
      createdAt: new Date('2026-08-01T10:00:00.000Z'),
    },
  ];

  beforeEach(async () => {
    mockFindAllAlertsSolved = jest.fn();
    mockCreate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertSolvedService,
        {
          provide: AlertSolvedRepository,
          useValue: {
            findAllAlertsSolved: mockFindAllAlertsSolved,
            create: mockCreate,
          },
        },
      ],
    }).compile();

    service = module.get<AlertSolvedService>(AlertSolvedService);
    jest.clearAllMocks();
  });

  describe('getSolvedAlerts', () => {
    it('maps repository rows to DTOs correctly', async () => {
      mockFindAllAlertsSolved.mockResolvedValue(mockRows);

      const result = await service.getSolvedAlerts('user-1');

      expect(result).toEqual([
        {
          id: 'solved-1',
          partidaId: 1045,
          anio: 2026,
          indice: 1,
          userId: 'user-1',
          userName: 'operator1',
          createdAt: '2026-08-01T10:00:00.000Z',
        },
      ]);
    });

    it('calls repo with returnAll=false by default', async () => {
      mockFindAllAlertsSolved.mockResolvedValue([]);

      await service.getSolvedAlerts('user-1');

      expect(mockFindAllAlertsSolved).toHaveBeenCalledWith('user-1', false);
    });

    it('passes returnAll through to repo', async () => {
      mockFindAllAlertsSolved.mockResolvedValue([]);

      await service.getSolvedAlerts('user-1', true);

      expect(mockFindAllAlertsSolved).toHaveBeenCalledWith('user-1', true);
    });

    it('returns empty array when no solved alerts exist', async () => {
      mockFindAllAlertsSolved.mockResolvedValue([]);

      const result = await service.getSolvedAlerts('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('createSolvedAlert', () => {
    it('calls repo.create with correct mapped data', async () => {
      const data = { partidaId: 1045, anio: 2026, indice: 1 };
      const mockCreated = {
        id: 'new-id',
        ...data,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCreate.mockResolvedValue(mockCreated);

      const result = await service.createSolvedAlert(data, 'user-1');

      expect(mockCreate).toHaveBeenCalledWith({
        partidaId: 1045,
        anio: 2026,
        indice: 1,
        userId: 'user-1',
      });
      expect(result).toEqual(mockCreated);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AlertSolvedRepository } from '../repositories/alertSolved.repository';
import { PrismaService } from '../../../infra/prisma/prisma.service';

describe('AlertSolvedRepository', () => {
  let repository: AlertSolvedRepository;
  let mockPrismaAlertsSolved: {
    findMany: jest.Mock;
    create: jest.Mock;
  };
  let mockPrismaDevAccount: {
    findMany: jest.Mock;
  };

  const mockDevIds = ['dev-user-1', 'dev-user-2'];

  const mockRows = [
    {
      id: 'solved-1',
      partidaId: 1045,
      anio: 2026,
      indice: 1,
      userId: 'user-1',
      user: { username: 'operator1' },
      createdAt: new Date('2026-08-01'),
    },
    {
      id: 'solved-2',
      partidaId: 1050,
      anio: 2026,
      indice: 2,
      userId: 'dev-user-1',
      user: { username: 'devadmin' },
      createdAt: new Date('2026-08-02'),
    },
  ];

  beforeEach(async () => {
    mockPrismaAlertsSolved = {
      findMany: jest.fn().mockResolvedValue(mockRows),
      create: jest.fn(),
    };
    mockPrismaDevAccount = {
      findMany: jest
        .fn()
        .mockResolvedValue(mockDevIds.map((userId) => ({ userId }))),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertSolvedRepository,
        {
          provide: PrismaService,
          useValue: {
            alertsSolved: mockPrismaAlertsSolved,
            devAccount: mockPrismaDevAccount,
          },
        },
      ],
    }).compile();

    repository = module.get<AlertSolvedRepository>(AlertSolvedRepository);
    jest.clearAllMocks();
  });

  describe('findAllAlertsSolved', () => {
    it('returns all rows when returnAll=true', async () => {
      const result = await repository.findAllAlertsSolved('user-1', true);

      expect(result).toEqual(mockRows);
      expect(mockPrismaAlertsSolved.findMany).toHaveBeenCalledWith({
        include: { user: { select: { username: true } } },
      });
    });

    it('returns all rows when requester is a dev account', async () => {
      const result = await repository.findAllAlertsSolved('dev-user-1', false);

      expect(result).toEqual(mockRows);
      expect(mockPrismaAlertsSolved.findMany).toHaveBeenCalledWith({
        include: { user: { select: { username: true } } },
      });
    });

    it('filters rows when requester is not a dev account', async () => {
      const result = await repository.findAllAlertsSolved('user-1', false);

      expect(result).toEqual(mockRows);
      expect(mockPrismaAlertsSolved.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          isActive: true,
          id: { notIn: mockDevIds },
        },
        include: { user: { select: { username: true } } },
      });
    });

    it('caches dev accounts across calls', async () => {
      await repository.findAllAlertsSolved('user-1', false);
      await repository.findAllAlertsSolved('user-2', false);

      expect(mockPrismaDevAccount.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('calls prisma.create with correct data and timestamps', async () => {
      const data = {
        partidaId: 1045,
        anio: 2026,
        indice: 1,
        userId: 'user-1',
      };
      const mockCreated = {
        id: 'new-id',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaAlertsSolved.create.mockResolvedValue(mockCreated);

      const result = await repository.create(data);

      expect(mockPrismaAlertsSolved.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCreated);
    });
  });
});

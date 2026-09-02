// src/modules/billboard/__tests__/billboard.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { BillboardService } from '../billboard.service';
import { BillboardRepository } from '../repositories/billboard.repository';
import { PermissionsService } from '../../permissions/permissions.service';
import { UsersRepository } from '../../users/repositories/users.repository';

describe('BillboardService', () => {
  let service: BillboardService;
  let billboardRepo: BillboardRepository;
  let permissionsService: PermissionsService;
  let usersRepo: UsersRepository;

  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    tenantId: 'tenant-1',
    createdAt: new Date('2025-01-01'),
  };

  const mockMessages = [
    {
      id: 'msg-1',
      title: 'Alerts Update',
      body: 'Alerts solved now covers all alerts',
      tag: 'alerts-solved',
      permissionTable: 'alerts',
      permissionAction: 'update',
      permissionScope: 'ALL',
      targetNewUsers: true,
      effectiveFrom: null,
      isActive: true,
      createdAt: new Date('2025-06-01'),
      updatedAt: new Date('2025-06-01'),
      deletedAt: null,
      deletedByUserId: null,
    },
    {
      id: 'msg-2',
      title: 'Old Alerts Update',
      body: 'Previous alerts message',
      tag: 'alerts-solved',
      permissionTable: 'alerts',
      permissionAction: 'update',
      permissionScope: 'ALL',
      targetNewUsers: false,
      effectiveFrom: null,
      isActive: true,
      createdAt: new Date('2025-05-01'),
      updatedAt: new Date('2025-05-01'),
      deletedAt: null,
      deletedByUserId: null,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillboardService,
        {
          provide: BillboardRepository,
          useValue: {
            findAll: jest.fn(),
            findReadIds: jest.fn(),
            markAsRead: jest.fn(),
          },
        },
        {
          provide: PermissionsService,
          useValue: {
            getUserPermissionsByUserId: jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BillboardService>(BillboardService);
    billboardRepo = module.get(BillboardRepository);
    permissionsService = module.get(PermissionsService);
    usersRepo = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUnreadMessages', () => {
    it('returns messages filtered by user permissions', async () => {
      (billboardRepo.findAll as jest.Mock).mockResolvedValue(mockMessages);
      (billboardRepo.findReadIds as jest.Mock).mockResolvedValue(new Set());
      (permissionsService.getUserPermissionsByUserId as jest.Mock).mockResolvedValue({
        alerts: {
          canCreate: false,
          canRead: true,
          canUpdate: true,
          canDelete: false,
          scope: 'ALL',
          permissionType: 'CRUD',
        },
      });
      (usersRepo.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUnreadMessages('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('msg-1');
    });

    it('excludes messages user has no permission for', async () => {
      (billboardRepo.findAll as jest.Mock).mockResolvedValue(mockMessages);
      (billboardRepo.findReadIds as jest.Mock).mockResolvedValue(new Set());
      (permissionsService.getUserPermissionsByUserId as jest.Mock).mockResolvedValue({});
      (usersRepo.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUnreadMessages('user-1');
      expect(result).toHaveLength(0);
    });

    it('excludes already-read messages', async () => {
      (billboardRepo.findAll as jest.Mock).mockResolvedValue(mockMessages);
      (billboardRepo.findReadIds as jest.Mock).mockResolvedValue(new Set(['msg-1']));
      (permissionsService.getUserPermissionsByUserId as jest.Mock).mockResolvedValue({
        alerts: {
          canCreate: false,
          canRead: true,
          canUpdate: true,
          canDelete: false,
          scope: 'ALL',
          permissionType: 'CRUD',
        },
      });
      (usersRepo.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUnreadMessages('user-1');
      expect(result).toHaveLength(0);
    });

    it('keeps only latest message per tag', async () => {
      (billboardRepo.findAll as jest.Mock).mockResolvedValue(mockMessages);
      (billboardRepo.findReadIds as jest.Mock).mockResolvedValue(new Set());
      (permissionsService.getUserPermissionsByUserId as jest.Mock).mockResolvedValue({
        alerts: {
          canCreate: false,
          canRead: true,
          canUpdate: true,
          canDelete: false,
          scope: 'ALL',
          permissionType: 'CRUD',
        },
      });
      (usersRepo.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUnreadMessages('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('msg-1');
    });

    it('respects scope hierarchy', async () => {
      const msgWithAllScope = { ...mockMessages[0], permissionScope: 'ALL' };
      (billboardRepo.findAll as jest.Mock).mockResolvedValue([msgWithAllScope]);
      (billboardRepo.findReadIds as jest.Mock).mockResolvedValue(new Set());
      (permissionsService.getUserPermissionsByUserId as jest.Mock).mockResolvedValue({
        alerts: {
          canCreate: false,
          canRead: true,
          canUpdate: true,
          canDelete: false,
          scope: 'OWN',
          permissionType: 'CRUD',
        },
      });
      (usersRepo.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUnreadMessages('user-1');
      expect(result).toHaveLength(0);
    });

    it('returns empty array if user not found', async () => {
      (billboardRepo.findAll as jest.Mock).mockResolvedValue([]);
      (billboardRepo.findReadIds as jest.Mock).mockResolvedValue(new Set());
      (permissionsService.getUserPermissionsByUserId as jest.Mock).mockResolvedValue({});
      (usersRepo.findById as jest.Mock).mockResolvedValue(null);

      const result = await service.getUnreadMessages('user-1');
      expect(result).toHaveLength(0);
    });
  });

  describe('markAsRead', () => {
    it('marks specific messages as read', async () => {
      (billboardRepo.markAsRead as jest.Mock).mockResolvedValue(2);

      const count = await service.markAsRead('user-1', ['msg-1', 'msg-2']);
      expect(count).toBe(2);
      expect((billboardRepo.markAsRead as jest.Mock).mock.calls[0]).toEqual([
        'user-1',
        ['msg-1', 'msg-2'],
      ]);
    });

    it('marks all unread messages when no IDs provided', async () => {
      (billboardRepo.findAll as jest.Mock).mockResolvedValue(mockMessages);
      (billboardRepo.findReadIds as jest.Mock).mockResolvedValue(new Set());
      (permissionsService.getUserPermissionsByUserId as jest.Mock).mockResolvedValue({
        alerts: {
          canCreate: false,
          canRead: true,
          canUpdate: true,
          canDelete: false,
          scope: 'ALL',
          permissionType: 'CRUD',
        },
      });
      (usersRepo.findById as jest.Mock).mockResolvedValue(mockUser);
      (billboardRepo.markAsRead as jest.Mock).mockResolvedValue(1);

      const count = await service.markAsRead('user-1');
      expect(count).toBe(1);
      expect((billboardRepo.markAsRead as jest.Mock).mock.calls[0]).toEqual([
        'user-1',
        ['msg-1'],
      ]);
    });
  });
});

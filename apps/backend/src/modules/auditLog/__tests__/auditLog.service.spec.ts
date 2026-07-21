import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from '../auditLog.service';
import { AuditLogRepository } from '../repositories/auditLog.repository';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let auditLogRepository: {
    findAll: jest.Mock;
    findAllByTenantName: jest.Mock;
    findAllByUserId: jest.Mock;
  };

  beforeEach(async () => {
    auditLogRepository = {
      findAll: jest.fn(),
      findAllByTenantName: jest.fn(),
      findAllByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: AuditLogRepository, useValue: auditLogRepository },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAuditLogs', () => {
    it('should return all audit logs', async () => {
      const logs = [{ id: '1', action: 'CREATE' }];
      auditLogRepository.findAll.mockResolvedValue(logs);

      const result = await service.getAllAuditLogs();

      expect(result).toEqual(logs);
      expect(auditLogRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getAllByTenantName', () => {
    it('should return paginated audit logs by tenant', async () => {
      const logs = [{ id: '1', action: 'CREATE' }];
      auditLogRepository.findAllByTenantName.mockResolvedValue(logs);

      const result = await service.getAllByTenantName('Default', 1, 10);

      expect(result).toEqual(logs);
      expect(auditLogRepository.findAllByTenantName).toHaveBeenCalledWith(
        'Default',
        0,
        10,
      );
    });

    it('should use default pagination', async () => {
      auditLogRepository.findAllByTenantName.mockResolvedValue([]);

      await service.getAllByTenantName('Default');

      expect(auditLogRepository.findAllByTenantName).toHaveBeenCalledWith(
        'Default',
        0,
        50,
      );
    });
  });

  describe('getAllByUserId', () => {
    it('should return audit logs by user id', async () => {
      const logs = [{ id: '1', userId: 'user-1' }];
      auditLogRepository.findAllByUserId.mockResolvedValue(logs);

      const result = await service.getAllByUserId('user-1');

      expect(result).toEqual(logs);
      expect(auditLogRepository.findAllByUserId).toHaveBeenCalledWith('user-1');
    });
  });
});

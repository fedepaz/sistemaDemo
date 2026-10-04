// apps/backend/src/shared/baseModule/__tests__/base.repository.spec.ts
import { BaseRepository } from '../base.repository';

class TestRepository extends BaseRepository<any> {
  constructor(prisma: any, model: any) {
    super(prisma, model);
  }

  public enrich(rows: { id: string; deletedByUserId: string | null }[]) {
    return this.enrichDeletedBy(rows);
  }
}

describe('BaseRepository', () => {
  let model: {
    findMany: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    create: jest.Mock;
  };
  let prisma: {
    devAccount: { findMany: jest.Mock };
    user: { findMany: jest.Mock };
  };
  let repo: TestRepository;

  beforeEach(() => {
    model = {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };
    prisma = {
      devAccount: {
        findMany: jest.fn().mockResolvedValue([{ userId: 'dev-1' }]),
      },
      user: { findMany: jest.fn().mockResolvedValue([]) },
    };
    repo = new TestRepository(prisma, model);
  });

  afterEach(() => jest.clearAllMocks());

  describe('enrichDeletedBy', () => {
    it('appends null usernames without querying users when no row has a deleter', async () => {
      const rows = [
        { id: 'a', deletedByUserId: null },
        { id: 'b', deletedByUserId: null },
      ];

      const result = await repo.enrich(rows);

      expect(result).toEqual([
        { id: 'a', deletedByUserId: null, deletedByUsername: null },
        { id: 'b', deletedByUserId: null, deletedByUsername: null },
      ]);
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('batch-resolves usernames for rows with a deleter', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'u1', username: 'ana' }]);
      const rows = [
        { id: 'a', deletedByUserId: 'u1' },
        { id: 'b', deletedByUserId: 'u1' },
        { id: 'c', deletedByUserId: null },
      ];

      const result = await repo.enrich(rows);

      expect(result.map((r) => r.deletedByUsername)).toEqual([
        'ana',
        'ana',
        null,
      ]);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['u1'] } },
        select: { id: true, username: true },
      });
    });

    it('yields null when the deleter no longer exists', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      const result = await repo.enrich([{ id: 'a', deletedByUserId: 'ghost' }]);

      expect(result[0].deletedByUsername).toBeNull();
    });
  });

  describe('recover', () => {
    it('clears deletedAt AND deletedByUserId and restores isActive', async () => {
      model.update.mockResolvedValue({ id: 'a' });

      await repo.recover('a', 'dev-1');

      expect(prisma.devAccount.findMany).toHaveBeenCalledWith({
        select: { userId: true },
      });
      expect(model.update).toHaveBeenCalledWith({
        where: { id: 'a' },
        data: {
          deletedAt: null,
          isActive: true,
          updatedAt: expect.any(Date),
          deletedByUserId: null,
        },
      });
    });

    it('throws ForbiddenException for non-dev requesters', async () => {
      await expect(repo.recover('a', 'user-1')).rejects.toThrow(
        'Only dev accounts can recover records',
      );
      expect(model.update).not.toHaveBeenCalled();
    });
  });
});

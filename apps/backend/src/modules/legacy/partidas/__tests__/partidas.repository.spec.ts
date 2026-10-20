// src/modules/legacy/partidas/__tests__/partidas.repository.spec.ts

import { PartidasRepository } from '../repositories/partidas.repository';
import type { LegacyMysqlService } from '../../../../infra/legacy-mysql/legacy-mysql.service';
import type { PoolConnection } from 'mysql2/promise';

describe('PartidasRepository', () => {
  let legacyDbMock: {
    transaction: jest.Mock;
    query: jest.Mock;
  };
  let connMock: { query: jest.Mock };
  let repository: PartidasRepository;

  const siembraData = {
    partida: 100,
    ano: 2026,
    indice: 1,
    f_siembra: '2026-09-15',
    cg: 5,
    cantidaNroCont: 12,
    g: 2.58,
    c: 626,
    detalle: '',
  };

  beforeEach(() => {
    connMock = { query: jest.fn().mockResolvedValue([]) };
    legacyDbMock = {
      transaction: jest
        .fn()
        .mockImplementation(async (fn: (c: unknown) => Promise<unknown>) =>
          fn(connMock),
        ),
      query: jest.fn(),
    };
    repository = new PartidasRepository(
      legacyDbMock as unknown as LegacyMysqlService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('asignarSiembra', () => {
    it('keys the partidas1 and partidas UPDATEs on partida/ano/indice', async () => {
      await repository.asignarSiembra(siembraData);

      expect(legacyDbMock.transaction).toHaveBeenCalledTimes(1);
      expect(connMock.query).toHaveBeenCalledTimes(2);

      const queryCalls = connMock.query.mock.calls as Array<
        [string, unknown[]]
      >;

      const partidas1Call = queryCalls.find(([sql]) =>
        sql.includes('UPDATE partidas1'),
      );
      expect(partidas1Call).toBeDefined();
      expect(partidas1Call![0]).toContain(
        'WHERE partida = ? AND ano = ? AND indice = ?',
      );
      expect(partidas1Call![1]).toEqual([626, 2.58, 100, 2026, 1]);

      const partidasCall = queryCalls.find(([sql]) =>
        /^\s*UPDATE partidas\s/.test(sql),
      );
      expect(partidasCall).toBeDefined();
      expect(partidasCall![0]).toContain(
        'WHERE partida = ? AND ano = ? AND indice = ?',
      );
      expect(partidasCall![1].slice(-3)).toEqual([100, 2026, 1]);
      expect(partidasCall![1][0]).toBe('2026-09-15');
    });

    it('reuses the provided connection without opening a nested transaction', async () => {
      await repository.asignarSiembra(
        siembraData,
        connMock as unknown as PoolConnection,
      );

      expect(legacyDbMock.transaction).not.toHaveBeenCalled();
      expect(connMock.query).toHaveBeenCalledTimes(2);
    });
  });
});

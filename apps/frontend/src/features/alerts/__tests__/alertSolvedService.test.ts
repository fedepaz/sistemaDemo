import { alertSolvedService } from '../api/alertSolvedService';

jest.mock('@/lib/api/client-fetch', () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from '@/lib/api/client-fetch';
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe('alertSolvedService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('calls correct URL and returns data', async () => {
      const mockData = [
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
      mockClientFetch.mockResolvedValue(mockData as never);

      const result = await alertSolvedService.fetchAll();

      expect(mockClientFetch).toHaveBeenCalledWith('alert-solved', {
        method: 'GET',
      });
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(alertSolvedService.fetchAll()).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('create', () => {
    it('calls correct URL with POST and returns data', async () => {
      const dto = { partidaId: 1045, anio: 2026, indice: 1 };
      const mockCreated = {
        id: 'new-id',
        ...dto,
        userId: 'user-1',
        userName: 'operator1',
        createdAt: '2026-08-01T10:00:00.000Z',
      };
      mockClientFetch.mockResolvedValue(mockCreated as never);

      const result = await alertSolvedService.create(dto);

      expect(mockClientFetch).toHaveBeenCalledWith('alert-solved', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      expect(result).toEqual(mockCreated);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        alertSolvedService.create({ partidaId: 1045, anio: 2026, indice: 1 }),
      ).rejects.toThrow('Network error');
    });
  });
});

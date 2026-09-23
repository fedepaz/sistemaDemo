import { configService } from '../../api/configService';

jest.mock('@/lib/api/client-fetch', () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from '@/lib/api/client-fetch';
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe('configService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('calls correct URL with GET and returns data', async () => {
      const mockData = [
        { codigo: 'Nombre', nombre: 'Vivero Demo' },
        { codigo: 'Direccion', nombre: 'Av. Principal 123' },
      ];
      mockClientFetch.mockResolvedValue(mockData as never);

      const result = await configService.fetchAll();

      expect(mockClientFetch).toHaveBeenCalledWith('l-config', { method: 'GET' });
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(configService.fetchAll()).rejects.toThrow('Network error');
    });
  });
});

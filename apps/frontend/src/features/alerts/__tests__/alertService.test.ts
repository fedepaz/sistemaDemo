import { alertService } from '../api/alertService';

jest.mock('@/lib/api/client-fetch', () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from '@/lib/api/client-fetch';
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe('alertService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSiembraRetrasada', () => {
    it('calls correct URL and returns data', async () => {
      const mockData = [{ partidaId: 1045 }];
      mockClientFetch.mockResolvedValue(mockData as never);

      const result = await alertService.fetchSiembraRetrasada();

      expect(mockClientFetch).toHaveBeenCalledWith('l-alerts/siembra-retrasada', { method: 'GET' });
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(alertService.fetchSiembraRetrasada()).rejects.toThrow('Network error');
    });
  });

  describe('fetchFaltaGerminacion', () => {
    it('calls correct URL and returns data', async () => {
      const mockData = [{ partidaId: 1050 }];
      mockClientFetch.mockResolvedValue(mockData as never);

      const result = await alertService.fetchFaltaGerminacion();

      expect(mockClientFetch).toHaveBeenCalledWith('l-alerts/falta-germinacion', { method: 'GET' });
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(alertService.fetchFaltaGerminacion()).rejects.toThrow('Network error');
    });
  });

  describe('fetchFaltantePlantas', () => {
    it('calls correct URL and returns data', async () => {
      const mockData = [{ partidaId: 1048 }];
      mockClientFetch.mockResolvedValue(mockData as never);

      const result = await alertService.fetchFaltantePlantas();

      expect(mockClientFetch).toHaveBeenCalledWith('l-alerts/faltante-plantas', { method: 'GET' });
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(alertService.fetchFaltantePlantas()).rejects.toThrow('Network error');
    });
  });

  describe('fetchFaltaPreExpedicion', () => {
    it('calls correct URL and returns data', async () => {
      const mockData = [{ partidaId: 1052 }];
      mockClientFetch.mockResolvedValue(mockData as never);

      const result = await alertService.fetchFaltaPreExpedicion();

      expect(mockClientFetch).toHaveBeenCalledWith('l-alerts/falta-pre-expedicion', { method: 'GET' });
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockClientFetch.mockRejectedValue(new Error('Network error'));

      await expect(alertService.fetchFaltaPreExpedicion()).rejects.toThrow('Network error');
    });
  });
});

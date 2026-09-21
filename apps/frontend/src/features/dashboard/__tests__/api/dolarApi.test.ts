import { fetchDolarOficial, fetchDolarBlue, fetchEuro, fetchEstado } from '../../api/dolarApi';

describe('dolarApi', () => {
  const mockFetch = jest.fn();

  beforeAll(() => {
    jest.spyOn(global, 'fetch').mockImplementation(mockFetch);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchDolarOficial', () => {
    it('fetches dolar oficial from correct URL', async () => {
      const mockData = { compra: 1000, venta: 1050, casa: 'oficial' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      });

      const result = await fetchDolarOficial();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dolarapi.com/v1/dolares/oficial',
        { next: { revalidate: 3600 } },
      );
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(fetchDolarOficial()).rejects.toThrow('Network error');
    });
  });

  describe('fetchDolarBlue', () => {
    it('fetches dolar blue from correct URL', async () => {
      const mockData = { compra: 1100, venta: 1150, casa: 'blue' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      });

      const result = await fetchDolarBlue();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dolarapi.com/v1/dolares/blue',
        { next: { revalidate: 3600 } },
      );
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(fetchDolarBlue()).rejects.toThrow('Network error');
    });
  });

  describe('fetchEuro', () => {
    it('fetches euro from correct URL', async () => {
      const mockData = { compra: 1100, venta: 1130, casa: 'euro' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      });

      const result = await fetchEuro();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dolarapi.com/v1/cotizaciones/eur',
        { next: { revalidate: 3600 } },
      );
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(fetchEuro()).rejects.toThrow('Network error');
    });
  });

  describe('fetchEstado', () => {
    it('fetches estado from correct URL', async () => {
      const mockData = { estado: 'ok', aleatorio: 42 };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      });

      const result = await fetchEstado();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dolarapi.com/v1/estado',
        { next: { revalidate: 3600 } },
      );
      expect(result).toEqual(mockData);
    });

    it('throws on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(fetchEstado()).rejects.toThrow('Network error');
    });
  });
});

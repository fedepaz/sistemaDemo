import { dashboardService } from '../../api/dashboardService';

jest.mock('@/features/dashboard/api/dolarApi', () => ({
  fetchDolarOficial: jest.fn(),
  fetchDolarBlue: jest.fn(),
  fetchEuro: jest.fn(),
}));

import {
  fetchDolarOficial,
  fetchDolarBlue,
  fetchEuro,
} from '@/features/dashboard/api/dolarApi';

const mockFetchDolarOficial = fetchDolarOficial as jest.MockedFunction<typeof fetchDolarOficial>;
const mockFetchDolarBlue = fetchDolarBlue as jest.MockedFunction<typeof fetchDolarBlue>;
const mockFetchEuro = fetchEuro as jest.MockedFunction<typeof fetchEuro>;

describe('dashboardService', () => {
  const mockGlobalFetch = jest.fn();

  beforeAll(() => {
    jest.spyOn(global, 'fetch').mockImplementation(mockGlobalFetch);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchKPIs', () => {
    it('fetches weather data and returns climate KPIs', async () => {
      const mockWeather = {
        current: {
          temperature_2m: 25.3,
          relative_humidity_2m: 65.7,
          wind_speed_10m: 12.4,
          rainProb: 30,
        },
      };
      mockGlobalFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockWeather),
      });

      const result = await dashboardService.fetchKPIs();

      expect(mockGlobalFetch).toHaveBeenCalledWith('/api/weather');
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        label: 'Temperatura',
        value: '25.3',
        unit: '°C',
        trend: 'stable',
      });
      expect(result[1]).toEqual({
        label: 'Humedad',
        value: '65.7',
        unit: '%',
        trend: 'stable',
      });
      expect(result[2]).toEqual({
        label: 'Lluvia',
        value: '30',
        unit: '%',
        trend: 'stable',
      });
      expect(result[3]).toEqual({
        label: 'Viento',
        value: '12.4',
        unit: 'km/h',
        trend: 'up',
      });
    });

    it('throws when weather API returns error', async () => {
      mockGlobalFetch.mockResolvedValue({ ok: false });

      await expect(dashboardService.fetchKPIs()).rejects.toThrow(
        'Failed to fetch weather data',
      );
    });
  });

  describe('fetchForecastKPIs', () => {
    it('fetches weather data and returns forecast', async () => {
      const mockWeather = {
        forecast: [
          { date: '2026-09-20', maxTemp: 28, minTemp: 15, rainProb: 20 },
          { date: '2026-09-21', maxTemp: 30, minTemp: 16, rainProb: 10 },
        ],
      };
      mockGlobalFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockWeather),
      });

      const result = await dashboardService.fetchForecastKPIs();

      expect(result).toHaveLength(2);
      expect(result[0].maxTemp).toBe(28);
      expect(result[0].minTemp).toBe(15);
      expect(result[0].date).toBeInstanceOf(Date);
    });

    it('throws when weather API returns error', async () => {
      mockGlobalFetch.mockResolvedValue({ ok: false });

      await expect(dashboardService.fetchForecastKPIs()).rejects.toThrow(
        'Failed to fetch weather data',
      );
    });
  });

  describe('fetchAlerts', () => {
    it('fetches all currency rates and returns formatted data', async () => {
      mockFetchDolarOficial.mockResolvedValue({
        compra: 1000,
        venta: 1050,
      } as never);
      mockFetchDolarBlue.mockResolvedValue({
        compra: 1100,
        venta: 1150,
      } as never);
      mockFetchEuro.mockResolvedValue({
        compra: 1100,
        venta: 1130,
      } as never);

      const result = await dashboardService.fetchAlerts();

      expect(mockFetchDolarOficial).toHaveBeenCalledTimes(1);
      expect(mockFetchDolarBlue).toHaveBeenCalledTimes(1);
      expect(mockFetchEuro).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        { name: 'Dólar Oficial', code: 'USD', buyRate: 1000, sellRate: 1050 },
        { name: 'Dólar Blue', code: 'BLUE', buyRate: 1100, sellRate: 1150 },
        { name: 'Euro', code: 'EUR', buyRate: 1100, sellRate: 1130 },
      ]);
    });

    it('throws when any currency fetch fails', async () => {
      mockFetchDolarOficial.mockRejectedValue(new Error('API error'));

      await expect(dashboardService.fetchAlerts()).rejects.toThrow('API error');
    });
  });
});

import { getWeatherData } from '../../api/openMeteo';

jest.mock('openmeteo', () => ({
  fetchWeatherApi: jest.fn(),
}));

import { fetchWeatherApi } from 'openmeteo';
const mockFetchWeatherApi = fetchWeatherApi as jest.MockedFunction<typeof fetchWeatherApi>;

const createMockResponse = () => ({
  utcOffsetSeconds: jest.fn().mockReturnValue(0),
  current: jest.fn().mockReturnValue({
    time: jest.fn().mockReturnValue(BigInt(1726800000)),
    variables: jest.fn().mockImplementation((index: number) => {
      const values = [25.3, 65, 12.4];
      return { value: jest.fn().mockReturnValue(values[index]) };
    }),
  }),
  daily: jest.fn().mockReturnValue({
    time: jest.fn().mockReturnValue(BigInt(1726800000)),
    interval: jest.fn().mockReturnValue(86400),
    variables: jest.fn().mockImplementation((index: number) => {
      const arrays = [
        [28, 30, 27, 29, 31, 26],
        [15, 16, 14, 15, 17, 13],
        [15, 20, 10, 25, 5, 30],
        [20, 10, 30, 15, 5, 25],
      ];
      return {
        valuesArray: jest.fn().mockReturnValue(arrays[index]),
      };
    }),
  }),
});

describe('openMeteo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches weather data from open-meteo API with correct params', async () => {
    const mockResponse = createMockResponse();
    mockFetchWeatherApi.mockResolvedValue([mockResponse] as never);

    const result = await getWeatherData();

    expect(mockFetchWeatherApi).toHaveBeenCalledWith(
      'https://api.open-meteo.com/v1/forecast',
      expect.objectContaining({
        latitude: -32.8895,
        longitude: -68.8458,
        timezone: 'auto',
        past_days: 0,
        forecast_days: 6,
      }),
    );
    expect(result.current.temperature_2m).toBe(25.3);
    expect(result.current.relative_humidity_2m).toBe(65);
    expect(result.current.wind_speed_10m).toBe(12.4);
    expect(result.forecast).toHaveLength(6);
  });

  it('throws when fetchWeatherApi fails', async () => {
    mockFetchWeatherApi.mockRejectedValue(new Error('API error'));

    await expect(getWeatherData()).rejects.toThrow('API error');
  });
});

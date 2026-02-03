// src/features/dashboard/api/openMeteo.ts

import { fetchWeatherApi } from "openmeteo";

export const getWeatherData = async () => {
  const params = {
    latitude: -32.8895,
    longitude: -68.8458,
    daily: ["temperature_2m_max", "temperature_2m_min", "sunrise"],
    current: ["temperature_2m", "relative_humidity_2m", "wind_speed_10m"],
    timezone: "auto",
    past_days: 2,
    forecast_days: 4,
  };
  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);
  const response = responses[0];

  // Attributes for timezone and location

  const utcOffsetSeconds = response.utcOffsetSeconds();
  const current = response.current()!;

  const daily = response.daily()!;

  // Define Int64 variables so they can be processed accordingly
  const sunrise = daily.variables(2)!;

  const days = Array.from({ length: 6 }, (_, i) => ({
    date: new Date(
      (Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000,
    ),
    maxTemp: daily.variables(0)!.valuesArray()![i],
    minTemp: daily.variables(1)!.valuesArray()![i],
  }));
  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    current: {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      temperature_2m: current.variables(0)!.value(),
      relative_humidity_2m: current.variables(1)!.value(),
      wind_speed_10m: current.variables(2)!.value(),
    },
    daily: {
      time: Array.from(
        {
          length:
            (Number(daily.timeEnd()) - Number(daily.time())) / daily.interval(),
        },
        (_, i) =>
          new Date(
            (Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) *
              1000,
          ),
      ),
      // Map Int64 values to according structure
      sunrise: [...Array(sunrise.valuesInt64Length())].map(
        (_, i) =>
          new Date((Number(sunrise.valuesInt64(i)) + utcOffsetSeconds) * 1000),
      ),
    },
    days,
  };

  return {
    current: {
      time: weatherData.current.time,
      temperature_2m: weatherData.current.temperature_2m,
      relative_humidity_2m: weatherData.current.relative_humidity_2m,
      sunrise: weatherData.daily.sunrise[0],
      wind_speed_10m: weatherData.current.wind_speed_10m,
    },
    forecast: days,
  };
};

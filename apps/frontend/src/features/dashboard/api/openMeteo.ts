// src/features/dashboard/api/openMeteo.ts

import { fetchWeatherApi } from "openmeteo";

export const getWeatherData = async () => {
  const params = {
    latitude: -32.8895,
    longitude: -68.8458,
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "precipitation_probability_max",
    ],
    current: ["temperature_2m", "relative_humidity_2m", "wind_speed_10m"],
    timezone: "auto",
    past_days: 0,
    forecast_days: 6,
  };
  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);
  const response = responses[0];

  const utcOffsetSeconds = response.utcOffsetSeconds();
  const current = response.current()!;
  const daily = response.daily()!;

  const precipitationProbability = daily.variables(3)!;

  const days = Array.from({ length: 6 }, (_, i) => ({
    date: new Date(
      (Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000,
    ),
    maxTemp: daily.variables(0)!.valuesArray()![i],
    minTemp: daily.variables(1)!.valuesArray()![i],
    rainProb: daily.variables(3)!.valuesArray()![i],
  }));

  return {
    current: {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      temperature_2m: current.variables(0)!.value(),
      relative_humidity_2m: current.variables(1)!.value(),
      wind_speed_10m: current.variables(2)!.value(),
      rainProb: precipitationProbability.valuesArray()![0], // Today's probability
    },
    forecast: days,
  };
};

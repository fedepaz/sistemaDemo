// src/features/dashboard/api/dashboardService.ts

import { ClimateKpiInterface, CurrencyRateInterface } from "../types";
import { fetchDolarBlue, fetchDolarOficial, fetchEuro } from "./dolarApi";

async function getWeatherData() {
  const response = await fetch("/api/weather");
  if (!response.ok) throw new Error("Failed to fetch weather data");
  return response.json();
}

export const dashboardService = {
  async fetchKPIs(): Promise<ClimateKpiInterface[]> {
    const weather = await getWeatherData();

    return [
      {
        label: "Temperatura",
        value: weather.current.temperature_2m.toFixed(1),
        unit: "°C",
        trend: "stable",
      },
      {
        label: "Humedad",
        value: weather.current.relative_humidity_2m.toFixed(1),
        unit: "%",
        trend: "stable",
      },
      {
        label: "Lluvia",
        value: Math.round(weather.current.rainProb).toString(),
        unit: "%",
        trend: "stable",
      },
      {
        label: "Viento",
        value: weather.current.wind_speed_10m.toFixed(1),
        unit: "km/h",
        trend: "up",
      },
    ];
  },

  async fetchForecastKPIs(): Promise<
    { date: Date; maxTemp: number; minTemp: number }[]
  > {
    const weather = await getWeatherData();

return weather.forecast.map((day: { date: string; maxTemp: number; minTemp: number; rainProb: number }) => ({

    date: new Date(day.date), 
      maxTemp: day.maxTemp,
      minTemp: day.minTemp,
    }));
  },
  async fetchAlerts(): Promise<CurrencyRateInterface[]> {
    const [oficial, blue, euro] = await Promise.all([
      fetchDolarOficial(),
      fetchDolarBlue(),
      fetchEuro(),
    ]);

    return [
      {
        name: "Dólar Oficial",
        code: "USD",
        buyRate: oficial.compra,
        sellRate: oficial.venta,
      },
      {
        name: "Dólar Blue",
        code: "BLUE",
        buyRate: blue.compra,
        sellRate: blue.venta,
      },
      {
        name: "Euro",
        code: "EUR",
        buyRate: euro.compra,
        sellRate: euro.venta,
      },
    ];
  },
};

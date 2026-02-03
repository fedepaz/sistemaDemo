// src/features/dashboard/api/dashboardService.ts

import { ClimateKpiInterface, CurrencyRateInterface } from "../types";
import { fetchDolarBlue, fetchDolarOficial, fetchEuro } from "./dolarApi";
import { getWeatherData } from "./openMeteo";

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
        value: weather.current.relative_humidity_2m.toString(),
        unit: "%",
        trend: "stable",
      },
      {
        label: "Amanecer",
        value: weather.current.sunrise.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        unit: "h",
        trend: "stable",
        trendValue: "0",
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

    return weather.forecast.map((day) => ({
      date: day.date,
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

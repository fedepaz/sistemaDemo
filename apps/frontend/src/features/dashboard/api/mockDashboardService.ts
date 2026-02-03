//src/features/dashboard/api/mockDashboardService.ts

import {
  ClimateKpiInterface,
  CurrencyRateInterface,
  RecentActivityInterface,
} from "../types";

const generateKpi = (): ClimateKpiInterface[] => {
  return [
    {
      label: "Temperatura",
      value: "24.5",
      unit: "°C",

      trend: "up",
      trendValue: "+1.2°C",
    },
    {
      label: "Humedad",
      value: "68",
      unit: "%",

      trend: "stable",
      trendValue: "0%",
    },
    {
      label: "Luz Solar",
      value: "850",
      unit: "lux",

      trend: "down",
      trendValue: "-120 lux",
    },
    {
      label: "Viento",
      value: "12",
      unit: "km/h",

      trend: "up",
      trendValue: "+3 km/h",
    },
  ];
};

const generateAlert = (): CurrencyRateInterface[] => {
  return [
    {
      name: "Dólar Oficial",
      code: "USD",
      buyRate: 1055.0,
      sellRate: 1095.0,
      variation: 5.0,
      variationPercent: 0.46,
    },
    {
      name: "Dólar Blue",
      code: "BLUE",
      buyRate: 1205.0,
      sellRate: 1225.0,
      variation: -10.0,
      variationPercent: -0.81,
    },
    {
      name: "Euro",
      code: "EUR",
      buyRate: 1145.0,
      sellRate: 1185.0,
      variation: 8.0,
      variationPercent: 0.68,
    },
  ];
};

const generateRecentActivity = (count: number): RecentActivityInterface[] => {
  const actions = [
    "Planta #123 está agotada",
    "Pedido #456 ha sido realizado",
    "Nuevo cliente registrado",
    "Nueva factura recibida",
  ];

  const users = [
    "Juan Fernando Quintero",
    "Gabriela Sabatini",
    "Luciana Aymar",
    "Rodrigo Mora",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `activity-${i + 1}`,
    action: actions[i % actions.length],
    user: users[i % users.length],
    timestamp: new Date(),
  }));
};
// Replace with your actual API call
// For example, you could fetch data from an API endpoint
// for now we'll just return mock data

const dashboardData = generateKpi();
const alertsData = generateAlert();
const recentActivityData = generateRecentActivity(4);

export const mockDashboardService = {
  async fetchKPIs(): Promise<ClimateKpiInterface[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000)); // Replace API response with KPIs
    // Simulate receiving KPIs from the API
    return dashboardData;
  },

  async fetchAlerts(): Promise<CurrencyRateInterface[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000)); // Replace API response with alerts
    // Simulate receiving alerts from the API
    return alertsData;
  },

  async fetchRecentActivity(): Promise<RecentActivityInterface[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000)); // Replace API response with recent activity
    // Simulate receiving recent activity from the API
    return recentActivityData;
  },
};

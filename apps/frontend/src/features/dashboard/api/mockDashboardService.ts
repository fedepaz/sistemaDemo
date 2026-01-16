//src/features/dashboard/api/mockDashboardService.ts

import {
  DashboardKpiInterface,
  AlertInterface,
  RecentActivityInterface,
} from "../types";

const generateKpi = (): DashboardKpiInterface => {
  return {
    totalPlants: 1500,
    activePlants: 500,
    totalClients: 200,
    activeClients: 200,
    openInvoices: 100,
    monthlyRevenue: 100000,
    pendingOrders: 50,
    activeUsers: 25,
  };
};

const generateAlert = (count: number): AlertInterface[] => {
  const types: AlertInterface["type"][] = ["critical", "warning", "info"];
  const messages = [
    "Limited stock",
    "Order received",
    "New client",
    "Invoice received",
    "System down",
    "User deleted",
    "Plant out of stock",
  ];

  const locations = [
    // Provinces of Argentina
    "Buenos Aires",
    "Catamarca",
    "Chaco",
    "Chubut",
    "Corrientes",
    "Entre Rios",
    "Formosa",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `alert-${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    messageKey: messages[Math.floor(Math.random() * messages.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    timestamp: new Date(),
  }));
};

const generateRecentActivity = (count: number): RecentActivityInterface[] => {
  const actions = [
    "Plant #123 is out of stock",
    "Order #456 has been placed",
    "New client registered",
    "New invoice received",
  ];

  const users = [
    "John Doe",
    "Jane Smith",
    "Alice Johnson",
    "Bob Lee",
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
const alertsData = generateAlert(3);
const recentActivityData = generateRecentActivity(4);

export const mockDashboardService = {
  async fetchKPIs(): Promise<DashboardKpiInterface> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000)); // Replace API response with KPIs
    // Simulate receiving KPIs from the API
    return dashboardData;
  },

  async fetchAlerts(): Promise<AlertInterface[]> {
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

//src/features/dashboard/types.ts

interface DashboardKpiInterface {
  totalPlants: number;
  activePlants: number;
  totalClients: number;
  activeClients: number;
  openInvoices: number;
  monthlyRevenue: number;
  pendingOrders: number;
  activeUsers: number;
}

interface AlertInterface {
  id: string;
  type: "critical" | "warning" | "info";
  messageKey: string;
  location: string;
  timestamp: Date;
}

interface RecentActivityInterface {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
}

export type { DashboardKpiInterface, AlertInterface, RecentActivityInterface };

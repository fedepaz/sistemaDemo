//src/features/dashboard/types.ts

interface ClimateKpiInterface {
  label: string;
  value: string;
  unit: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

interface CurrencyRateInterface {
  name: string;
  code: string;
  buyRate: number;
  sellRate: number;
}

interface RecentActivityInterface {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
}

export type {
  ClimateKpiInterface,
  CurrencyRateInterface,
  RecentActivityInterface,
};

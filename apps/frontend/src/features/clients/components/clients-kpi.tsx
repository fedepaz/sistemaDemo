//src/features/clients/components/clients-kpi.tsx
"use client";

import { KPICard } from "@/components/data-display/kpi-card";
import { Building2, TrendingUp, UserCheck, Users } from "lucide-react";

import { useClients } from "../hooks/hooks";

function ClientsKPI() {
  const { data: clients = [] } = useClients();
  const totalClients = clients.length;
  const activeClients = clients.filter(
    (client) => client.status === "active",
  ).length;
  const totalRevenue = clients.reduce(
    (acc, client) => acc + client.totalRevenue,
    0,
  );
  const prospects = clients.filter(
    (client) => client.status === "prospect",
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total de Clientes"
        value={totalClients.toLocaleString()}
        description="en la base de datos"
        icon={Building2}
        trend={{ value: 6.5, label: "desde el mes pasado", isPositive: true }}
      />
      <KPICard
        title="Clientes Activos"
        value={activeClients.toLocaleString()}
        description={`${prospects} prospectos`}
        icon={UserCheck}
      />
      <KPICard
        title="Ingresos Totales"
        value={`€${(totalRevenue / 1000).toFixed(0)}k`}
        description="de todos los clientes"
        icon={TrendingUp}
        trend={{ value: 18.2, label: "desde el mes pasado", isPositive: true }}
      />
      <KPICard
        title="Nuevos Prospectos"
        value={prospects}
        description="clientes potenciales"
        icon={Users}
      />
    </div>
  );
}

export default ClientsKPI;

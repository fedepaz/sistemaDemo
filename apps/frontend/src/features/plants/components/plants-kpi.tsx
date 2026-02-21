//src/features/plants/components/plants-kpi.tsx
"use client";

import { KPICard } from "@/components/data-display/kpi-card";
import { usePlants } from "../hooks/hooks";
import { Package, CheckCircle, AlertCircle, Calendar } from "lucide-react";

function PlantKPIs() {
  const { data: mockPlants = [] } = usePlants();
  const totalPlants = mockPlants.length;
  const healthyPlants = mockPlants.filter((p) => p.status === "healthy").length;
  const criticalPlants = mockPlants.filter(
    (p) => p.status === "critical",
  ).length;
  const readyForHarvest = mockPlants.filter(
    (p) => p.growthStage === "Fruiting" || p.growthStage === "Mature",
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total de Entidades"
        value={totalPlants}
        description="activas en el sistema"
        icon={Package}
        trend={{ value: 12.5, label: "desde el mes pasado", isPositive: true }}
      />
      <KPICard
        title="Entidades Operativas"
        value={healthyPlants}
        description={`${((healthyPlants / totalPlants) * 100).toFixed(0)}% del total`}
        icon={CheckCircle}
        trend={{
          value: 5.2,
          label: "desde la semana pasada",
          isPositive: true,
        }}
      />
      <KPICard
        title="Entidades en Alerta"
        value={criticalPlants}
        description="requieren atención inmediata"
        icon={AlertCircle}
      />
      <KPICard
        title="Próximos a Vencer"
        value={readyForHarvest}
        description="en etapa final o madurez"
        icon={Calendar}
      />
    </div>
  );
}

export default PlantKPIs;

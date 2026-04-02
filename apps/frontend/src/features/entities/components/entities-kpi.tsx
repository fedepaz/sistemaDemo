// src/features/entities/components/entities-kpi.tsx
"use client";

import { KPICard } from "@/components/data-display/kpi-card";
import { useEntities } from "../hooks/useEntities";
import { Package, ShieldCheck, Lock, PlayCircle } from "lucide-react";

export function EntitiesKPIs() {
  const { data: entities = [] } = useEntities();
  const totalEntities = entities.length;
  const crudEntities = entities.filter(
    (e) => e.permissionType === "CRUD",
  ).length;
  const readOnlyEntities = entities.filter(
    (e) => e.permissionType === "READ_ONLY",
  ).length;
  const processEntities = entities.filter(
    (e) => e.permissionType === "PROCESS",
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Entidades"
        value={totalEntities}
        description="Tablas registradas"
        icon={Package}
      />
      <KPICard
        title="CRUD"
        value={crudEntities}
        description="Acceso completo"
        icon={ShieldCheck}
      />
      <KPICard
        title="Lectura"
        value={readOnlyEntities}
        description="Solo lectura"
        icon={Lock}
      />
      <KPICard
        title="Procesos"
        value={processEntities}
        description="Ejecutables"
        icon={PlayCircle}
      />
    </div>
  );
}

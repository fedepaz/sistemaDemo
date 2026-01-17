//src/features/users/components/user-kpi.tsx
"use client";

import { KPICard } from "@/components/data-display/kpi-card";
import { Users, UserCheck, UserX, Shield } from "lucide-react";

import { useUsers } from "../hooks/hooks";

function UserKPIs() {
  const { data: mockUsers = [] } = useUsers();
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter((u) => u.status === "active").length;
  const inactiveUsers = mockUsers.filter((u) => u.status === "inactive").length;
  const adminUsers = mockUsers.filter((u) => u.role === "admin").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total de Usuarios"
        value={totalUsers}
        description="en el sistema"
        icon={Users}
        trend={{ value: 5.0, label: "desde el mes pasado", isPositive: true }}
      />
      <KPICard title="Usuarios Activos" value={activeUsers} icon={UserCheck} />
      <KPICard
        title="Usuarios Inactivos"
        value={inactiveUsers}
        description="Necesitan atención"
        icon={UserX}
      />
      <KPICard
        title="Administradores"
        value={adminUsers}
        description="Acceso total"
        icon={Shield}
      />
    </div>
  );
}

export default UserKPIs;

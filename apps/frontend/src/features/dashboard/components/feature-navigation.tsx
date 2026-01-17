// src/features/dashboard/components/feature-navigation.tsx

import { FeatureCard } from "@/components/data-display/feature-card";
import {
  Sprout,
  Users,
  FileText,
  ShoppingCart,
  UserCircle,
} from "lucide-react";
import { useDashboardKPIs } from "../hooks/hooks";

function FeatureNavigation() {
  const { data: kpis } = useDashboardKPIs();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <FeatureCard
        title="Plantas"
        description="Gestionar inventario de plantas"
        icon={Sprout}
        href="/plants"
        stats={{
          label: "Plantas activas",
          value: kpis.activePlants.toLocaleString(),
        }}
      />
      <FeatureCard
        title="Clientes"
        description="Gestionar clientes"
        icon={Users}
        href="/clients"
        stats={{ label: "Clientes activos", value: kpis.activeClients }}
      />
      <FeatureCard
        title="Facturas"
        description="Gestionar facturas"
        icon={FileText}
        href="/invoices"
        stats={{ label: "Facturas pendientes", value: kpis.openInvoices }}
      />
      <FeatureCard
        title="Órdenes de compra"
        description="Gestionar órdenes de compra"
        icon={ShoppingCart}
        href="/purchase-orders"
        stats={{ label: "Pedidos pendientes", value: kpis.pendingOrders }}
      />
      <FeatureCard
        title="Usuarios"
        description="Gestionar usuarios"
        icon={UserCircle}
        href="/users"
        stats={{ label: "Usuarios activos", value: kpis.activeUsers }}
      />
    </div>
  );
}

export default FeatureNavigation;

//src/features/purchase-orders/components/purchase-orders-kpi.tsx
"use client";

import { KPICard } from "@/components/data-display/kpi-card";
import { usePurchaseOrders } from "../hooks/hooks";
import { ShoppingCart, Package, Clock, CheckCircle2 } from "lucide-react";

function PurchaseOrderKPIs() {
  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const totalOrders = purchaseOrders.length;
  const totalSpend = purchaseOrders.reduce(
    (sum, po) => sum + po.totalAmount,
    0,
  );
  const pendingOrders = purchaseOrders.filter(
    (po) => po.status === "pending",
  ).length;
  const receivedOrders = purchaseOrders.filter(
    (po) => po.status === "received",
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total de Pedidos"
        value={totalOrders}
        description="de todos los tiempos"
        icon={ShoppingCart}
        trend={{ value: 10.5, label: "desde el mes pasado", isPositive: true }}
      />
      <KPICard
        title="Gasto Total"
        value={`€${(totalSpend / 1000).toFixed(1)}k`}
        description="de todas las órdenes"
        icon={Package}
        trend={{ value: 12.8, label: "desde el mes pasado", isPositive: false }}
      />
      <KPICard
        title="Pedidos Pendientes"
        value={pendingOrders}
        description="Esperando revisión"
        icon={Clock}
      />
      <KPICard
        title="Pedidos Completados"
        value={receivedOrders}
        description="Órdenes de compra recibidas y cerradas"
        icon={CheckCircle2}
      />
    </div>
  );
}

export default PurchaseOrderKPIs;

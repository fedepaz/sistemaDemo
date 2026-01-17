//src/features/invoices/components/invoices-kpi.tsx
"use client";

import { KPICard } from "@/components/data-display/kpi-card";
import { FileText, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { useInvoices } from "../hooks/hooks";

function InvoiceKPIs() {
  const { data: mockInvoices = [] } = useInvoices();
  const totalInvoices = mockInvoices.length;
  const totalRevenue = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = mockInvoices.filter(
    (inv) => inv.status === "paid",
  ).length;
  const overdueInvoices = mockInvoices.filter(
    (inv) => inv.status === "overdue",
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Facturas Totales"
        value={totalInvoices}
        description="de todos los tiempos"
        icon={FileText}
        trend={{ value: 8.3, label: "desde el mes pasado", isPositive: true }}
      />
      <KPICard
        title="Ingresos Totales"
        value={`€${(totalRevenue / 1000).toFixed(1)}k`}
        description="de todas las facturas"
        icon={DollarSign}
        trend={{ value: 15.2, label: "desde el mes pasado", isPositive: true }}
      />
      <KPICard
        title="Facturas Pagadas"
        value={paidInvoices}
        description={`${totalInvoices - paidInvoices} pendientes`}
        icon={CheckCircle2}
      />
      <KPICard
        title="Facturas Pendientes"
        value={overdueInvoices}
        description="requieren seguimiento"
        icon={Clock}
      />
    </div>
  );
}

export default InvoiceKPIs;

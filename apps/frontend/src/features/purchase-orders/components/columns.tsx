import { Row, Table, type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SortableHeader,
  StatusBadge,
} from "@/components/data-display/data-table";
import { PurchaseOrder } from "../types";

interface CellProps {
  row?: Row<PurchaseOrder>;
  table?: Table<PurchaseOrder>;
}

function CellComponent({ row, table }: CellProps) {
  if (table) {
    return (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    );
  }
  if (row) {
    return (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    );
  }
  if (!row || !table) {
    return null;
  }
}

interface HeaderProps {
  column: ColumnDef<PurchaseOrder>;
  translationKey: string;
}

function HeaderComponent({ column, translationKey }: HeaderProps) {
  return <SortableHeader column={column}>{translationKey}</SortableHeader>;
}

function CellTotalAmountComponent({ row }: CellProps) {
  if (!row) return null;
  const amount = Number.parseFloat(row.getValue("totalAmount"));
  const formatted = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
  return <div className="font-medium">{formatted}</div>;
}

function CellBadgeComponent({ row }: CellProps) {
  if (!row) return null;
  const status = row.getValue("status") as string;
  const statusMap = {
    delivered: "healthy",
    approved: "info",
    pending: "warning",
    cancelled: "critical",
  } as const;
  const statusText =
    status === "delivered"
      ? "Entregado"
      : status === "approved"
        ? "Aprobado"
        : status === "pending"
          ? "Pendiente"
          : "Cancelado";
  return (
    <StatusBadge status={statusMap[status as keyof typeof statusMap]}>
      {statusText}
    </StatusBadge>
  );
}
export const purchaseOrderColumns: ColumnDef<PurchaseOrder>[] = [
  {
    id: "select",
    header: ({ table }) => {
      return <CellComponent table={table} />;
    },
    cell: ({ row }) => {
      return <CellComponent row={row} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderNumber",
    header: ({ column }) => {
      return (
        <HeaderComponent column={column} translationKey="Número de Pedido" />
      );
    },
  },
  {
    accessorKey: "supplier",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Proveedor" />;
    },
  },
  {
    accessorKey: "items",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Artículos" />;
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Importe Total" />;
    },
    cell: ({ row }) => {
      return <CellTotalAmountComponent row={row} />;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Estado" />;
    },
    cell: ({ row }) => {
      return <CellBadgeComponent row={row} />;
    },
  },
  {
    accessorKey: "orderDate",
    header: ({ column }) => {
      return (
        <HeaderComponent column={column} translationKey="Fecha de Pedido" />
      );
    },
  },
  {
    accessorKey: "deliveryDate",
    header: ({ column }) => {
      return (
        <HeaderComponent column={column} translationKey="Fecha de Entrega" />
      );
    },
  },
];

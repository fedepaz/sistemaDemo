//src/features/invoices/components/columns.tsx

import {
  SortableHeader,
  StatusBadge,
} from "@/components/data-display/data-table";

import { ColumnDef, Row, Table } from "@tanstack/react-table";
import { Invoice } from "../types";
import { Checkbox } from "@/components/ui/checkbox";

interface CellProps {
  row?: Row<Invoice>;
  table?: Table<Invoice>;
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
  return null;
}

interface HeaderProps {
  column: ColumnDef<Invoice>;
  translationKey: string;
}

function HeaderComponent({ column, translationKey }: HeaderProps) {
  return <SortableHeader column={column}>{translationKey}</SortableHeader>;
}

function CellBadgeComponent({ row }: CellProps) {
  if (!row) return null;
  const status = row.getValue("status") as string;
  const statusMap = {
    draft: "info",
    sent: "healthy",
    paid: "active",
    overdue: "pending",
    cancelled: "inactive",
  } as const;
  const statusText =
    status === "draft"
      ? "Borrador"
      : status === "sent"
        ? "Enviada"
        : status === "paid"
          ? "Pagada"
          : status === "overdue"
            ? "Vencida"
            : "Cancelada";
  return (
    <StatusBadge status={statusMap[status as keyof typeof statusMap]}>
      {statusText}
    </StatusBadge>
  );
}

function CellAmountComponent({ row }: CellProps) {
  if (!row) return null;
  const amount = Number.parseFloat(row.getValue("amount"));
  const formatted = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
  return <div className="font-medium">{formatted}</div>;
}

const invoiceColumns: ColumnDef<Invoice>[] = [
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
    accessorKey: "invoiceNumber",
    header: ({ column }) => {
      return (
        <HeaderComponent column={column} translationKey="Número de Factura" />
      );
    },
  },
  {
    accessorKey: "client",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Cliente" />;
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return <HeaderComponent column={column} translationKey="Importe" />;
    },
    cell: ({ row }) => {
      return <CellAmountComponent row={row} />;
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
    accessorKey: "createdDate",
    header: ({ column }) => {
      return (
        <HeaderComponent column={column} translationKey="Fecha de Creación" />
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <HeaderComponent
          column={column}
          translationKey="Fecha de Vencimiento"
        />
      );
    },
  },
];

export { invoiceColumns };

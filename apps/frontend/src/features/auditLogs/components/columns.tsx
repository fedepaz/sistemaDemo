import { Row, Table, type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { SortableHeader } from "@/components/data-display/data-table";
import { AuditLogDto } from "@vivero/shared";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Database,
  Globe,
  Smartphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CellProps {
  row?: Row<AuditLogDto>;
  table?: Table<AuditLogDto>;
}

function CellComponent({ row, table }: CellProps) {
  if (row) {
    return (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    );
  }
  if (table) {
    return (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    );
  }
  if (!row || !table) return null;
}

// Helper para formatear cambios
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatChanges = (changes: Record<string, any> | null): string => {
  if (!changes || Object.keys(changes).length === 0)
    return "Sin cambios específicos";

  const keys = Object.keys(changes).slice(0, 2); // Mostrar solo los primeros 2 cambios
  const summary = keys
    .map((key) => {
      const value = changes[key];
      if (typeof value === "object" && value?.after !== undefined) {
        return `${key}: ${value.before} → ${value.after}`;
      }
      return `${key}: ${value}`;
    })
    .join(", ");

  return keys.length < Object.keys(changes).length ? `${summary}...` : summary;
};

// Helper para icono de acción
const getActionIcon = (action: string) => {
  switch (action) {
    case "CREATE":
      return <Plus className="h-4 w-4 text-green-500" />;
    case "UPDATE":
      return <Pencil className="h-4 w-4 text-blue-500" />;
    case "DELETE":
      return <Trash2 className="h-4 w-4 text-red-500" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
};

// Helper para entidad legible
const getEntityDisplay = (entityType: string, entityId: string) => {
  const entityMap: Record<string, string> = {
    USER: "Usuario",
    TRANSACTION: "Transacción",
    INVENTORY: "Inventario",
    SUPPLIER: "Proveedor",
    CUSTOMER: "Cliente",
    PRODUCT: "Producto",
    CATEGORY: "Categoría",
  };

  return `${entityMap[entityType] || entityType}: ${entityId.slice(0, 8)}...`;
};

export const auditLogColumns: ColumnDef<AuditLogDto>[] = [
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
    accessorKey: "action",
    header: ({ column }) => {
      return <SortableHeader column={column}>Acción</SortableHeader>;
    },
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      const variantMap: Record<
        string,
        "default" | "destructive" | "secondary"
      > = {
        CREATE: "default",
        UPDATE: "secondary",
        DELETE: "destructive",
      };

      return (
        <Badge
          variant={variantMap[action] || "outline"}
          className="flex items-center space-x-1"
        >
          {getActionIcon(action)}
          <span>{action}</span>
        </Badge>
      );
    },
  },
  {
    id: "entityType",
    header: ({ column }) => (
      <SortableHeader column={column}>Entidad</SortableHeader>
    ),
    cell: ({ row }) => {
      const entityType = row.original.entityType;
      const entityId = row.original.entityId;

      return (
        <div className="flex items-center space-x-2 min-w-[160px]">
          <Database className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate max-w-[140px]">
            {getEntityDisplay(entityType, entityId)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "changes",
    header: ({ column }) => (
      <SortableHeader column={column}>Cambios</SortableHeader>
    ),
    cell: ({ row }) => {
      const changes = row.original.changes;
      return (
        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
          {formatChanges(changes)}
        </div>
      );
    },
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <SortableHeader column={column}>Fecha</SortableHeader>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("timestamp"));
      return (
        <div className="flex flex-col text-sm min-w-[140px]">
          <span className="font-medium">
            {date.toLocaleDateString("es-ES")}
          </span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "ipAddress",
    header: ({ column }) => <SortableHeader column={column}>IP</SortableHeader>,
    cell: ({ row }) => {
      const ip = row.original.ipAddress;
      return (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground min-w-[120px]">
          <Globe className="h-3 w-3" />
          <span className="truncate max-w-[100px]">{ip || "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "userAgent",
    header: ({ column }) => (
      <SortableHeader column={column}>Dispositivo</SortableHeader>
    ),
    cell: ({ row }) => {
      const ua = row.original.userAgent || "";
      const isMobile = /mobile|android|iphone|ipad/i.test(ua.toLowerCase());

      return (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground min-w-[140px]">
          {isMobile ? (
            <Smartphone className="h-3 w-3 text-blue-500" />
          ) : (
            <Globe className="h-3 w-3 text-muted-foreground" />
          )}
          <span className="truncate max-w-[120px]">
            {isMobile ? "Móvil" : "Escritorio"}
          </span>
        </div>
      );
    },
  },
];

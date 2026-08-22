import { type ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-display/data-table";
import { AuditLogDto } from "@vivero/shared";
import type { ExportColumn } from "@/lib/export/types";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Globe,
  Smartphone,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatShortDate } from "@/lib/date-utils";
import { isMobileDevice } from "@/lib/utils";

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
      return <Plus className="h-4 w-4 text-primary" aria-hidden="true" />;
    case "UPDATE":
      return <Pencil className="h-4 w-4 text-secondary" aria-hidden="true" />;
    case "DELETE":
      return <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />;
    case "LOGIN":
      return <LogIn className="h-4 w-4 text-primary" aria-hidden="true" />;
    case "LOGOUT":
      return <LogOut className="h-4 w-4 text-muted-foreground" aria-hidden="true" />;
    case "ACCESS":
      return <ShieldCheck className="h-4 w-4 text-info" aria-hidden="true" />;
    case "LOGIN_FAILED":
      return <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />;
    case "PASSWORD_CHANGE":
      return <Lock className="h-4 w-4 text-secondary" aria-hidden="true" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />;
  }
};

export const auditLogColumns: ColumnDef<AuditLogDto>[] = [
  {
    accessorKey: "action",
    header: ({ column }) => {
      return <SortableHeader column={column}>Acción</SortableHeader>;
    },
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      const variantMap: Record<
        string,
        "default" | "destructive" | "secondary" | "outline"
      > = {
        CREATE: "default",
        UPDATE: "secondary",
        DELETE: "destructive",
        LOGIN: "default",
        LOGOUT: "outline",
        ACCESS: "outline",
        LOGIN_FAILED: "destructive",
        PASSWORD_CHANGE: "secondary",
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
    accessorKey: "user.username",
    header: ({ column }) => (
      <SortableHeader column={column}>Usuario</SortableHeader>
    ),
    cell: ({ row }) => {
      const user =
        row.original.user != null ? row.original.user.username : "No user";
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2 min-w-[160px]">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium truncate max-w-[140px]">
                {user}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-popover border-border shadow-xl">
            <p className="text-xs">{user}</p>
          </TooltipContent>
        </Tooltip>
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
          <span className="font-medium">{formatShortDate(date)}</span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString("es-AR", {
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
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground min-w-[120px]">
              <Globe className="h-3 w-3" aria-hidden="true" />
              <span className="truncate max-w-[100px]">{ip || "N/A"}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-popover border-border shadow-xl">
            <p className="text-xs">{ip || "Sin dirección IP registrada"}</p>
          </TooltipContent>
        </Tooltip>
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
      const isMobile = isMobileDevice(ua);

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground min-w-[140px]">
              {isMobile ? (
                <Smartphone className="h-3 w-3 text-info" aria-hidden="true" />
              ) : (
                <Globe className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
              )}
              <span className="truncate max-w-[120px]">
                {isMobile ? "Móvil" : "Escritorio"}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-popover border-border shadow-xl">
            <p className="text-xs">{ua || "User agent no disponible"}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
];

export const auditLogExportColumns: ExportColumn<AuditLogDto>[] = [
  {
    accessorKey: "action",
    exportHeader: "Acción",
    pdfWidth: "12%",
  },
  {
    accessorKey: "user",
    exportHeader: "Usuario",
    exportValue: (_, row) => row.user?.username || "N/A",
    pdfWidth: "15%",
  },
  {
    accessorKey: "changes",
    exportHeader: "Cambios",
    exportValue: (_, row) => formatChanges(row.changes),
    pdfWidth: "30%",
  },
  {
    accessorKey: "timestamp",
    exportHeader: "Fecha",
    exportValue: (value) => new Date(value as Date).toLocaleDateString("es-AR"),
    pdfWidth: "15%",
  },
  {
    accessorKey: "ipAddress",
    exportHeader: "IP",
    exportValue: (value) => (value as string) || "N/A",
    pdfWidth: "12%",
  },
  {
    accessorKey: "userAgent",
    exportHeader: "Dispositivo",
    exportValue: (value) => {
      const ua = (value as string) || "";
      return /mobile|android|iphone|ipad/i.test(ua.toLowerCase()) ? "Móvil" : "Escritorio";
    },
    pdfWidth: "16%",
  },
];

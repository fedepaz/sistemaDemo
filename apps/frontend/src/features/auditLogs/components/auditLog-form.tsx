// src/features/auditLogs/components/auditLog-form.tsx

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuditLogDto } from "@vivero/shared";
import {
  User,
  Database,
  Clock,
  History,
  Smartphone,
  Monitor,
  Hash,
  Globe,
  Settings,
} from "lucide-react";

interface AuditLogFormProps {
  selectedAuditLog: AuditLogDto;
}

export function AuditLogForm({ selectedAuditLog }: AuditLogFormProps) {
  const isMobile = selectedAuditLog.userAgent?.includes("Mobile");

  return (
    <div className="space-y-6 pb-8">
      {/* Información del Usuario */}
      {selectedAuditLog.user ? (
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <User className="h-4 w-4 text-primary" />
              Responsable
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Nombre completo
              </span>
              <p className="text-sm font-medium">
                {selectedAuditLog.user.firstName}{" "}
                {selectedAuditLog.user.lastName}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Email
              </span>
              <p className="text-sm font-medium truncate">
                {selectedAuditLog.user.email}
              </p>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                ID Interno
              </span>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-[10px] font-mono bg-muted/50 border border-border/50 px-2 py-1 rounded select-all">
                  {selectedAuditLog.userId}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Entidad Afectada */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Database className="h-4 w-4 text-primary" />
            Entidad Afectada
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Tipo de recurso
            </span>
            <div className="pt-1">
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-widest text-[10px]"
              >
                {selectedAuditLog.entityType}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Identificador (UUID)
            </span>
            <div className="flex items-center gap-2 pt-1">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <code className="text-[10px] font-mono bg-muted/50 border border-border/50 px-2 py-1 rounded select-all">
                {selectedAuditLog.entityId}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registro de Cambios */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <History className="h-4 w-4 text-primary" />
            Registro de Cambios
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative rounded-lg border bg-slate-950 p-4 font-mono text-xs overflow-hidden">
            <div className="absolute right-2 top-2">
              <Settings className="h-3.5 w-3.5 text-slate-500 animate-spin-slow" />
            </div>
            <pre className="text-slate-300 overflow-auto max-h-80 custom-scrollbar">
              {JSON.stringify(selectedAuditLog.changes, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Metadatos Técnicos */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Clock className="h-4 w-4 text-primary" />
            Información Técnica
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Timestamp
              </span>
            </div>
            <p className="text-sm font-medium">
              {new Date(selectedAuditLog.timestamp).toLocaleDateString("es-ES")}
              <br />
              <span className="text-muted-foreground text-xs">
                {new Date(selectedAuditLog.timestamp).toLocaleTimeString(
                  "es-ES",
                )}
              </span>
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Dirección IP
              </span>
            </div>
            <p className="text-sm font-mono font-medium">
              {selectedAuditLog.ipAddress || "No registrada"}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              {isMobile ? (
                <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Plataforma
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-semibold text-[10px]">
                {isMobile ? "Móvil" : "Desktop"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

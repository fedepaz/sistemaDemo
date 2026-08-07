// src/features/auditLogs/components/auditLog-form.tsx

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LogIn,
  LogOut,
  AlertTriangle,
  Key,
  FileText,
  Shield,
  Route,
  type LucideIcon,
} from "lucide-react";
import { cn, isMobileDevice } from "@/lib/utils";

// Action badge color mapping using theme tokens
const getActionBadge = (action: string): string => {
  const colors: Record<string, string> = {
    CREATE: "bg-primary/10 text-primary border-primary/20",
    UPDATE: "bg-secondary/10 text-secondary-foreground border-secondary/20",
    DELETE: "bg-destructive/10 text-destructive border-destructive/20",
    LOGIN: "bg-primary/10 text-primary border-primary/20",
    LOGOUT: "bg-muted text-muted-foreground border-border/40",
    ACCESS: "bg-accent/20 text-accent-foreground border-accent/20",
    LOGIN_FAILED: "bg-destructive/10 text-destructive border-destructive/20",
    PASSWORD_CHANGE: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  };
  return colors[action] || "bg-muted text-muted-foreground border-border/40";
};

// Helper to get action icon
const getActionIcon = (action: string) => {
  switch (action) {
    case "LOGIN":
      return <LogIn className="h-4 w-4" aria-hidden="true" />;
    case "LOGOUT":
      return <LogOut className="h-4 w-4" aria-hidden="true" />;
    case "LOGIN_FAILED":
      return <AlertTriangle className="h-4 w-4" aria-hidden="true" />;
    case "PASSWORD_CHANGE":
      return <Key className="h-4 w-4" aria-hidden="true" />;
    default:
      return <FileText className="h-4 w-4" aria-hidden="true" />;
  }
};

// Reusable InfoRow component matching extendido pattern
const InfoRow = ({
  icon: Icon,
  label,
  value,
  badge,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | number | null;
  badge?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 md:gap-4 py-2 md:py-3 border-b border-border/40 last:border-0",
      className,
    )}
  >
    <div className="p-1.5 md:p-2 bg-primary/5 rounded-lg border border-primary/10">
      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-1 md:mb-1.5">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-xs md:text-base font-bold truncate text-foreground">
          {value ?? "-"}
        </p>
        {badge}
      </div>
    </div>
  </div>
);

// Helper to format changes for display, filtering out metadata fields
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatChangesForDisplay = (changes: Record<string, any> | null) => {
  if (!changes || Object.keys(changes).length === 0) return null;

  // Filter out metadata fields for cleaner display
  const metadataFields = [
    "requestId",
    "endpoint",
    "method",
    "durationMs",
    "timestamp",
  ];
  const displayFields = Object.entries(changes).filter(
    ([key]) => !metadataFields.includes(key),
  );

  return displayFields.length > 0 ? Object.fromEntries(displayFields) : null;
};

interface AuditLogFormProps {
  selectedAuditLog: AuditLogDto;
}

export function AuditLogForm({ selectedAuditLog }: AuditLogFormProps) {
  const isMobile = isMobileDevice(selectedAuditLog.userAgent);
  const actionIcon = getActionIcon(selectedAuditLog.action);
  const timestamp = new Date(selectedAuditLog.timestamp);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changes = selectedAuditLog.changes as any;

  return (
    <div className="flex flex-col gap-3 md:gap-6 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-hidden">
      {/* Hero Section: Action + Entity */}
      <div className="space-y-3 md:space-y-4 shrink-0">
        <div className="flex items-center justify-between bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              {actionIcon}
            </div>
            <div>
              <Badge
                variant="outline"
                className={`${getActionBadge(selectedAuditLog.action)} font-bold uppercase tracking-widest text-[10px] md:text-xs h-5 md:h-6 px-2 flex items-center gap-1.5 mb-1 md:mb-2`}
              >
                {actionIcon}
                {selectedAuditLog.action}
              </Badge>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-widest text-[9px] md:text-[10px] h-4 md:h-5 px-1.5"
                >
                  {selectedAuditLog.entityType}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right pr-1 md:pr-2">
            <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-tighter leading-none mb-0.5 md:mb-1">
              ID
            </p>
            <p className="text-[10px] md:text-xs font-mono font-bold text-foreground truncate max-w-[100px] md:max-w-[140px]">
              {selectedAuditLog.entityId}
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: "Fecha",
              value: timestamp.toLocaleDateString("es-AR"),
              icon: Clock,
            },
            {
              label: "Hora",
              value: timestamp.toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              icon: Clock,
            },
            {
              label: "Plataforma",
              value: isMobile ? "Móvil" : "Desktop",
              icon: isMobile ? Smartphone : Monitor,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-background border border-border/60 p-1.5 md:p-2.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2.5 shadow-sm overflow-hidden"
            >
              <div className="p-1 md:p-1.5 bg-muted rounded-md shrink-0">
                <item.icon className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[7px] md:text-[8px] font-bold uppercase leading-none mb-0.5">
                  {item.label}
                </p>
                <p className="text-[10px] md:text-xs truncate uppercase font-bold">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabbed Navigation */}
      <Tabs
        defaultValue="details"
        className="flex-1 flex flex-col overflow-hidden min-h-0"
      >
        <TabsList className="grid grid-cols-2 bg-muted/80 p-1 rounded-xl md:rounded-2xl shrink-0 h-10 md:h-14 border border-border/40 gap-1 md:gap-2 shadow-inner">
          <TabsTrigger
            value="details"
            className="rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <History className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-2 hidden sm:inline-block" />
            Detalles
          </TabsTrigger>

          <TabsTrigger
            value="technical"
            className="rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <Shield className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-2 hidden sm:inline-block" />
            Técnico
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-3 md:pt-6 pb-2">
          {/* Tab: Details */}
          <TabsContent
            value="details"
            className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card className="border-border/60 shadow-sm rounded-xl md:rounded-[1.5rem] overflow-hidden bg-card/50">
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* User Info */}
                {selectedAuditLog.user ? (
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary/70">
                      <User className="h-3 w-3 md:h-4 md:w-4" /> Responsable
                    </div>
                    <div className="grid grid-cols-1 gap-0.5 md:gap-1">
                      <InfoRow
                        icon={User}
                        label="Nombre Completo"
                        value={`${selectedAuditLog.user.firstName} ${selectedAuditLog.user.lastName}`}
                        className="border-primary/5"
                      />
                      <InfoRow
                        icon={User}
                        label="Nombre de Usuario"
                        value={selectedAuditLog.user.username}
                        className="border-primary/5"
                      />
                      <InfoRow
                        icon={Hash}
                        label="ID Interno"
                        value={selectedAuditLog.userId}
                        className="border-0"
                      />
                    </div>
                  </div>
                ) : null}

                {/* Changes */}
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary/70">
                    <Database className="h-3 w-3 md:h-4 md:w-4" /> Registro de Cambios
                  </div>
                  <div className="p-3 md:p-5 rounded-xl md:rounded-2xl bg-muted/30 border border-border/40">
                    {(() => {
                      const displayChanges = formatChangesForDisplay(
                        selectedAuditLog.changes,
                      );
                      if (!displayChanges) {
                        return (
                          <p className="text-xs md:text-sm text-muted-foreground italic">
                            No hay cambios registrados para esta acción
                          </p>
                        );
                      }
                      return (
                        <div className="space-y-2 md:space-y-3">
                          {Object.entries(displayChanges).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-1.5 border-b border-border/30 last:border-0"
                            >
                              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 min-w-[80px] md:min-w-[100px]">
                                {key}
                              </span>
                              <div className="flex-1">
                                {typeof value === "object" && value !== null && "before" in value && "after" in value ? (
                                  <div className="flex items-center gap-2 text-xs md:text-sm">
                                    <span className="text-muted-foreground line-through">
                                      {String(value.before)}
                                    </span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="font-medium text-foreground">
                                      {String(value.after)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs md:text-sm font-medium text-foreground">
                                    {typeof value === "object"
                                      ? JSON.stringify(value, null, 2)
                                      : String(value)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Technical */}
          <TabsContent
            value="technical"
            className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card className="border-border/60 shadow-sm rounded-xl md:rounded-[1.5rem] overflow-hidden bg-card/50">
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 gap-0.5 md:gap-1">
                  <InfoRow
                    icon={Route}
                    label="Ruta / Endpoint"
                    value={changes?.endpoint || "N/A"}
                    badge={
                      changes?.method ? (
                        <Badge
                          variant="secondary"
                          className="font-mono font-bold text-[9px] md:text-[10px] h-4 md:h-5"
                        >
                          {changes.method}
                        </Badge>
                      ) : undefined
                    }
                    className="border-primary/5"
                  />
                  <InfoRow
                    icon={Clock}
                    label="Timestamp"
                    value={`${timestamp.toLocaleDateString("es-AR")} ${timestamp.toLocaleTimeString("es-AR")}`}
                    className="border-primary/5"
                  />
                  <InfoRow
                    icon={Globe}
                    label="Dirección IP"
                    value={selectedAuditLog.ipAddress || "No registrada"}
                    className="border-primary/5"
                  />
                  <InfoRow
                    icon={isMobile ? Smartphone : Monitor}
                    label="Dispositivo"
                    value={isMobile ? "Móvil" : "Desktop"}
                    badge={
                      <Badge
                        variant="secondary"
                        className="font-semibold text-[9px] md:text-[10px] h-4 md:h-5"
                      >
                        {selectedAuditLog.userAgent
                          ? `${selectedAuditLog.userAgent.substring(0, 30)}...`
                          : "N/A"}
                      </Badge>
                    }
                    className="border-0"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

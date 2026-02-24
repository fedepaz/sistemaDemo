// src/features/users/components/user-form.tsx

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuditLogDto } from "@vivero/shared";
import { User, Database, Clock, History } from "lucide-react";

interface AuditLogFormProps {
  selectedAuditLog: AuditLogDto;
}

export function AuditLogForm({ selectedAuditLog }: AuditLogFormProps) {
  return (
    <div className="space-y-6">
      {/* Usuario */}
      {selectedAuditLog.user ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-muted-foreground" />
              Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">
                Nombre completo
              </span>
              <p className="font-medium">
                {selectedAuditLog.user.firstName}{" "}
                {selectedAuditLog.user.lastName}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Email</span>
              <p className="font-medium">{selectedAuditLog.user.email}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                ID de usuario
              </span>
              <p className="font-mono text-xs bg-muted p-1 rounded">
                {selectedAuditLog.userId}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Entidad afectada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-muted-foreground" />
            Entidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm text-muted-foreground">Tipo</span>
            <Badge variant="secondary" className="mt-1">
              {selectedAuditLog.entityType}
            </Badge>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">ID</span>
            <p className="font-mono text-xs bg-muted p-1 rounded">
              {selectedAuditLog.entityId}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cambios realizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-muted-foreground" />
            Cambios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-3 rounded-md overflow-auto max-h-60 text-sm">
            {JSON.stringify(selectedAuditLog.changes, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Metadatos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Metadatos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Fecha y hora</span>
            <p className="font-medium">
              {new Date(selectedAuditLog.timestamp).toLocaleString("es-ES")}
            </p>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">IP</span>
            <p className="font-medium">{selectedAuditLog.ipAddress || "N/A"}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Dispositivo</span>
            <p className="font-medium">
              {selectedAuditLog.userAgent?.includes("Mobile")
                ? "📱 Móvil"
                : "💻 Escritorio"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

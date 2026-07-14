// src/features/alerts/components/v2/AlertsDashboardV2.tsx
"use client";

import { Suspense, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { AlertSummaryCards } from "../shared/alert-summary-cards";
import { AlertDashboardSkeleton } from "../shared/alert-dashboard-skeleton";
import {
  useSiembraRetrasada,
  useFaltaGerminacion,
  useFaltantePlantas,
  useFaltaPreExpedicion,
} from "../../hooks/useAlerts";
import { SiembraRetrasadaCard } from "./SiembraRetrasadaCard";
import { FaltaGerminacionCard } from "./FaltaGerminacionCard";
import { FaltantePlantasCard } from "./FaltantePlantasCard";
import { FaltaPreExpedicionCard } from "./FaltaPreExpedicionCard";
import { NotificationCenter } from "./NotificationCenter";

interface NotificacionAuditoria {
  id: string;
  destino: string;
  fecha: string;
  mensaje: string;
  partidaId?: number;
}

function AlertsContent() {
  const { data: siembraRetrasada } = useSiembraRetrasada();
  const { data: faltaGerminacion } = useFaltaGerminacion();
  const { data: faltantePlantas } = useFaltantePlantas();
  const { data: faltaPreExpedicion } = useFaltaPreExpedicion();

  const [notifications, setNotifications] = useState<NotificacionAuditoria[]>([]);

  const totalAlerts =
    siembraRetrasada.length +
    faltaGerminacion.length +
    faltantePlantas.length +
    faltaPreExpedicion.length;

  const handleClearAll = () => setNotifications([]);
  const handleClearItem = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="flex flex-col gap-4">
      <AlertSummaryCards
        siembraRetrasadaCount={siembraRetrasada.length}
        faltaGerminacionCount={faltaGerminacion.length}
        faltantePlantasCount={faltantePlantas.length}
        faltaPreExpedicionCount={faltaPreExpedicion.length}
      />

      {totalAlerts === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="p-3 rounded-full bg-muted">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              No hay alertas activas
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Todas las partidas están dentro de los parámetros esperados
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          <div className="flex-1 space-y-3 min-w-0">
            {siembraRetrasada.map((a) => (
              <SiembraRetrasadaCard key={`${a.partidaId}-${a.indice}`} alerta={a} />
            ))}
            {faltaGerminacion.map((a) => (
              <FaltaGerminacionCard key={`${a.partidaId}-${a.indice}`} alerta={a} />
            ))}
            {faltantePlantas.map((a) => (
              <FaltantePlantasCard key={`${a.partidaId}-${a.indice}`} alerta={a} />
            ))}
            {faltaPreExpedicion.map((a) => (
              <FaltaPreExpedicionCard key={`${a.partidaId}-${a.indice}`} alerta={a} />
            ))}
          </div>

          <div className="w-72 shrink-0 hidden lg:block">
            <NotificationCenter
              notifications={notifications}
              onClearAll={handleClearAll}
              onClearItem={handleClearItem}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function AlertsDashboardV2() {
  return (
    <Suspense fallback={<AlertDashboardSkeleton />}>
      <AlertsContent />
    </Suspense>
  );
}

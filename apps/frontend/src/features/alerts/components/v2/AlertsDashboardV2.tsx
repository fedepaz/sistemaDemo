// src/features/alerts/components/v2/AlertsDashboardV2.tsx
"use client";

import { Suspense, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { AlertDashboardSkeleton } from "../shared/alert-dashboard-skeleton";
import { FilterTabs, type AlertTab } from "../shared/filter-tabs";
import {
  useSiembraRetrasada,
  useFaltaGerminacion,
  useFaltantePlantas,
  useFaltaPreExpedicion,
} from "../../hooks/useAlerts";
import { useAlertActions } from "../../hooks/useAlertActions";
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

  const [activeTab, setActiveTab] = useState<AlertTab>("all");
  const [notifications, setNotifications] = useState<NotificacionAuditoria[]>([]);

  const { dismissSiembra, dismissGerminacion, dismissFaltante, dismissPreExpedicion } =
    useAlertActions();

  const totalAlerts =
    siembraRetrasada.length +
    faltaGerminacion.length +
    faltantePlantas.length +
    faltaPreExpedicion.length;

  const showSiembra = activeTab === "all" || activeTab === "siembra";
  const showGerminacion = activeTab === "all" || activeTab === "germinacion";
  const showFaltante = activeTab === "all" || activeTab === "faltante";
  const showPreExpedicion = activeTab === "all" || activeTab === "pre-expedicion";

  const filteredCount =
    (showSiembra ? siembraRetrasada.length : 0) +
    (showGerminacion ? faltaGerminacion.length : 0) +
    (showFaltante ? faltantePlantas.length : 0) +
    (showPreExpedicion ? faltaPreExpedicion.length : 0);

  const handleClearAll = () => setNotifications([]);
  const handleClearItem = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="flex flex-col gap-4">
      {totalAlerts > 0 && (
        <FilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{
            all: totalAlerts,
            siembra: siembraRetrasada.length,
            germinacion: faltaGerminacion.length,
            faltante: faltantePlantas.length,
            preExpedicion: faltaPreExpedicion.length,
          }}
        />
      )}

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
      ) : filteredCount === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="p-3 rounded-full bg-muted">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              No hay alertas de este tipo
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              No se encontraron alertas para la categoría seleccionada
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
            {showSiembra &&
              siembraRetrasada.map((a) => (
                <SiembraRetrasadaCard
                  key={`${a.partidaId}-${a.indice}`}
                  alerta={a}
                  onDismiss={(action) => dismissSiembra(a.partidaId, a.indice, action)}
                />
              ))}
            {showGerminacion &&
              faltaGerminacion.map((a) => (
                <FaltaGerminacionCard
                  key={`${a.partidaId}-${a.indice}`}
                  alerta={a}
                  onDismiss={() => dismissGerminacion(a.partidaId, a.indice)}
                />
              ))}
            {showFaltante &&
              faltantePlantas.map((a) => (
                <FaltantePlantasCard
                  key={`${a.partidaId}-${a.indice}`}
                  alerta={a}
                  onDismiss={() => dismissFaltante(a.partidaId, a.indice)}
                />
              ))}
            {showPreExpedicion &&
              faltaPreExpedicion.map((a) => (
                <FaltaPreExpedicionCard
                  key={`${a.partidaId}-${a.indice}`}
                  alerta={a}
                  onDismiss={() => dismissPreExpedicion(a.partidaId, a.indice)}
                />
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

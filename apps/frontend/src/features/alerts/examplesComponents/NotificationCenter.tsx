import React from "react";
import { Bell, Mail, Trash2, ShieldAlert } from "lucide-react";
import { NotificacionAuditoria } from "../types";

interface NotificationCenterProps {
  notifications: NotificacionAuditoria[];
  onClearAll: () => void;
  onClearItem: (id: string) => void;
}

export default function NotificationCenter({
  notifications,
  onClearAll,
  onClearItem,
}: NotificationCenterProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#fafafa]">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-5 w-5 text-[#0f172a]" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
          </div>
          <h2 className="text-sm font-bold text-slate-800">
            Historial de Notificaciones
          </h2>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-[#64748b] hover:text-rose-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-rose-50 cursor-pointer font-bold"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpiar todo
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-[#fbfbfb]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-slate-400">
            <Mail className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-500">
              No hay notificaciones emitidas.
            </p>
            <p className="text-[10px] text-[#64748b] mt-1.5 max-w-[220px] leading-relaxed">
              Las alertas críticas se disparan automáticamente a los
              responsables los días miércoles de simulación.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 bg-white border border-[#e2e8f0] rounded-lg text-xs animate-slide-in hover:border-slate-300 transition-all flex justify-between gap-3 group relative shadow-xs text-left"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#075985] bg-[#e0f2fe] px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                      {notif.destino}
                    </span>
                    <span className="text-[10px] text-[#64748b] font-mono font-medium">
                      {notif.fecha}
                    </span>
                  </div>
                  <p className="text-[#1e293b] font-medium leading-normal">
                    {notif.mensaje}
                  </p>
                  <div className="text-[9px] text-[#64748b] font-mono bg-slate-50 px-1.5 py-0.5 rounded inline-block">
                    Partida: {notif.numeroPartida} | Art: {notif.codigoArticulo}
                  </div>
                </div>
                <button
                  onClick={() => onClearItem(notif.id)}
                  className="text-slate-400 hover:text-rose-600 self-start p-1 rounded-md hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                  title="Eliminar registro"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[#e2e8f0] bg-[#fafafa] text-[10px] text-[#64748b] flex items-start gap-2 text-left">
        <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Auditoría Automatizada:</strong> Los e-mails se guardan en
          este registro para demostrar el cumplimiento del flujo operativo de
          despacho.
        </p>
      </div>
    </div>
  );
}

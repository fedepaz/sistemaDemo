import React from "react";
import {
  Package,
  Calendar,
  User,
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { AlertaPreExpedicion } from "../types";
import {
  formatSpanishDate,
  getWednesdayOfPreviousWeek,
} from "../utils/dateUtils";

interface FaltaPreExpedicionCardProps {
  alerta: AlertaPreExpedicion;
  onLoadPreExpedicion: (id: string) => void;
  currentDateStr: string;
}

export default function FaltaPreExpedicionCard({
  alerta,
  onLoadPreExpedicion,
  currentDateStr,
}: FaltaPreExpedicionCardProps) {
  const wednesdayPrevWeek = getWednesdayOfPreviousWeek(alerta.fechaEntrega);

  // Format the activation Wednesday date beautifully
  const wednesdayFormatted = wednesdayPrevWeek.toLocaleDateString("es-ES", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs hover:shadow-md transition-all flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-[#fafafa] border-b border-[#e2e8f0] flex justify-between items-start gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold bg-[#f1f5f9] text-[#64748b] px-2 py-0.5 rounded-sm">
              {alerta.numeroPartida}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold bg-[#f3e8ff] text-[#6b21a8] px-2 py-0.5 rounded-md">
              ⚑ Pre-expedición faltante
            </span>
          </div>
          <h3 className="text-sm font-semibold text-[#1e293b] mt-1.5 flex items-center gap-1">
            <Package className="h-4 w-4 text-[#64748b] shrink-0" />
            {alerta.codigoArticulo}
          </h3>
          <p className="text-xs text-[#64748b] font-medium">
            {alerta.descripcionArticulo}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
            Entrega
          </div>
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5 font-mono">
            <Calendar className="h-3.5 w-3.5 text-indigo-500" />
            {alerta.fechaEntrega}
          </div>
        </div>
      </div>

      {/* Rules Area */}
      <div className="px-4 py-2 bg-slate-50 border-b border-[#e2e8f0] text-[10px] text-slate-500 flex justify-between items-center gap-2">
        <span className="flex items-center gap-1 font-medium">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          Se activa miércoles previo: <strong>{wednesdayFormatted}</strong>
        </span>
        {alerta.notificacionEnviada && (
          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-bold border border-emerald-100 flex items-center gap-0.5 shrink-0">
            ✉️ Notificado
          </span>
        )}
      </div>

      {/* Responsible Area */}
      <div className="p-4 flex-1 flex flex-col justify-between min-h-[140px] bg-white">
        <div className="space-y-3 text-left">
          <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-[#e2e8f0] space-y-1.5">
            <div className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest">
              Responsable de área encargado
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>{alerta.responsableArea}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] truncate">
                {alerta.emailResponsable}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#64748b] italic leading-relaxed">
            Esta alerta genera automáticamente una notificación de correo al
            responsable de área para coordinar la pre-expedición de las plantas
            antes de su despacho.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-[#e2e8f0]">
          <button
            type="button"
            onClick={() => onLoadPreExpedicion(alerta.id)}
            className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            Cargar Datos de Pre-expedición
          </button>
        </div>
      </div>
    </div>
  );
}

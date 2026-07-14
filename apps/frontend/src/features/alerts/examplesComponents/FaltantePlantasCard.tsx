import React, { useState } from "react";
import {
  Package,
  ClipboardList,
  MessageSquare,
  Send,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AlertaFaltante, RolUsuario } from "../types";
import { getGerminadasTotales } from "../utils/alertRules";

interface FaltantePlantasCardProps {
  alerta: AlertaFaltante;
  onAddComment: (id: string, text: string) => void;
  onResolve: (id: string) => void;
  userRole: RolUsuario;
}

export default function FaltantePlantasCard({
  alerta,
  onAddComment,
  onResolve,
  userRole,
}: FaltantePlantasCardProps) {
  const [commentText, setCommentText] = useState("");
  const [showSubpartidas, setShowSubpartidas] = useState(false);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(alerta.id, commentText.trim());
    setCommentText("");
  };

  const totalGerminadas = getGerminadasTotales(alerta);
  const faltantes = alerta.solicitadas - totalGerminadas;
  const porcentajeLogrado = Math.round(
    (totalGerminadas / alerta.solicitadas) * 100,
  );

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs hover:shadow-md transition-all flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-[#fafafa] border-b border-[#e2e8f0] flex justify-between items-start gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold bg-[#f1f5f9] text-[#64748b] px-2 py-0.5 rounded-sm">
              {alerta.numeroPartida}
            </span>
            <span className="text-xs font-mono text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.5 rounded-sm">
              {alerta.invernadero}
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
        <div className="bg-[#fee2e2] text-[#991b1b] text-xs font-extrabold px-2.5 py-1 rounded-md border border-red-100 shrink-0 font-mono">
          -{faltantes.toLocaleString("es-ES")} plantas
        </div>
      </div>

      {/* Stats and Calculation Summary */}
      <div className="px-4 py-3 bg-slate-50/60 border-b border-[#e2e8f0] space-y-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-1.5 rounded-md border border-[#e2e8f0]">
            <span className="text-[9px] text-[#64748b] font-bold uppercase block">
              Solicitadas
            </span>
            <span className="text-xs font-extrabold text-slate-700 font-mono">
              {alerta.solicitadas.toLocaleString("es-ES")}
            </span>
          </div>
          <div className="bg-white p-1.5 rounded-md border border-[#e2e8f0]">
            <span className="text-[9px] text-[#64748b] font-bold uppercase block">
              Germinadas
            </span>
            <span className="text-xs font-extrabold text-teal-600 font-mono">
              {totalGerminadas.toLocaleString("es-ES")}
            </span>
          </div>
          <div className="bg-white p-1.5 rounded-md border border-[#e2e8f0]">
            <span className="text-[9px] text-[#64748b] font-bold uppercase block">
              % Logrado
            </span>
            <span className="text-xs font-extrabold text-[#ef4444] font-mono">
              {porcentajeLogrado}%
            </span>
          </div>
        </div>

        {/* Sleek Progress Bar */}
        <div className="w-full bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden my-2">
          <div
            className="bg-[#ef4444] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, porcentajeLogrado)}%` }}
          ></div>
        </div>

        {/* Subpartidas Detail Accordion */}
        <div className="border border-[#e2e8f0] rounded-lg overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setShowSubpartidas(!showSubpartidas)}
            className="w-full flex items-center justify-between p-2 text-[10px] font-bold text-[#64748b] uppercase hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1">
              <ClipboardList className="h-3.5 w-3.5 text-[#64748b]" />
              Suma de Subpartidas ({alerta.subpartidas.length})
            </span>
            {showSubpartidas ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          {showSubpartidas && (
            <div className="p-2 border-t border-[#e2e8f0] bg-slate-50/30 text-[11px] space-y-1">
              {alerta.subpartidas.map((sub, idx) => (
                <div
                  key={sub.id || idx}
                  className="flex justify-between py-0.5 font-medium border-b border-dashed border-slate-100 last:border-0 text-slate-600"
                >
                  <span>{sub.nombre}</span>
                  <span className="font-mono font-bold text-slate-700">
                    {sub.germinadas.toLocaleString("es-ES")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-1 font-bold border-t border-[#e2e8f0] mt-1 text-[11px] text-slate-800">
                <span>Total Germinadas</span>
                <span className="font-mono text-teal-600">
                  {totalGerminadas.toLocaleString("es-ES")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments section */}
      <div className="flex-1 p-4 flex flex-col justify-between min-h-[140px] bg-white">
        <div className="space-y-2 mb-3 max-h-[90px] overflow-y-auto pr-1">
          <span className="text-[10px] uppercase tracking-widest text-[#64748b] font-bold block">
            Comentarios ({alerta.comentarios.length})
          </span>
          {alerta.comentarios.length === 0 ? (
            <p className="text-[11px] text-[#64748b] italic">
              No hay comentarios cargados todavía.
            </p>
          ) : (
            <div className="space-y-1.5">
              {alerta.comentarios.map((c) => (
                <div
                  key={c.id}
                  className="p-2 bg-slate-50 rounded-lg text-[11px] leading-relaxed"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                    <span className="font-semibold text-slate-700">
                      {c.autor}
                    </span>
                    <span className="font-mono">{c.fecha}</span>
                  </div>
                  <p className="text-slate-600 font-medium text-left">
                    {c.texto}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inline comment entry */}
        <form
          onSubmit={handleSubmitComment}
          className="flex gap-1.5 border-b border-[#e2e8f0] pb-3 mb-3"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Añadir comentario técnico..."
            className="flex-1 bg-[#fcfcfc] hover:bg-slate-100/40 focus:bg-white text-xs px-2.5 py-1.5 rounded-md border border-[#e2e8f0] focus:outline-hidden focus:border-[#ef4444] transition-all text-slate-700"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="bg-[#0f172a] hover:bg-slate-800 text-white p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:hover:bg-[#0f172a] cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Supervisor Authorization Zone */}
        <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] flex flex-col gap-2">
          {userRole === "supervisor_habilitado" ? (
            <div className="flex items-center justify-between gap-2">
              <div className="text-left shrink-1">
                <p className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  Autorización Disponible
                </p>
                <p className="text-[9px] text-[#64748b]">
                  Puedes intervenir y aprobar este faltante.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onResolve(alerta.id)}
                className="bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-md transition-all shrink-0 hover:shadow-xs cursor-pointer"
              >
                Intervenir y Resolver
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-left">
              <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-600 font-bold">
                  Intervención Restringida
                </p>
                <p className="text-[9px] text-[#64748b] leading-relaxed">
                  La alerta se elimina con intervención de{" "}
                  <strong>usuario habilitado</strong>. Cambie el rol a{" "}
                  <em>Supervisor Habilitado</em> en la cabecera para autorizar.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import {
  Calendar,
  Package,
  Layers,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { AlertaSiembra } from "../types";

interface SiembraRetrasadaCardProps {
  alerta: AlertaSiembra;
  onAddComment: (id: string, text: string) => void;
  onMarkSowed: (id: string) => void;
  onCancel: (id: string) => void;
}

export default function SiembraRetrasadaCard({
  alerta,
  onAddComment,
  onMarkSowed,
  onCancel,
}: SiembraRetrasadaCardProps) {
  const [commentText, setCommentText] = useState("");

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(alerta.id, commentText.trim());
    setCommentText("");
  };

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
              Prog: {alerta.semanaSiembraProgramada}
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
        <div className="flex items-center gap-1.5 shrink-0 bg-white/80 backdrop-blur-xs px-2 py-1 rounded-md border border-[#e2e8f0]">
          <Layers className="h-3.5 w-3.5 text-[#64748b]" />
          <span className="text-xs font-bold text-slate-700 font-mono">
            {alerta.cantidadContenedores} cont.
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-slate-50/60 border-b border-[#e2e8f0] flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider font-bold bg-[#fef3c7] text-[#92400e] px-2.5 py-1 rounded-md">
          ⚠ Siembra retrasada
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onMarkSowed(alerta.id)}
            className="flex items-center gap-1 text-[11px] font-bold bg-[#0f172a] hover:bg-slate-800 text-white px-2.5 py-1 rounded-md shadow-xs hover:shadow-sm transition-all cursor-pointer"
            title="Marcar como sembrada y resolver alerta"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Sembrada
          </button>
          <button
            onClick={() => onCancel(alerta.id)}
            className="flex items-center gap-1 text-[11px] font-bold bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-100 text-slate-700 border border-transparent px-2.5 py-1 rounded-md transition-all cursor-pointer"
            title="Anular esta partida de siembra"
          >
            <XCircle className="h-3.5 w-3.5" />
            Anular
          </button>
        </div>
      </div>

      {/* Comments Area */}
      <div className="flex-1 p-4 flex flex-col justify-between min-h-[140px] bg-white">
        <div className="space-y-2 mb-3 max-h-[100px] overflow-y-auto pr-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
            Comentarios ({alerta.comentarios.length})
          </span>
          {alerta.comentarios.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">
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

        {/* New Comment Form */}
        <form onSubmit={handleSubmitComment} className="flex gap-1.5">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Agregar comentario..."
            className="flex-1 bg-[#fcfcfc] hover:bg-slate-100/40 focus:bg-white text-xs px-2.5 py-1.5 rounded-md border border-[#e2e8f0] focus:outline-hidden focus:border-[#0f172a] transition-all text-slate-700"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="bg-[#0f172a] hover:bg-slate-800 text-white p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:hover:bg-[#0f172a] cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

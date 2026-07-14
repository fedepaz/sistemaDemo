import React, { useState } from "react";
import {
  Layers,
  Package,
  ClipboardCheck,
  ArrowRight,
  Home,
  Plus,
  Trash2,
} from "lucide-react";
import { AlertaGerminacion } from "../types";

interface FaltaGerminacionCardProps {
  alerta: AlertaGerminacion;
  onRegisterGermination: (
    id: string,
    solicitadas: number,
    subpartidas: { nombre: string; germinadas: number }[],
  ) => void;
}

export default function FaltaGerminacionCard({
  alerta,
  onRegisterGermination,
}: FaltaGerminacionCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [solicitadas, setSolicitadas] = useState<number>(
    alerta.cantidadContenedores * 150,
  ); // Rough default: 150 plants per container
  const [subpartidas, setSubpartidas] = useState<
    { id: string; nombre: string; germinadas: number }[]
  >([
    {
      id: "sub-1",
      nombre: "Subpartida Principal",
      germinadas: Math.floor(alerta.cantidadContenedores * 150 * 0.9),
    },
  ]);

  const handleAddSubpartida = () => {
    const nextId = `sub-${Date.now()}`;
    const nextNum = subpartidas.length + 1;
    setSubpartidas([
      ...subpartidas,
      { id: nextId, nombre: `Subpartida Auxiliar ${nextNum}`, germinadas: 0 },
    ]);
  };

  const handleRemoveSubpartida = (id: string) => {
    if (subpartidas.length <= 1) return; // Keep at least one
    setSubpartidas(subpartidas.filter((s) => s.id !== id));
  };

  const handleSubpartidaChange = (
    id: string,
    field: "nombre" | "germinadas",
    value: string | number,
  ) => {
    setSubpartidas(
      subpartidas.map((sub) => {
        if (sub.id === id) {
          return { ...sub, [field]: value };
        }
        return sub;
      }),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (solicitadas <= 0) return;

    // Submit clean array
    const cleanSubs = subpartidas.map((sub) => ({
      nombre: sub.nombre.trim() || "Subpartida",
      germinadas: Number(sub.germinadas) || 0,
    }));

    onRegisterGermination(alerta.id, solicitadas, cleanSubs);
    setShowForm(false);
  };

  const totalGerminadas = subpartidas.reduce(
    (sum, s) => sum + Number(s.germinadas || 0),
    0,
  );
  const isShortage = totalGerminadas < solicitadas;

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs hover:shadow-md transition-all flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-[#fafafa] border-b border-[#e2e8f0] flex justify-between items-start gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold bg-[#f1f5f9] text-[#64748b] px-2 py-0.5 rounded-sm">
              {alerta.numeroPartida}
            </span>
            <span className="text-xs font-mono text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.5 rounded-sm flex items-center gap-1">
              <Home className="h-3 w-3" /> {alerta.invernadero}
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

      {/* Main Alert Bar */}
      <div className="px-4 py-2.5 bg-slate-50/60 border-b border-[#e2e8f0] flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider font-bold bg-[#e0f2fe] text-[#075985] px-2.5 py-1 rounded-md">
          🌱 Esperando recuento
        </span>
        <span className="text-xs text-slate-500 font-semibold font-mono">
          F. Límite: {alerta.fechaLimiteRecuento}
        </span>
      </div>

      {/* Action / Form Area */}
      <div className="p-4 flex-1 flex flex-col justify-between min-h-[160px] bg-white">
        {!showForm ? (
          <div className="flex flex-col justify-center items-center py-6 text-center flex-1">
            <ClipboardCheck className="h-9 w-9 text-slate-300 mb-2" />
            <p className="text-xs text-slate-500 max-w-[220px] mb-4">
              La fecha para registrar los datos de germinación ha llegado y el
              dato está ausente.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="text-xs font-bold bg-[#0f172a] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <ClipboardCheck className="h-4 w-4" />
              Cargar Recuento de Germinación
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-3.5 flex flex-col justify-between h-full"
          >
            <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Plantas Solicitadas
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={solicitadas}
                    onChange={(e) =>
                      setSolicitadas(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs font-semibold focus:outline-hidden focus:border-teal-500 text-slate-700"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="text-[10px] text-slate-400 font-semibold pb-1.5">
                    Est. {alerta.cantidadContenedores * 150} plantas
                  </div>
                </div>
              </div>

              {/* Subpartidas List */}
              <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Subpartidas ({subpartidas.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSubpartida}
                    className="text-[10px] text-teal-600 hover:text-teal-700 font-bold flex items-center gap-0.5"
                  >
                    <Plus className="h-3 w-3" /> Añadir Sub
                  </button>
                </div>

                <div className="space-y-1.5">
                  {subpartidas.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex gap-1.5 items-center bg-slate-50/50 p-1.5 rounded-md border border-slate-100"
                    >
                      <input
                        type="text"
                        placeholder="Nombre Subpartida"
                        value={sub.nombre}
                        required
                        onChange={(e) =>
                          handleSubpartidaChange(
                            sub.id,
                            "nombre",
                            e.target.value,
                          )
                        }
                        className="flex-1 text-[11px] bg-white border border-slate-200 rounded px-1.5 py-0.5 focus:outline-hidden focus:border-teal-500 text-slate-700 font-medium"
                      />
                      <input
                        type="number"
                        placeholder="Germinadas"
                        required
                        min={0}
                        value={sub.germinadas}
                        onChange={(e) =>
                          handleSubpartidaChange(
                            sub.id,
                            "germinadas",
                            Math.max(0, parseInt(e.target.value) || 0),
                          )
                        }
                        className="w-20 text-[11px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-right focus:outline-hidden focus:border-teal-500 text-slate-700 font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubpartida(sub.id)}
                        disabled={subpartidas.length <= 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Footer Summary & Submit */}
            <div className="border-t border-slate-100 pt-2.5 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Totales:</span>
                <span className="font-semibold text-slate-700 font-mono">
                  {totalGerminadas} / {solicitadas} germinadas
                </span>
              </div>

              {isShortage && (
                <div className="text-[10px] text-[#92400e] bg-[#fef3c7] border border-[#f59e0b]/20 px-2 py-1 rounded-md leading-tight">
                  ⚠️ <strong>Aviso:</strong> Germinación inferior al pedido.
                  Generará una alerta de Faltante Estimado de Plantas (-
                  {(solicitadas - totalGerminadas).toLocaleString("es-ES")}).
                </div>
              )}

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 text-xs py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 text-xs py-1.5 bg-[#0f172a] hover:bg-slate-800 text-white font-bold rounded-md flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                >
                  Guardar <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

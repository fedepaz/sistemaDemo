import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Calendar,
  Layers,
  Package,
  ClipboardCheck,
  Bell,
  Mail,
  ShieldCheck,
  User,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Home,
  Check,
  AlertTriangle,
  Info,
  Clock,
  X,
  FileText,
} from "lucide-react";

import {
  AlertaSiembra,
  AlertaGerminacion,
  AlertaFaltante,
  AlertaPreExpedicion,
  NotificacionAuditoria,
  RolUsuario,
  Comentario,
  EstadoSiembra,
} from "./types";

import {
  INITIAL_ALERTAS_SIEMBRA,
  INITIAL_ALERTAS_GERMINACION,
  INITIAL_ALERTAS_FALTANTE,
  INITIAL_ALERTAS_PRE_EXPEDICION,
} from "./data/mockData";

import {
  getISOWeek,
  formatSpanishDate,
  getWednesdayOfPreviousWeek,
} from "./utils/dateUtils";
import {
  isSiembraRetrasadaActive,
  isFaltaGerminacionActive,
  isFaltantePlantasActive,
  isFaltaPreExpedicionActive,
  getGerminadasTotales,
} from "./utils/alertRules";

import SiembraRetrasadaCard from "./components/SiembraRetrasadaCard.tsx";
import FaltaGerminacionCard from "./components/FaltaGerminacionCard.tsx";
import FaltantePlantasCard from "./components/FaltantePlantasCard.tsx";
import FaltaPreExpedicionCard from "./components/FaltaPreExpedicionCard.tsx";
import NotificationCenter from "./components/NotificationCenter.tsx";

export default function App() {
  // --- STATE ---
  const [userRole, setUserRole] = useState<RolUsuario>(() => {
    const saved = localStorage.getItem("alerts_vivero_role");
    return (saved as RolUsuario) || "operador";
  });

  const [simulatedDate, setSimulatedDate] = useState<string>(() => {
    const saved = localStorage.getItem("alerts_vivero_date");
    return saved || "2026-07-13"; // Starts Monday July 13th, 2026
  });

  // Load datasets from localStorage or default
  const [alertasSiembra, setAlertasSiembra] = useState<AlertaSiembra[]>(() => {
    const saved = localStorage.getItem("alerts_vivero_siembra");
    return saved ? JSON.parse(saved) : INITIAL_ALERTAS_SIEMBRA;
  });

  const [alertasGerminacion, setAlertasGerminacion] = useState<
    AlertaGerminacion[]
  >(() => {
    const saved = localStorage.getItem("alerts_vivero_germinacion");
    return saved ? JSON.parse(saved) : INITIAL_ALERTAS_GERMINACION;
  });

  const [alertasFaltante, setAlertasFaltante] = useState<AlertaFaltante[]>(
    () => {
      const saved = localStorage.getItem("alerts_vivero_faltante");
      return saved ? JSON.parse(saved) : INITIAL_ALERTAS_FALTANTE;
    },
  );

  const [alertasPreExpedicion, setAlertasPreExpedicion] = useState<
    AlertaPreExpedicion[]
  >(() => {
    const saved = localStorage.getItem("alerts_vivero_pre_expedicion");
    return saved ? JSON.parse(saved) : INITIAL_ALERTAS_PRE_EXPEDICION;
  });

  const [notifications, setNotifications] = useState<NotificacionAuditoria[]>(
    () => {
      const saved = localStorage.getItem("alerts_vivero_notifications");
      return saved ? JSON.parse(saved) : [];
    },
  );

  // UI state
  const [activeTab, setActiveTab] = useState<
    "all" | "siembra" | "germinacion" | "faltante" | "pre-expedicion"
  >("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New alert form inputs (SlideOver)
  const [formCategory, setFormCategory] = useState<
    "siembra" | "germinacion" | "faltante" | "pre-expedicion"
  >("siembra");
  const [formPartida, setFormPartida] = useState("");
  const [formArticulo, setFormArticulo] = useState("TOM-PER-05");
  const [formArtDesc, setFormArtDesc] = useState("Tomate Perita Seleccionado");
  const [formCantidad, setFormCantidad] = useState(100);
  const [formInvernadero, setFormInvernadero] = useState("Invernadero 01");
  const [formSemana, setFormSemana] = useState("2026-W27");
  const [formFechaEntrega, setFormFechaEntrega] = useState("2026-07-25");
  const [formFechaRecuento, setFormFechaRecuento] = useState("2026-07-13");
  const [formSolicitadas, setFormSolicitadas] = useState(15000);
  const [formResponsable, setFormResponsable] = useState("Producción");
  const [formEmail, setFormEmail] = useState("produccion@viveroalpha.com");

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem("alerts_vivero_role", userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem("alerts_vivero_date", simulatedDate);
  }, [simulatedDate]);

  useEffect(() => {
    localStorage.setItem(
      "alerts_vivero_siembra",
      JSON.stringify(alertasSiembra),
    );
  }, [alertasSiembra]);

  useEffect(() => {
    localStorage.setItem(
      "alerts_vivero_germinacion",
      JSON.stringify(alertasGerminacion),
    );
  }, [alertasGerminacion]);

  useEffect(() => {
    localStorage.setItem(
      "alerts_vivero_faltante",
      JSON.stringify(alertasFaltante),
    );
  }, [alertasFaltante]);

  useEffect(() => {
    localStorage.setItem(
      "alerts_vivero_pre_expedicion",
      JSON.stringify(alertasPreExpedicion),
    );
  }, [alertasPreExpedicion]);

  useEffect(() => {
    localStorage.setItem(
      "alerts_vivero_notifications",
      JSON.stringify(notifications),
    );
  }, [notifications]);

  // Toast auto-dismiss
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // --- AUTOMATIC NOTIFICATIONS LOGIC ---
  // "Los días miércoles de la semana anterior a la entrega muestra las partidas que no tienen cargada su preexpedición
  // y genera una notificación automática para los responsables de cada área."
  useEffect(() => {
    let notificationsAdded = false;
    const newNotifications: NotificacionAuditoria[] = [...notifications];

    const updatedPreExp = alertasPreExpedicion.map((alerta) => {
      // Check if it qualifies for activation
      const isCurrentlyActive = isFaltaPreExpedicionActive(
        alerta,
        simulatedDate,
      );

      // If active and notification hasn't been sent yet, trigger it!
      if (isCurrentlyActive && !alerta.notificacionEnviada) {
        notificationsAdded = true;

        // Generate notification
        const id = `notif-${Date.now()}-${alerta.id}`;
        const mensaje = `Alerta de Pre-expedición pendiente para la partida ${alerta.numeroPartida} (${alerta.codigoArticulo}). Entrega programada el ${alerta.fechaEntrega}.`;

        newNotifications.unshift({
          id,
          fecha: `${simulatedDate} 08:00`,
          numeroPartida: alerta.numeroPartida,
          codigoArticulo: alerta.codigoArticulo,
          destino: `${alerta.responsableArea} (${alerta.emailResponsable})`,
          mensaje,
        });

        // Set success toast
        setSuccessToast(
          `✉️ Notificación automática enviada a ${alerta.responsableArea}`,
        );

        return {
          ...alerta,
          notificacionEnviada: true,
        };
      }
      return alerta;
    });

    if (notificationsAdded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAlertasPreExpedicion(updatedPreExp);
      setNotifications(newNotifications);
    }
  }, [simulatedDate, alertasPreExpedicion, notifications]);

  // --- METRICS & CALCULATIONS ---
  const currentWeek = getISOWeek(simulatedDate);

  // Active items in each category based on business logic and dates
  const activeSiembra = alertasSiembra.filter((a) =>
    isSiembraRetrasadaActive(a, currentWeek.formatted),
  );
  const activeGerminacion = alertasGerminacion.filter((a) =>
    isFaltaGerminacionActive(a, simulatedDate),
  );
  const activeFaltante = alertasFaltante.filter((a) =>
    isFaltantePlantasActive(a),
  );
  const activePreExpedicion = alertasPreExpedicion.filter((a) =>
    isFaltaPreExpedicionActive(a, simulatedDate),
  );

  const totalAlertasActivas =
    activeSiembra.length +
    activeGerminacion.length +
    activeFaltante.length +
    activePreExpedicion.length;

  // --- HANDLERS ---

  // 1. Siembra Retrasada
  const handleSiembraAddComment = (id: string, text: string) => {
    const authorName =
      userRole === "supervisor_habilitado"
        ? "Supervisor Habilitado"
        : "Operador";
    const timestamp =
      new Date().toLocaleDateString("es-ES") +
      " " +
      new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const newComment: Comentario = {
      id: `c-${Date.now()}`,
      autor: authorName,
      fecha: timestamp,
      texto: text,
    };

    setAlertasSiembra((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, comentarios: [...item.comentarios, newComment] };
        }
        return item;
      }),
    );
    setSuccessToast("Comentario agregado con éxito");
  };

  const handleSiembraMarkSowed = (id: string) => {
    setAlertasSiembra((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, estado: "sembrada" };
        }
        return item;
      }),
    );
    setSuccessToast("Partida marcada como SEMBRADA. Alerta resuelta.");
  };

  const handleSiembraCancel = (id: string) => {
    setAlertasSiembra((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, estado: "anulada" };
        }
        return item;
      }),
    );
    setSuccessToast("Partida ANULADA. Alerta archivada.");
  };

  // 2. Falta recuento germinación -> registers germinated and can potentially trigger plant shortage!
  const handleRegisterGermination = (
    id: string,
    solicitadasInput: number,
    subpartidasInput: { nombre: string; germinadas: number }[],
  ) => {
    // Find the alert
    const targetAlert = alertasGerminacion.find((g) => g.id === id);
    if (!targetAlert) return;

    // 1. Mark the germination alert as registered so it disappears
    setAlertasGerminacion((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estado: "registrado" } : item,
      ),
    );

    // 2. Sum the sub-batches germinated total
    const totalGerminadas = subpartidasInput.reduce(
      (sum, s) => sum + s.germinadas,
      0,
    );

    // 3. If sowed germinated is less than requested, trigger an estimated plant shortage alert automatically!
    if (totalGerminadas < solicitadasInput) {
      const generatedShortage: AlertaFaltante = {
        id: `f-gen-${Date.now()}`,
        numeroPartida: targetAlert.numeroPartida,
        codigoArticulo: targetAlert.codigoArticulo,
        descripcionArticulo: targetAlert.descripcionArticulo,
        solicitadas: solicitadasInput,
        invernadero: targetAlert.invernadero,
        subpartidas: subpartidasInput.map((sub, idx) => ({
          id: `subpartida-${Date.now()}-${idx}`,
          nombre: sub.nombre,
          germinadas: sub.germinadas,
        })),
        comentarios: [
          {
            id: `c-gen-${Date.now()}`,
            autor: "Sistema de Alertas",
            fecha: `${simulatedDate} 08:30`,
            texto: `Generada automáticamente al registrar recuento de germinación inferior al solicitado: ${totalGerminadas} de ${solicitadasInput} plantas.`,
          },
        ],
        estado: "pendiente",
      };

      setAlertasFaltante((prev) => [generatedShortage, ...prev]);
      setSuccessToast(
        `Recuento registrado. ¡Alerta de FALTANTE generada! (-${solicitadasInput - totalGerminadas} plantas)`,
      );
    } else {
      setSuccessToast(
        "Recuento registrado con éxito. Germinación completa (sin faltantes).",
      );
    }
  };

  // 3. Faltante estimado de plantas
  const handleFaltanteAddComment = (id: string, text: string) => {
    const authorName =
      userRole === "supervisor_habilitado"
        ? "Supervisor Habilitado"
        : "Operador";
    const timestamp =
      new Date().toLocaleDateString("es-ES") +
      " " +
      new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const newComment: Comentario = {
      id: `c-${Date.now()}`,
      autor: authorName,
      fecha: timestamp,
      texto: text,
    };

    setAlertasFaltante((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, comentarios: [...item.comentarios, newComment] };
        }
        return item;
      }),
    );
    setSuccessToast("Comentario agregado con éxito");
  };

  const handleFaltanteResolve = (id: string) => {
    if (userRole !== "supervisor_habilitado") {
      alert(
        "Error: Solo los supervisores habilitados están autorizados a resolver esta alerta.",
      );
      return;
    }

    const timestamp =
      new Date().toLocaleDateString("es-ES") +
      " " +
      new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });

    setAlertasFaltante((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            estado: "intervenido",
            intervenidoPor: "Supervisor Habilitado",
            fechaIntervencion: timestamp,
          };
        }
        return item;
      }),
    );
    setSuccessToast(
      "Faltante intervenido y aprobado por Supervisor. Alerta resuelta.",
    );
  };

  // 4. Falta pre expedición
  const handleLoadPreExpedicion = (id: string) => {
    setAlertasPreExpedicion((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, preExpedicionCargada: true };
        }
        return item;
      }),
    );
    setSuccessToast("Pre-expedición cargada con éxito. Alerta archivada.");
  };

  // --- NOTIFICATION MANAGEMENT ---
  const handleClearNotifications = () => {
    setNotifications([]);
    setSuccessToast("Historial de notificaciones limpiado.");
  };

  const handleClearNotificationItem = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // --- QUICK DATE CONFIGURATORS ---
  const handleQuickDateSelect = (date: string) => {
    setSimulatedDate(date);
    setSuccessToast(`Fecha del sistema cambiada a: ${formatSpanishDate(date)}`);
  };

  // --- CRUD SLIDEOVER CREATION HANDLER ---
  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPartida.trim()) {
      alert("Por favor ingrese un número de partida válido");
      return;
    }

    const id = `custom-${Date.now()}`;
    const partidaNum = formPartida.startsWith("P")
      ? formPartida
      : `P2026-${formPartida}`;

    if (formCategory === "siembra") {
      const newItem: AlertaSiembra = {
        id,
        numeroPartida: partidaNum,
        codigoArticulo: formArticulo,
        descripcionArticulo: formArtDesc,
        cantidadContenedores: Number(formCantidad) || 100,
        semanaSiembraProgramada: formSemana,
        comentarios: [],
        estado: "pendiente",
      };
      setAlertasSiembra((prev) => [newItem, ...prev]);
      setActiveTab("siembra");
    } else if (formCategory === "germinacion") {
      const newItem: AlertaGerminacion = {
        id,
        numeroPartida: partidaNum,
        codigoArticulo: formArticulo,
        descripcionArticulo: formArtDesc,
        cantidadContenedores: Number(formCantidad) || 100,
        invernadero: formInvernadero,
        fechaLimiteRecuento: formFechaRecuento,
        estado: "pendiente",
      };
      setAlertasGerminacion((prev) => [newItem, ...prev]);
      setActiveTab("germinacion");
    } else if (formCategory === "faltante") {
      const newItem: AlertaFaltante = {
        id,
        numeroPartida: partidaNum,
        codigoArticulo: formArticulo,
        descripcionArticulo: formArtDesc,
        solicitadas: formSolicitadas,
        invernadero: formInvernadero,
        subpartidas: [
          {
            id: `sub-${Date.now()}-1`,
            nombre: "Subpartida Principal",
            germinadas: Math.floor(formSolicitadas * 0.85),
          },
        ],
        comentarios: [],
        estado: "pendiente",
      };
      setAlertasFaltante((prev) => [newItem, ...prev]);
      setActiveTab("faltante");
    } else if (formCategory === "pre-expedicion") {
      const newItem: AlertaPreExpedicion = {
        id,
        numeroPartida: partidaNum,
        codigoArticulo: formArticulo,
        descripcionArticulo: formArtDesc,
        fechaEntrega: formFechaEntrega,
        responsableArea: formResponsable,
        emailResponsable: formEmail,
        preExpedicionCargada: false,
        notificacionEnviada: false,
      };
      setAlertasPreExpedicion((prev) => [newItem, ...prev]);
      setActiveTab("pre-expedicion");
    }

    // Reset fields & Close
    setFormPartida("");
    setShowCreateForm(false);
    setSuccessToast(
      `Nueva partida de simulación agregada con éxito para ${formCategory.toUpperCase()}`,
    );
  };

  // Article selection synchronizer
  const handleArticuloChange = (codigo: string) => {
    setFormArticulo(codigo);
    switch (codigo) {
      case "TOM-PER-05":
        setFormArtDesc("Tomate Perita Seleccionado");
        break;
      case "TOM-RAP-01":
        setFormArtDesc("Tomate Platense - Variedad Rápida");
        break;
      case "LECH-CRE-03":
        setFormArtDesc("Lechuga Crespa Verde");
        break;
      case "LECH-MAN-02":
        setFormArtDesc("Lechuga Mantecosa Premium");
        break;
      case "PIM-ROJ-01":
        setFormArtDesc("Pimiento Rojo Blocky");
        break;
      case "ALBA-GEN-04":
        setFormArtDesc("Albahaca Genovesa");
        break;
      default:
        setFormArtDesc("Artículo de Vivero");
    }
  };

  const handleResponsableChange = (area: string) => {
    setFormResponsable(area);
    switch (area) {
      case "Producción":
        setFormEmail("produccion@viveroalpha.com");
        break;
      case "Logística":
        setFormEmail("logistica@viveroalpha.com");
        break;
      case "Despacho":
        setFormEmail("despacho@viveroalpha.com");
        break;
      case "Siembra":
        setFormEmail("siembra@viveroalpha.com");
        break;
      default:
        setFormEmail("responsable@viveroalpha.com");
    }
  };

  // Restore defaults
  const handleResetData = () => {
    if (
      confirm(
        "¿Estás seguro de restablecer todos los datos originales? Se borrarán tus comentarios y cambios.",
      )
    ) {
      setAlertasSiembra(INITIAL_ALERTAS_SIEMBRA);
      setAlertasGerminacion(INITIAL_ALERTAS_GERMINACION);
      setAlertasFaltante(INITIAL_ALERTAS_FALTANTE);
      setAlertasPreExpedicion(INITIAL_ALERTAS_PRE_EXPEDICION);
      setNotifications([]);
      setSimulatedDate("2026-07-13");
      setSuccessToast("Datos del sistema restablecidos con éxito.");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] text-[#1e293b] overflow-hidden relative">
      {/* Toast Alert */}
      {successToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-[#1e293b]/20 animate-slide-in">
          <Check className="h-4 w-4 text-emerald-400 stroke-[3px]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* --- TOP BANNER/HEADER --- */}
      <header className="bg-white border-b border-[#e2e8f0] shrink-0 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-[#0f172a] text-white p-2.5 rounded-lg shadow-sm">
            <Layers className="h-5.5 w-5.5" />
          </div>
          <div className="text-left">
            <h1 className="text-base font-extrabold text-[#1e293b] tracking-tight">
              VIVERO ALPHA <span className="text-[#64748b] font-normal">|</span>{" "}
              Sistema de Alertas Operativas
            </h1>
            <p className="text-[11px] text-[#64748b] font-medium uppercase tracking-wider">
              Monitoreo y Control Operativo en Tiempo Real
            </p>
          </div>
        </div>

        {/* CONTROLS ZONE */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Calendar Simulator */}
          <div className="bg-[#f1f5f9] px-3 py-1.5 rounded-lg border border-[#e2e8f0] flex items-center gap-2 shadow-inner">
            <Calendar className="h-4 w-4 text-[#0f172a] shrink-0" />
            <div className="text-left leading-none">
              <span className="text-[9px] uppercase tracking-wider text-[#64748b] font-bold block">
                Fecha del Sistema
              </span>
              <span className="text-xs font-bold text-[#1e293b] font-mono">
                {simulatedDate} ({currentWeek.formatted})
              </span>
            </div>
            {/* Quick selectors to test the rules */}
            <div className="flex items-center gap-1 border-l border-[#e2e8f0] pl-2">
              <button
                onClick={() => handleQuickDateSelect("2026-07-13")}
                className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  simulatedDate === "2026-07-13"
                    ? "bg-[#0f172a] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200"
                }`}
                title="Lunes: Estado inicial de alertas"
              >
                Lun 13
              </button>
              <button
                onClick={() => handleQuickDateSelect("2026-07-15")}
                className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  simulatedDate === "2026-07-15"
                    ? "bg-[#0f172a] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200"
                }`}
                title="Miércoles: Se activan las pre-expediciones de la semana siguiente"
              >
                Mié 15 ⚡
              </button>
              <input
                type="date"
                value={simulatedDate}
                onChange={(e) =>
                  e.target.value && handleQuickDateSelect(e.target.value)
                }
                className="bg-white border border-[#e2e8f0] rounded text-xs px-1.5 py-0.5 font-mono focus:outline-hidden cursor-pointer"
                title="Seleccionar cualquier fecha"
              />
            </div>
          </div>

          {/* User Role Switcher */}
          <div className="bg-[#f1f5f9] px-3 py-1.5 rounded-lg border border-[#e2e8f0] flex items-center gap-2 shadow-inner">
            {userRole === "supervisor_habilitado" ? (
              <ShieldCheck className="h-4 w-4 text-[#0f172a]" />
            ) : (
              <User className="h-4 w-4 text-slate-500" />
            )}
            <div className="text-left leading-none">
              <span className="text-[9px] uppercase tracking-wider text-[#64748b] font-bold block">
                Rol de Usuario
              </span>
              <select
                value={userRole}
                onChange={(e) => {
                  setUserRole(e.target.value as RolUsuario);
                  setSuccessToast(
                    `Modo cambiado a: ${e.target.value.toUpperCase().replace("_", " ")}`,
                  );
                }}
                className="text-xs font-bold text-[#1e293b] bg-transparent border-0 p-0 focus:ring-0 focus:outline-hidden cursor-pointer"
              >
                <option value="operador">Operador estándar</option>
                <option value="supervisor_habilitado">
                  Supervisor Habilitado
                </option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* --- SYSTEM OVERVIEW / ALERTS SUMMARY --- */}
      <section className="bg-white border-b border-[#e2e8f0] shrink-0 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Metric widgets tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border cursor-pointer ${
              activeTab === "all"
                ? "bg-[#0f172a] border-[#0f172a] text-white shadow-xs"
                : "bg-[#fcfcfc] border-[#e2e8f0] text-[#64748b] hover:bg-slate-50 hover:text-[#1e293b]"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Todas las Alertas ({totalAlertasActivas})
          </button>

          <button
            onClick={() => setActiveTab("siembra")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border cursor-pointer ${
              activeTab === "siembra"
                ? "bg-[#ea580c] border-[#ea580c] text-white shadow-xs"
                : "bg-[#fcfcfc] border-[#e2e8f0] text-[#64748b] hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-mono font-extrabold ${
                activeSiembra.length > 0
                  ? "bg-orange-100 text-orange-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {activeSiembra.length}
            </span>
            Siembra Retrasada
          </button>

          <button
            onClick={() => setActiveTab("germinacion")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border cursor-pointer ${
              activeTab === "germinacion"
                ? "bg-[#0369a1] border-[#0369a1] text-white shadow-xs"
                : "bg-[#fcfcfc] border-[#e2e8f0] text-[#64748b] hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200"
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-mono font-extrabold ${
                activeGerminacion.length > 0
                  ? "bg-sky-100 text-sky-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {activeGerminacion.length}
            </span>
            Falta Recuento Germinación
          </button>

          <button
            onClick={() => setActiveTab("faltante")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border cursor-pointer ${
              activeTab === "faltante"
                ? "bg-[#be123c] border-[#be123c] text-white shadow-xs"
                : "bg-[#fcfcfc] border-[#e2e8f0] text-[#64748b] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-mono font-extrabold ${
                activeFaltante.length > 0
                  ? "bg-rose-100 text-rose-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {activeFaltante.length}
            </span>
            Faltante Estimado Plantas
          </button>

          <button
            onClick={() => setActiveTab("pre-expedicion")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border cursor-pointer ${
              activeTab === "pre-expedicion"
                ? "bg-[#6b21a8] border-[#6b21a8] text-white shadow-xs"
                : "bg-[#fcfcfc] border-[#e2e8f0] text-[#64748b] hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-mono font-extrabold ${
                activePreExpedicion.length > 0
                  ? "bg-purple-100 text-purple-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {activePreExpedicion.length}
            </span>
            Falta Pre-expedición
          </button>
        </div>

        {/* Control actions */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleResetData}
            className="text-xs font-bold text-[#64748b] hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Restaurar estado inicial"
          >
            Restablecer Datos
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Simular Nueva Partida
          </button>
        </div>
      </section>

      {/* --- MAIN CORE DASHBOARD BODY (Zero-Scroll Contained) --- */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 p-4 min-h-0 bg-[#f8fafc]">
        {/* Left/Center Pane: Active Alerts Cards */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs">
          {/* Header of Active lists */}
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] mb-4 shrink-0">
            <div>
              <h2 className="text-sm font-extrabold text-[#1e293b] flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-[#0f172a]" />
                Alertas Activas del Vivero — {formatSpanishDate(simulatedDate)}
              </h2>
              <p className="text-[11px] text-[#64748b]">
                Análisis automático de partidas que requieren atención inmediata
                en invernaderos.
              </p>
            </div>
            <div className="text-xs bg-[#f1f5f9] text-[#1e293b] font-mono px-2 py-1 rounded-md border border-[#e2e8f0] font-bold shrink-0">
              Total: {totalAlertasActivas}
            </div>
          </div>

          {/* Cards List container (Scrollable, Zero-Scroll compliant) */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1">
            {totalAlertasActivas === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center text-[#64748b]">
                <div className="h-14 w-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-3 border border-[#e2e8f0]">
                  <CheckCircle2 className="h-8 w-8 text-[#0f172a]" />
                </div>
                <h3 className="text-sm font-bold text-[#1e293b]">
                  ¡Todo al día en el Vivero!
                </h3>
                <p className="text-xs text-[#64748b] mt-1 max-w-sm leading-relaxed">
                  No hay alertas operativas pendientes. Pruebe a avanzar la
                  fecha del sistema o simular una nueva partida atrasada.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Siembra Retrasada */}
                {(activeTab === "all" || activeTab === "siembra") &&
                  activeSiembra.map((alerta) => (
                    <SiembraRetrasadaCard
                      key={alerta.id}
                      alerta={alerta}
                      onAddComment={handleSiembraAddComment}
                      onMarkSowed={handleSiembraMarkSowed}
                      onCancel={handleSiembraCancel}
                    />
                  ))}

                {/* 2. Falta Recuento Germinación */}
                {(activeTab === "all" || activeTab === "germinacion") &&
                  activeGerminacion.map((alerta) => (
                    <FaltaGerminacionCard
                      key={alerta.id}
                      alerta={alerta}
                      onRegisterGermination={handleRegisterGermination}
                    />
                  ))}

                {/* 3. Faltante Estimado de Plantas */}
                {(activeTab === "all" || activeTab === "faltante") &&
                  activeFaltante.map((alerta) => (
                    <FaltantePlantasCard
                      key={alerta.id}
                      alerta={alerta}
                      onAddComment={handleFaltanteAddComment}
                      onResolve={handleFaltanteResolve}
                      userRole={userRole}
                    />
                  ))}

                {/* 4. Falta Pre Expedición */}
                {(activeTab === "all" || activeTab === "pre-expedicion") &&
                  activePreExpedicion.map((alerta) => (
                    <FaltaPreExpedicionCard
                      key={alerta.id}
                      alerta={alerta}
                      onLoadPreExpedicion={handleLoadPreExpedicion}
                      currentDateStr={simulatedDate}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Notifications Auditoría Center */}
        <div className="w-full lg:w-96 shrink-0 flex flex-col h-[280px] lg:h-full min-h-0">
          <NotificationCenter
            notifications={notifications}
            onClearAll={handleClearNotifications}
            onClearItem={handleClearNotificationItem}
          />
        </div>
      </main>

      {/* --- BUSINESS RULE DOCUMENTATION BAR (Footer) --- */}
      <footer className="bg-slate-900 border-t border-slate-800 shrink-0 px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-bold text-emerald-400 text-left">
            Reglas del Sistema:
          </span>
          <span className="text-left">
            ⏳ <strong>Siembra:</strong> Se elimina al sembrar o anular.
          </span>
          <span className="text-left">
            🌱 <strong>Germinación:</strong> Alerta activa al vencer recuento.
          </span>
          <span className="text-left">
            📉 <strong>Faltante:</strong> Se calcula sumando subpartidas.
            Requiere Supervisor.
          </span>
          <span className="text-left">
            🚚 <strong>Pre-Exp:</strong> Miércoles previo a entrega, con correos
            automáticos.
          </span>
        </div>
        <div className="font-mono text-slate-500 text-right">
          Vivero Alpha v2.5 — UTC 2026
        </div>
      </footer>

      {/* --- CRUD SLIDEOVER FORM (Simulation tool) --- */}
      {showCreateForm && (
        <div className="absolute inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          {/* Backdrop click closer */}
          <div
            className="flex-1"
            onClick={() => setShowCreateForm(false)}
          ></div>

          {/* Form Content */}
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-in relative">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Simular Creación de Partida
                </h3>
                <p className="text-[11px] text-slate-500">
                  Crea una nueva partida en el sistema para forzar el disparo de
                  alertas.
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Fields (Scrollable body) */}
            <form
              onSubmit={handleCreateAlert}
              className="flex-1 overflow-y-auto p-4 space-y-4 text-left"
            >
              {/* Category selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Tipo de Alerta a Simular
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as "siembra" | "germinacion" | "faltante" | "pre-expedicion")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-emerald-500 text-slate-700"
                >
                  <option value="siembra">Siembra Retrasada</option>
                  <option value="germinacion">
                    Falta Recuento Germinación
                  </option>
                  <option value="faltante">Faltante Estimado de Plantas</option>
                  <option value="pre-expedicion">Falta Pre-expedición</option>
                </select>
              </div>

              {/* Number of Batch */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Número de Partida
                </label>
                <div className="flex">
                  <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 font-mono">
                    P2026-
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="4450"
                    value={formPartida}
                    onChange={(e) =>
                      setFormPartida(e.target.value.replace(/\D/g, ""))
                    }
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-r-lg px-3 py-1.5 text-xs font-mono font-bold focus:outline-hidden focus:border-emerald-500 text-slate-700"
                  />
                </div>
              </div>

              {/* Article Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Artículo de Semillero
                </label>
                <select
                  value={formArticulo}
                  onChange={(e) => handleArticuloChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-emerald-500 text-slate-700"
                >
                  <option value="TOM-PER-05">TOM-PER-05 — Tomate Perita</option>
                  <option value="TOM-RAP-01">
                    TOM-RAP-01 — Tomate Platense Rápido
                  </option>
                  <option value="LECH-CRE-03">
                    LECH-CRE-03 — Lechuga Crespa
                  </option>
                  <option value="LECH-MAN-02">
                    LECH-MAN-02 — Lechuga Mantecosa Premium
                  </option>
                  <option value="PIM-ROJ-01">
                    PIM-ROJ-01 — Pimiento Rojo Blocky
                  </option>
                  <option value="ALBA-GEN-04">
                    ALBA-GEN-04 — Albahaca Genovesa
                  </option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Desc: {formArtDesc}
                </span>
              </div>

              {/* Category Specific Inputs */}
              {formCategory === "siembra" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Cantidad Contenedores
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formCantidad}
                        onChange={(e) =>
                          setFormCantidad(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Semana Programada
                      </label>
                      <select
                        value={formSemana}
                        onChange={(e) => setFormSemana(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden text-slate-700"
                      >
                        <option value="2026-W26">
                          2026-W26 (Dos semanas atrás)
                        </option>
                        <option value="2026-W27">
                          2026-W27 (Semana anterior)
                        </option>
                        <option value="2026-W28">
                          2026-W28 (Semana actual)
                        </option>
                        <option value="2026-W29">
                          2026-W29 (Siguiente semana)
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-[11px] text-amber-800 leading-normal">
                    💡 La alerta aparecerá si la semana programada es anterior a
                    la semana actual del sistema (
                    <strong>{currentWeek.formatted}</strong>).
                  </div>
                </>
              )}

              {formCategory === "germinacion" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Invernadero asignado
                      </label>
                      <input
                        type="text"
                        value={formInvernadero}
                        onChange={(e) => setFormInvernadero(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Cantidad Contenedores
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formCantidad}
                        onChange={(e) =>
                          setFormCantidad(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden text-slate-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Fecha Límite Recuento Germinación
                    </label>
                    <input
                      type="date"
                      value={formFechaRecuento}
                      onChange={(e) => setFormFechaRecuento(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden text-slate-700 font-mono"
                    />
                  </div>
                  <div className="bg-teal-50 border border-teal-100 p-3 rounded-lg text-[11px] text-teal-800 leading-normal">
                    💡 La alerta se activará si la fecha actual es igual o
                    posterior a la fecha límite ingresada.
                  </div>
                </>
              )}

              {formCategory === "faltante" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Plantas Solicitadas
                      </label>
                      <input
                        type="number"
                        min={100}
                        step={100}
                        value={formSolicitadas}
                        onChange={(e) =>
                          setFormSolicitadas(
                            Math.max(100, parseInt(e.target.value) || 100),
                          )
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Invernadero
                      </label>
                      <input
                        type="text"
                        value={formInvernadero}
                        onChange={(e) => setFormInvernadero(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden text-slate-700"
                      />
                    </div>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-[11px] text-rose-800 leading-normal">
                    💡 Se creará con una subpartida única que representa el 85%
                    de germinación del pedido, generando así un faltante
                    estimado automático del 15%.
                  </div>
                </>
              )}

              {formCategory === "pre-expedicion" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Área Responsable
                      </label>
                      <select
                        value={formResponsable}
                        onChange={(e) =>
                          handleResponsableChange(e.target.value)
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden text-slate-700"
                      >
                        <option value="Producción">Producción</option>
                        <option value="Logística">Logística</option>
                        <option value="Despacho">Despacho</option>
                        <option value="Siembra">Siembra</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Correo de contacto
                      </label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-hidden text-slate-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Fecha Programada de Entrega
                    </label>
                    <input
                      type="date"
                      required
                      value={formFechaEntrega}
                      onChange={(e) => setFormFechaEntrega(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden text-slate-700 font-mono"
                    />
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-[11px] text-indigo-800 leading-normal">
                    💡 La pre-expedición se alertará a partir del{" "}
                    <strong>miércoles de la semana anterior</strong> a la fecha
                    de entrega, enviando en ese instante la notificación al
                    correo configurado.
                  </div>
                </>
              )}

              {/* Action Buttons inside body to prevent overlap */}
              <div className="pt-4 border-t border-[#e2e8f0] flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 text-xs font-bold py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 text-xs font-bold py-2.5 bg-[#0f172a] hover:bg-slate-800 rounded-lg text-white transition-colors cursor-pointer"
                >
                  Confirmar Partida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

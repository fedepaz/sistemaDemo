// shared/src/schemas/field-labels.ts
// Spanish labels for form fields — used by SlideOverForm to display
// human-readable field names instead of raw camelCase keys.

export const fieldLabels: Record<string, Record<string, string>> = {
  // ── Auth ──────────────────────────────────────────────────────────
  LoginAuth: {
    username: "Usuario",
    password: "Contraseña",
  },
  RegisterAuth: {
    username: "Usuario",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo electrónico",
  },
  ChangePassword: {
    currentPassword: "Contraseña actual",
    newPassword: "Nueva contraseña",
  },

  // ── User ──────────────────────────────────────────────────────────
  UpdateUserProfile: {
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo electrónico",
  },

  // ── Permissions ───────────────────────────────────────────────────
  CreateEntity: {
    name: "Nombre",
    label: "Etiqueta",
    permissionType: "Tipo de permiso",
  },

  // ── Sustratos ─────────────────────────────────────────────────────
  CreateSustrato: {
    nombre: "Nombre",
  },

  // ── Mezclas ───────────────────────────────────────────────────────
  CreateMezcla: {
    sustrato1Id: "Sustrato 1",
    porcentaje1: "Porcentaje 1",
    sustrato2Id: "Sustrato 2",
    porcentaje2: "Porcentaje 2",
    sustrato3Id: "Sustrato 3",
    porcentaje3: "Porcentaje 3",
    sustrato4Id: "Sustrato 4",
    porcentaje4: "Porcentaje 4",
  },

  // ── Extendidos ────────────────────────────────────────────────────
  AsignarUbiExtendido: {
    partidaId: "Partida",
    anio: "Año",
    indice: "Índice",
    ubicacion: "Cámara de germinación",
    stock_ini: "Stock inicial",
    detalle: "Detalle",
    baja: "Bajas",
    extendido: "Extendido",
    edita: "Edita",
  },

  // ── Siembra ───────────────────────────────────────────────────────
  AsignarUbiSiembra: {
    partidaId: "Partida",
    anio: "Año",
    indice: "Índice",
    cg: "Cámara de germinación",
    cantidaNroCont: "Cantidad",
    f_siembra: "Fecha de siembra",
    detalleExtendido: "Detalle extendido",
    edita: "Edita",
  },
  CreateSiembraPartida: {
    metodoMaquina: "Método/Máquina",
    prensadoSemilla: "Prensado",
    profundidadSemilla: "Profundidad de semilla",
    tratamientoSemilla: "Tratamiento de semilla",
    mezclaId: "Mezcla",
  },
  AsignarUbiSiembraCompleta: {
    partidaId: "Partida",
    anio: "Año",
    indice: "Índice",
    cg: "Cámara de germinación",
    cantidaNroCont: "Cantidad",
    f_siembra: "Fecha de siembra",
    detalleExtendido: "Detalle extendido",
    lote: "Lote",
    anoLote: "Año lote",
    item: "Item",
    semxgr: "Semillas/gr",
    ajuste: "Ajuste",
    cantidadGrs: "Cantidad (gr)",
    edita: "Edita",
    metodoMaquina: "Método",
    prensadoSemilla: "Prensado",
    profundidadSemilla: "Profundidad de semilla",
    tratamientoSemilla: "Tratamiento de semilla",
    mezclaId: "Mezcla",
    entityId: "Entidad",
    startTime: "Hora de inicio",
    endTime: "Hora de fin",
    employeeUserIds: "Empleados",
  },

  // ── Siembra Partidas (data table columns) ─────────────────────────
  SiembraPartida: {
    partidaId: "Partida",
    codigoEspecie: "Código",
    nombreEspecie: "Especie",
    lote: "Lote",
    cg: "Cámara",
    cantidaNroCont: "Cantidad",
    fSiembra: "F.Siembra",
    createdAt: "Creado",
    usuarioNombre: "Usuario",
    metodoMaquina: "Método",
    prensadoSemilla: "Prensado",
    profundidadSemilla: "Profundidad",
    tratamientoSemilla: "Tratamiento",
    tratamientoNombre: "Tratamiento",
    mezclaNombre: "Mezcla",
    detalleExtendido: "Detalle",
    stockLote: "Stock Lote",
    stockAnio: "Stock Año",
    stockEntradasAntes: "Entradas Antes",
    stockSalidasAntes: "Salidas Antes",
    stockEntradasDespues: "Entradas Después",
    stockSalidasDespues: "Salidas Después",
    entityId: "Entidad",
    entityNombre: "Entidad",
    startTime: "Hora Inicio",
    endTime: "Hora Fin",
    empleados: "Empleados",
  },

  // ── Audit Log (data table columns) ────────────────────────────────
  AuditLog: {
    action: "Acción",
    user: "Usuario",
    changes: "Cambios",
    timestamp: "Fecha",
    ipAddress: "IP",
    userAgent: "Dispositivo",
  },

  // ── User (data table columns) ─────────────────────────────────────
  User: {
    fullName: "Nombre Completo",
    email: "Correo Electrónico",
    status: "Estado",
    createdAt: "Creado",
  },

  // ── Entity (data table columns) ───────────────────────────────────
  Entity: {
    name: "Nombre",
    label: "Etiqueta",
    status: "Estado",
    permissionType: "Tipo de permiso",
  },

  // ── Extendidos (data table columns) ───────────────────────────────
  Extendido: {
    partidaId: "Partida",
    codigoEspecie: "Código",
    nombreEspecie: "Especie",
    nrocont: "Cantidad",
    codigoCamaraGerminacion: "Nº de Cámara",
    fechaSugeridaSiembra: "Siembra Sugerida",
    fechaSiembraReal: "Siembra Real",
    fechaEgresoCamara: "Fecha a Extender",
    diasEnCamara: "Días",
  },

  // ── Mezclas (data table columns) ──────────────────────────────────
  Mezcla: {
    sustrato1Nombre: "Sustrato 1",
    porcentaje1: "% 1",
    sustrato2Nombre: "Sustrato 2",
    porcentaje2: "% 2",
    sustrato3Nombre: "Sustrato 3",
    porcentaje3: "% 3",
    sustrato4Nombre: "Sustrato 4",
    porcentaje4: "% 4",
    createdAt: "Fecha de creación",
  },

  // ── Siembra (data table columns) ──────────────────────────────────
  SiembraLegacy: {
    partidaId: "Partida",
    codigoEspecie: "Código",
    nombreEspecie: "Especie",
    propiedad: "P/L",
    sem_siembra: "Sem Siem",
    nrocont: "Cantidad",
    anoLoteLote: "Año/Lote",
    semxgr: "Gr ",
    c: "C",
    g: "G",
    fechaSugeridaSiembra: "Siembra Sugerida",
    fechaSiembraReal: "Siembra Real",
  },

  // ── ASembrar ──────────────────────────────────────────────────────
  ASembrar: {
    partidaId: "Partida",
    codigoEspecie: "Código",
    nombreEspecie: "Especie",
    cantidaNroCont: "Cantidad",
    fSiembra: "F. Siembra",
    createdAt: "Creado",
    usuarioNombre: "Autorizado por",
    metodoMaquina: "Método",
    prensadoSemilla: "Prensado",
    profundidadSemilla: "Profundidad",
    tratamientoSemilla: "Tratamiento",
    tratamientoNombre: "Tratamiento",
    mezclaId: "Mezcla",
    mezclaNombre: "Mezcla",
    entityId: "Entidad",
    entityNombre: "Entidad",
    startTime: "Hora Inicio",
    endTime: "Hora Fin",
    employeeUserIds: "Empleados",
    empleados: "Empleados",
  },

  // ── Alert Columns (shared across alert types) ─────────────────────
  AlertColumns: {
    partidaId: "Partida",
    codigoEspecie: "Código",
    nombreEspecie: "Especie",
    nrocont: "Cantidad",
    propiedad: "Propiedad",
    fechaSugeridaSiembra: "Siembra Sugerida",
    semSiembra: "Sem. Siembra",
    fPrimer: "F. Primer",
    solicito: "Solicitó",
    producido: "Producido",
    diferencia: "Diferencia",
    fPreexp: "Pre-exp.",
  },

  // ── Sustratos (data table columns) ────────────────────────────────
  Sustrato: {
    nombre: "Nombre",
    createdAt: "Fecha de creación",
  },

  // ── Task Shift ────────────────────────────────────────────────────
  CreateTaskShiftBase: {
    entityId: "Entidad",
    startTime: "Hora de inicio",
    endTime: "Hora de fin",
    employeeUserIds: "Empleados",
  },

  // ── Alert Comments ────────────────────────────────────────────────
  CreateAlertComment: {
    content: "Comentario",
  },
};

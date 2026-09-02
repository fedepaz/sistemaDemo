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
    presionSemilla: "Presión",
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
    edita: "Edita",
    metodoMaquina: "Método",
    presionSemilla: "Presión",
    profundidadSemilla: "Profundidad de semilla",
    tratamientoSemilla: "Tratamiento de semilla",
    mezclaId: "Mezcla",
    entityId: "Entidad",
    startTime: "Hora de inicio",
    endTime: "Hora de fin",
    employeeUserIds: "Empleados",
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

// packages/shared/src/schemas/__tests__/field-labels.spec.ts
import { fieldLabels } from "../field-labels";

/**
 * These are the data table names that MUST have a fieldLabels entry.
 * When you add a new data table with a `columnLabels` prop, add its
 * table name here so the test enforces label coverage.
 *
 * Format: { tableName: [...expectedColumnIds] }
 */
const DATA_TABLE_COLUMNS: Record<string, string[]> = {
  SiembraPartida: [
    "partidaId",
    "codigoEspecie",
    "nombreEspecie",
    "lote",
    "cg",
    "cantidaNroCont",
    "fSiembra",
    "usuarioNombre",
    "metodoMaquina",
    "prensadoSemilla",
    "profundidadSemilla",
    "tratamientoSemilla",
    "tratamientoNombre",
    "mezclaNombre",
    "detalleExtendido",
    "stockLote",
    "stockAnio",
    "stockEntradasAntes",
    "stockSalidasAntes",
    "stockEntradasDespues",
    "stockSalidasDespues",
    "entityId",
    "entityNombre",
    "startTime",
    "endTime",
    "empleados",
  ],
  AuditLog: ["action", "user", "changes", "timestamp", "ipAddress", "userAgent"],
  User: ["fullName", "email", "status", "createdAt"],
  Entity: ["name", "label", "status", "permissionType"],
  Extendido: [
    "partidaId",
    "codigoEspecie",
    "nombreEspecie",
    "nrocont",
    "codigoCamaraGerminacion",
    "fechaSugeridaSiembra",
    "fechaSiembraReal",
    "fechaEgresoCamara",
    "diasEnCamara",
  ],
  Mezcla: [
    "sustrato1Nombre",
    "porcentaje1",
    "sustrato2Nombre",
    "porcentaje2",
    "sustrato3Nombre",
    "porcentaje3",
    "sustrato4Nombre",
    "porcentaje4",
    "createdAt",
  ],
  SiembraLegacy: [
    "partidaId",
    "codigoEspecie",
    "nombreEspecie",
    "propiedad",
    "sem_siembra",
    "nrocont",
    "anoLoteLote",
    "semxgr",
    "c",
    "g",
    "fechaSugeridaSiembra",
    "fechaSiembraReal",
  ],
  AlertColumns: [
    "partidaId",
    "codigoEspecie",
    "nombreEspecie",
    "nrocont",
    "propiedad",
    "fechaSugeridaSiembra",
    "semSiembra",
    "fPrimer",
    "solicito",
    "producido",
    "diferencia",
    "fPreexp",
  ],
  Sustrato: ["nombre", "createdAt"],
};

describe("fieldLabels", () => {
  it("has no empty label values", () => {
    const emptyLabels: string[] = [];

    for (const [tableName, columns] of Object.entries(fieldLabels)) {
      for (const [columnId, label] of Object.entries(columns)) {
        if (!label || label.trim() === "") {
          emptyLabels.push(`${tableName}.${columnId}`);
        }
      }
    }

    expect(emptyLabels).toEqual([]);
  });

  it.each(Object.entries(DATA_TABLE_COLUMNS))(
    "has labels for all %s data table columns",
    (tableName, expectedColumns) => {
      const labels = fieldLabels[tableName];

      expect(labels).toBeDefined();
      expect(typeof labels).toBe("object");

      const missingColumns: string[] = [];

      for (const columnId of expectedColumns) {
        if (!labels[columnId] || labels[columnId].trim() === "") {
          missingColumns.push(columnId);
        }
      }

      if (missingColumns.length > 0) {
        throw new Error(
          `Missing label entries in fieldLabels.${tableName} for columns: ${missingColumns.join(", ")}`,
        );
      }
    },
  );
});

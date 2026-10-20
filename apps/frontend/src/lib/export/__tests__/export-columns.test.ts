import type { ExportColumn } from "@/lib/export/types";
import { partidaSiembraExportColumns } from "@/features/programacionSiembra/components/columns";
import { aSembrarExportColumns } from "@/features/aSembrar/components/columns";
import { partidaExportColumns } from "@/features/extendidos/components/columns";
import { siembraPartidasRegistradasExportColumns } from "@/features/siembraPartidas/components/columns";
import { productoExportColumns } from "@/features/productos/components/columns";
import { formulaExportColumns } from "@/features/formulas/components/columns";
import { userExportColumns } from "@/features/users/components/columns";
import { auditLogExportColumns } from "@/features/auditLogs/components/columns";
import {
  siembraRetrasadaExportColumns,
  faltaGerminacionExportColumns,
  faltantePlantasExportColumns,
  faltaPreExpedicionExportColumns,
} from "@/features/alerts/components/shared/alert-columns";

// Every PDF export table must fill the page exactly: pdfWidth percentages
// must sum to 100%. Over 100% clips columns off the right edge of the page;
// under 100% leaves the table short and inconsistent between exports.
const exportArrays: Array<[string, ExportColumn<never>[]]> = [
  ["programacionSiembra", partidaSiembraExportColumns as ExportColumn<never>[]],
  ["aSembrar", aSembrarExportColumns as ExportColumn<never>[]],
  ["extendidos", partidaExportColumns as ExportColumn<never>[]],
  [
    "siembraPartidasRegistradas",
    siembraPartidasRegistradasExportColumns as ExportColumn<never>[],
  ],
  ["productos", productoExportColumns as ExportColumn<never>[]],
  ["formulas", formulaExportColumns as ExportColumn<never>[]],
  ["users", userExportColumns as ExportColumn<never>[]],
  ["auditLogs", auditLogExportColumns as ExportColumn<never>[]],
  ["alerts/siembraRetrasada", siembraRetrasadaExportColumns as ExportColumn<never>[]],
  ["alerts/faltaGerminacion", faltaGerminacionExportColumns as ExportColumn<never>[]],
  ["alerts/faltantePlantas", faltantePlantasExportColumns as ExportColumn<never>[]],
  ["alerts/faltaPreExpedicion", faltaPreExpedicionExportColumns as ExportColumn<never>[]],
];

describe("export columns pdfWidth totals", () => {
  it.each(exportArrays)("%s sums to exactly 100%", (_name, columns) => {
    const total = columns.reduce((sum, col) => {
      expect(col.pdfWidth).toMatch(/^\d+%$/);
      return sum + parseInt(String(col.pdfWidth), 10);
    }, 0);

    expect(total).toBe(100);
  });
});

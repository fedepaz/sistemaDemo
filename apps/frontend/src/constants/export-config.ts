// src/constants/export-config.ts
import { PDF_THEME } from "@/lib/export/pdf-theme";

export const EXPORT_CONFIG = {
  company: {
    name: "Proplanta S.A.",
    tagline: "El mejor comienzo para sus cultivos",
    logoUrl: "/images/logo-big-removebg-preview.png",
  },
  pdf: {
    ...PDF_THEME,
    fontSize: 6,
    margins: { top: 85, bottom: 30, left: 30, right: 30 },
    pageSize: "A4" as const,
  },
  csv: {
    delimiter: ",",
  },
  excel: {
    sheetName: "Datos",
  },
} as const;

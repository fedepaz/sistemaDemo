// src/constants/export-config.ts

export const EXPORT_CONFIG = {
  company: {
    name: "Proplanta S.A.",
    logoUrl: "/images/logo-big-removebg-preview.png",
  },
  pdf: {
    primaryColor: "#16a34a",
    headerBg: "#f0fdf4",
    fontSize: 10,
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    pageSize: "A4" as const,
  },
  csv: {
    delimiter: ",",
  },
  excel: {
    sheetName: "Datos",
  },
} as const;

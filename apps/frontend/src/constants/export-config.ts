// src/constants/export-config.ts

export const EXPORT_CONFIG = {
  company: {
    name: "Proplanta S.A.",
    tagline: "El mejor comienzo para sus cultivos",
    logoUrl: "/images/logo-big-removebg-preview.png",
  },
  pdf: {
    primaryColor: "#16a34a",
    headerBg: "#f0fdf4",
    fontSize: 10,
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

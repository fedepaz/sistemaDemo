// apps/frontend/src/lib/config/company.ts

export const COMPANY_DATA = {
  nombre: "PROPLANTA S.A.",
  direccion: "QUINTANA 4690",
  localidad: "EL ALGARROBAL LAS HERAS",
  provincia: "MENDOZA",
  telefono: "(0261) 490-7017/7018/7019",
  mail: "proplanta@com.ar",
  pais: "ARGENTINA",
  codPos: "5541",
  situacion: "R. Inscripto",
  cuit: "30-69470646-7",
  ingBrutos: "CM 913-508097",
  tipo: "Empresa Agropecuaria",
} as const;

export type CompanyData = typeof COMPANY_DATA;

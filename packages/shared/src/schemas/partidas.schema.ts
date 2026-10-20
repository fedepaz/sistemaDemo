// shared/src/schemas/partidas.schema.ts
import { z } from "zod";
import { PartidaHeaderSchema } from "./legacy-header.schema";
import { CreateSiembraPartidaSchema } from "./siembraPartida.schema";
import { CreateTaskShiftBaseSchema } from "./taskShift.schema";

export const AsignarUbiExtendidoDtoSchema = PartidaHeaderSchema.extend({
  ubicacion: z
    .number({ message: "Debe seleccionar una ubicación válida" })
    .int({ message: "La ubicación debe ser un número entero" })
    .positive({ message: "Debe seleccionar una ubicación válida" }),
  stock_ini: z
    .number({ message: "El stock inicial debe ser un número entero" })
    .int({ message: "El stock inicial debe ser un número entero" })
    .nonnegative({ message: "El stock inicial no puede ser negativo" }),
  detalle: z
    .string()
    .max(30, { message: "El detalle no puede superar los 30 caracteres" })
    .optional()
    .default(""),
  baja: z
    .number()
    .int()
    .nonnegative({
      message: "El número de bajas debe ser un número entero positivo",
    })
    .optional()
    .default(0),
  extendido: z.string().default(""),
  edita: z.string().optional(),
});
export type AsignarUbiExtendidoDto = z.infer<
  typeof AsignarUbiExtendidoDtoSchema
>;

export const AsignarUbiSiembraDtoSchema = PartidaHeaderSchema.extend({
  cg: z
    .number({ message: "Debe seleccionar una ubicación válida" })
    .int({ message: "La ubicación (CG) debe ser un número entero" })
    .positive({ message: "Debe seleccionar una ubicación válida" }),
  cantidaNroCont: z
    .number({
      message: "La cantidad de nro. de contenedor debe ser un número entero",
    })
    .int({
      message: "La cantidad de nro. de contenedor debe ser un número entero",
    })
    .positive({ message: "La cantidad debe ser mayor a 0" }),
  detalleExtendido: z
    .string()
    .max(5000, { message: "El detalle no puede superar los 5000 caracteres" })
    .optional()
    .default(""),
  lote: z.number({ message: "El lote es requerido" }),
  anoLote: z.number({ message: "El año del lote es requerido" }),
  item: z.number({ message: "El item es requerido" }),
  semxgr: z.number({ message: "Las semillas por gramo son requeridas" }),
  cantidadGrs: z
    .number({ message: "Los gramos utilizados son requeridos" })
    .positive({
      message: "Los gramos utilizados deben ser mayores a 0",
    }),
  fSiembra: z
    .string({ message: "La fecha de siembra es requerida" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "La fecha de siembra debe tener formato YYYY-MM-DD",
    })
    .refine(
      (s) => {
        const [y, m, d] = s.split("-").map(Number);
        const t = new Date(Date.UTC(y, m - 1, d));
        return (
          t.getUTCFullYear() === y &&
          t.getUTCMonth() === m - 1 &&
          t.getUTCDate() === d
        );
      },
      { message: "La fecha de siembra no es una fecha válida" },
    )
    .refine(
      (s) => {
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return s <= today;
      },
      { message: "La fecha de siembra no puede ser futura" },
    ),
  edita: z.string().optional(),
});

export type AsignarUbiSiembraDto = z.infer<typeof AsignarUbiSiembraDtoSchema>;

export const AsignarUbiSiembraPartialDtoSchema =
  AsignarUbiSiembraDtoSchema.merge(CreateSiembraPartidaSchema);

export type AsignarUbiSiembraPartialDto = z.infer<
  typeof AsignarUbiSiembraPartialDtoSchema
>;
export const AsignarUbiSiembraCompletaDtoSchema =
  AsignarUbiSiembraPartialDtoSchema.merge(CreateTaskShiftBaseSchema);

export type AsignarUbiSiembraCompletaDto = z.infer<
  typeof AsignarUbiSiembraCompletaDtoSchema
>;

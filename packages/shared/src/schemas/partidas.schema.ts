// shared/src/schemas/partidas.schema.ts
import { z } from "zod";
import { PartidaHeaderSchema } from "./legacy-header.schema";
import { CreateSiembraPartidaSchema } from "./siembraPartida.schema";
import { CreateTaskShiftBaseSchema } from "./taskShift.schema";

export const AsignarUbiExtendidoDtoSchema = PartidaHeaderSchema.extend({
  ubicacion: z
    .number()
    .int({ message: "La ubicación debe ser un número entero" })
    .positive({ message: "Debe seleccionar una ubicación válida" }),
  stock_ini: z
    .number()
    .int({ message: "El stock inicial debe ser un número entero" })
    .nonnegative({ message: "El stock inicial no puede ser negativo" }),
  detalle: z
    .string()
    .max(30, { message: "El detalle no puede superar los 30 caracteres" })
    .optional()
    .default(""),
  baja: z.number().int().nonnegative().optional().default(0),
  extendido: z.string().default(""),
  edita: z.string().optional(),
});
export type AsignarUbiExtendidoDto = z.infer<
  typeof AsignarUbiExtendidoDtoSchema
>;

export const AsignarUbiSiembraDtoSchema = PartidaHeaderSchema.extend({
  cg: z
    .number()
    .int({ message: "La ubicación (CG) debe ser un número entero" })
    .positive({ message: "Debe seleccionar una ubicación válida" }),
  cantidaNroCont: z
    .number()
    .int({
      message: "La cantidad de nro. de contenedor debe ser un número entero",
    })
    .positive({ message: "La cantidad debe ser mayor a 0" }),
  f_siembra: z.coerce.date({ message: "La fecha de siembra es requerida" }),
  detalleExtendido: z
    .string()
    .max(5000, { message: "El detalle no puede superar los 5000 caracteres" })
    .optional()
    .default(""),
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

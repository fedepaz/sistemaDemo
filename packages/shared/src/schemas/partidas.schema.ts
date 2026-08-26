// shared/src/schemas/partidas.schema.ts
import { z } from "zod";
import { PartidaHeaderSchema } from "./legacy-header.schema";
import { CreateSiembraPartidaSchema } from "./siembraPartida.schema";
import { TaskShiftSchema } from "./taskShift.schema";

export const AsignarUbiExtendidoDtoSchema = PartidaHeaderSchema.extend({
  ubicacion: z.number().int().positive(),
  stock_ini: z.number().int().nonnegative(),
  detalle: z
    .string()
    .max(30, "El detalle no puede superar los 30 caracteres")
    .optional()
    .default(""),
  baja: z.number().int().nonnegative().optional().default(0),
  extendido: z.string().default(""), // For long notes
  edita: z.string().optional(),
});
export type AsignarUbiExtendidoDto = z.infer<
  typeof AsignarUbiExtendidoDtoSchema
>;

export const AsignarUbiSiembraDtoSchema = PartidaHeaderSchema.extend({
  cg: z.number().int().positive(),
  cantidaNroCont: z.number().int().positive(),
  f_siembra: z.coerce.date(),
  detalle: z
    .string()
    .max(30, "El detalle no puede superar los 30 caracteres")
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
  AsignarUbiSiembraPartialDtoSchema.merge(TaskShiftSchema);

export type AsignarUbiSiembraCompletaDto = z.infer<
  typeof AsignarUbiSiembraCompletaDtoSchema
>;

import { z } from "zod";

/**
 * Schema for a Partida record from the legacy system.
 * Includes all fields found in the legacy database.
 */
export const PartidaSchema = z.object({
  id: z.number(), // partida
  productCode: z.string(), // espvar
  productName: z.string(), // viene de especie.nombre
  suggestedSowingDate: z.string(), // f_siem
  actualSowingDate: z.string(), // f_siembra
  daysInChamber: z.number().nullable(), // calculado
  traysSown: z.number(), // cant_s
  greenhouseCode: z.string(), // contenedor
  traysExtended: z.number(), // cant_e
  // ... otros que necesites
});

/**
 * Data Transfer Object for Partida records.
 * Used for communication between backend and frontend.
 */
export type PartidaDto = z.infer<typeof PartidaSchema>;

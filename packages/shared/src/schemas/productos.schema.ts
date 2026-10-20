// shared/src/schemas/productos.schema.ts

import { z } from "zod";
import { requiredCuid } from "./cuid.schema";

export const ProductoSchema = z.object({
  id: requiredCuid("El producto"),
  nombre: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  deletedByUserId: z.string().nullable(),
  deletedByUsername: z.string().nullable(),
});

export type ProductoDto = z.infer<typeof ProductoSchema>;

export const CreateProductoSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre del producto es requerido" }),
});

export type CreateProductoDto = z.infer<typeof CreateProductoSchema>;

export const UpdateProductoSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre del producto es requerido" }).optional(),
});

export type UpdateProductoDto = z.infer<typeof UpdateProductoSchema>;

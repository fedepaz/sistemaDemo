// packages/shared/src/schemas/billboard.schema.ts

import { z } from "zod";
import { cuidSchema } from "./cuid.schema";

// ============================================================================
// BILLBOARD MESSAGE (read DTO — what the API returns to the user)
// ============================================================================

export const BillboardMessageSchema = z.object({
  id: cuidSchema,
  title: z.string(),
  body: z.string(),
  tag: z.string(),
  createdAt: z.string(),
});

export type BillboardMessageDto = z.infer<typeof BillboardMessageSchema>;

// ============================================================================
// MARK BILLBOARD READ (request body)
// ============================================================================

export const MarkBillboardReadSchema = z.object({
  messageIds: z.array(cuidSchema).optional(),
});

export type MarkBillboardReadDto = z.infer<typeof MarkBillboardReadSchema>;

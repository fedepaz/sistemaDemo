import { z } from 'zod';

export const LocaleSchema = z.object({
  code: z.string().min(2).max(10), // e.g., "en", "es-ES"
  name: z.string().min(1),
  is_active: z.boolean().default(true),
});

export type Locale = z.infer<typeof LocaleSchema>;

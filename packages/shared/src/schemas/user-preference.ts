import { z } from 'zod';

export const UserPreferenceSchema = z.object({
  user_id: z.string().min(1),
  preferred_locale_code: z.string().min(2).max(10),
});

export type UserPreference = z.infer<typeof UserPreferenceSchema>;

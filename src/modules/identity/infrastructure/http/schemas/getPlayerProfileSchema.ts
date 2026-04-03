import { z } from 'zod';

export const getPlayerProfileSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid player ID format.').optional(),
  }),
});

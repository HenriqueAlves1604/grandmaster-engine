import { z } from 'zod';

export const refreshAccessTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required.'),
  }),
});

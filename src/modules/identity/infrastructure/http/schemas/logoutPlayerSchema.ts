import { z } from 'zod';

export const logoutPlayerSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required to logout.'),
  }),
});

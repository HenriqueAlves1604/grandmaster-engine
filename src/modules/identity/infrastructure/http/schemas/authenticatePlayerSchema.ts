import { z } from 'zod';

export const authenticatePlayerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format.'),
    rawPassword: z.string().min(1, 'Password is required.'),
  }),
});

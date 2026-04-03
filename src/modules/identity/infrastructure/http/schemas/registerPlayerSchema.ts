import { z } from 'zod';

export const registerPlayerSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    email: z.string().email('Invalid email format'),
    rawPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export type RegisterPlayerDTO = z.infer<typeof registerPlayerSchema>['body'];

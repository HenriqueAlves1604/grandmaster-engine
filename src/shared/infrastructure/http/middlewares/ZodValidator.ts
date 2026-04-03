import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

/**
 * Express middleware to validate request data against a generic Zod schema.
 */
export const validate =
  (schema: z.ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      next(error);
    }
  };

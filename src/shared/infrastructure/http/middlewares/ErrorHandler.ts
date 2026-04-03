import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../errors/AppError.js';
import { ConflictError } from '../../../errors/ConflictError.js';
import { NotFoundError } from '../../../errors/NotFoundError.js';
import { ValidationError } from '../../../errors/ValidationError.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.name, message: error.message });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.name, message: error.message });
    return;
  }

  if (error instanceof ConflictError) {
    res.status(409).json({ error: error.name, message: error.message });
    return;
  }

  // Fallback for any other mapped domain error that doesn't fit the categories above
  if (error instanceof AppError) {
    res.status(400).json({ error: error.name, message: error.message });
    return;
  }

  // Unmapped/Unexpected errors (Database crash, syntax error, etc.)
  console.error('[GlobalErrorHandler]:', error);
  res.status(500).json({ error: 'InternalServerError', message: 'An unexpected error occurred.' });
}

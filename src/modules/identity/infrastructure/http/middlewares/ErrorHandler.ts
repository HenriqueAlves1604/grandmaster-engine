import { InvalidEmailError } from '@modules/identity/domain/errors/InvalidEmailError.js';
import { PlayerAlreadyExistsError } from '@modules/identity/domain/errors/PlayerAlreadyExistsError.js';
import type { NextFunction, Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(error: Error, req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof InvalidEmailError) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof PlayerAlreadyExistsError) {
    res.status(409).json({ error: error.message });
    return;
  }

  console.error('[GlobalErrorHandler]:', error);
  res.status(500).json({ error: 'Internal server error.' });
}

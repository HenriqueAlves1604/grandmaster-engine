import { UnauthorizedError } from '@shared/errors/UnauthorizedError.js';
import type { NextFunction, Request, Response } from 'express';
import { JwtTokenAdapter } from '../../../../modules/identity/infrastructure/adapters/JwtTokenAdapter.js';

export class EnsureAuthenticated {
  private tokenAdapter: JwtTokenAdapter;

  constructor() {
    this.tokenAdapter = new JwtTokenAdapter();
  }

  /**
   * Express middleware to intercept requests, validate the JWT,
   * and inject the player ID into the request object.
   */
  public handle = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(new UnauthorizedError('JWT token is missing.'));
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      return next(new UnauthorizedError('Malformed token string.'));
    }

    const decodedPayload = this.tokenAdapter.verifyToken(token);

    if (!decodedPayload || typeof decodedPayload.sub !== 'string') {
      return next(new UnauthorizedError('Invalid or expired token.'));
    }

    req.player = {
      id: decodedPayload.sub,
    };

    next();
  };
}

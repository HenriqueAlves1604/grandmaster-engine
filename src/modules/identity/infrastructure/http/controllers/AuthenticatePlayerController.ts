import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatePlayerUseCase } from '../../../application/use-cases/AuthenticatePlayerUseCase.js';

export class AuthenticatePlayerController {
  private authenticatePlayerUseCase: AuthenticatePlayerUseCase;

  constructor(authenticatePlayerUseCase: AuthenticatePlayerUseCase) {
    this.authenticatePlayerUseCase = authenticatePlayerUseCase;
  }

  /**
   * Handles the HTTP request for player authentication.
   */
  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, rawPassword } = req.body;

      const result = await this.authenticatePlayerUseCase.execute({
        email,
        rawPassword,
      });

      res.status(200).json({
        message: 'Authentication successful.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

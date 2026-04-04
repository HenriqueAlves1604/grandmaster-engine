import type { NextFunction, Request, Response } from 'express';
import type { LogoutPlayerUseCase } from '../../../application/use-cases/LogoutPlayerUseCase.js';

export class LogoutPlayerController {
  private logoutPlayerUseCase: LogoutPlayerUseCase;

  constructor(logoutPlayerUseCase: LogoutPlayerUseCase) {
    this.logoutPlayerUseCase = logoutPlayerUseCase;
  }

  /**
   * Handles the HTTP request to revoke a refresh token and end the session.
   */
  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      await this.logoutPlayerUseCase.execute({
        refreshToken,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

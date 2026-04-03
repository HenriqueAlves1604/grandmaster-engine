import { UnauthorizedError } from '@shared/errors/UnauthorizedError.js';
import type { NextFunction, Request, Response } from 'express';
import type { GetPlayerProfileUseCase } from '../../../application/use-cases/GetPlayerProfileUseCase.js';

export class GetPlayerProfileController {
  private getPlayerProfileUseCase: GetPlayerProfileUseCase;

  constructor(getPlayerProfileUseCase: GetPlayerProfileUseCase) {
    this.getPlayerProfileUseCase = getPlayerProfileUseCase;
  }

  /**
   * Handles the HTTP request to fetch the authenticated player's profile data.
   */
  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.player || !req.player.id) {
        throw new UnauthorizedError('Player context is missing from request.');
      }

      const playerId = req.player.id;

      const profile = await this.getPlayerProfileUseCase.execute({
        id: playerId,
      });

      res.status(200).json({
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };
}

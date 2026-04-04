import type { NextFunction, Request, Response } from 'express';
import type { RefreshAccessTokenUseCase } from '../../../application/use-cases/RefreshAccessTokenUseCase.js';

export class RefreshAccessTokenController {
  private refreshAccessTokenUseCase: RefreshAccessTokenUseCase;

  constructor(refreshAccessTokenUseCase: RefreshAccessTokenUseCase) {
    this.refreshAccessTokenUseCase = refreshAccessTokenUseCase;
  }

  /**
   * Handles the HTTP request to rotate the refresh token and issue a new access token.
   */
  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      const result = await this.refreshAccessTokenUseCase.execute({
        refreshToken,
      });

      res.status(200).json({
        message: 'Tokens rotated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

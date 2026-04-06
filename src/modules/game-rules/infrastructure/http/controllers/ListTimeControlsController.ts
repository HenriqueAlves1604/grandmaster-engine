import type { NextFunction, Request, Response } from 'express';
import type { ListTimeControlsUseCase } from '../../../application/use-cases/ListTimeControlsUseCase.js';

export class ListTimeControlsController {
  private listTimeControlsUseCase: ListTimeControlsUseCase;

  constructor(listTimeControlsUseCase: ListTimeControlsUseCase) {
    this.listTimeControlsUseCase = listTimeControlsUseCase;
  }

  /**
   * Handles the HTTP request to fetch all available chess time controls.
   */
  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const timeControls = await this.listTimeControlsUseCase.execute();

      res.status(200).json({
        data: timeControls,
      });
    } catch (error) {
      next(error);
    }
  };
}

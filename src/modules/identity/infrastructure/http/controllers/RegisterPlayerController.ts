import type { Request, Response } from 'express';
import type { RegisterPlayerUseCase } from '../../../application/use-cases/RegisterPlayerUseCase.js';
import { PlayerPresenter } from '../presenters/PlayerPresenter.js';
import type { RegisterPlayerDTO } from '../schemas/registerPlayerSchema.js';

export class RegisterPlayerController {
  constructor(private readonly registerPlayerUseCase: RegisterPlayerUseCase) {}

  public handle = async (req: Request, res: Response): Promise<void> => {
    const payload: RegisterPlayerDTO = req.body;

    const player = await this.registerPlayerUseCase.execute(payload);

    res.status(201).json({
      message: 'Player registered successfully.',
      player: PlayerPresenter.toHTTP(player),
    });
  };
}

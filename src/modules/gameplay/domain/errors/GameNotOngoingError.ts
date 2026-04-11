import { ConflictError } from '@shared/errors/ConflictError.js';

export class GameNotOngoingError extends ConflictError {
  constructor(currentStatus: string) {
    super(`Cannot execute action. The game is currently in state: ${currentStatus}.`);
  }
}

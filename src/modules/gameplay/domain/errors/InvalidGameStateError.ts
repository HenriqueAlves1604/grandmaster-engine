import { ConflictError } from '@shared/errors/ConflictError.js';

export class InvalidGameStateError extends ConflictError {
  constructor(action: string, currentStatus: string) {
    super(`Cannot ${action}. The game is currently in state: ${currentStatus}.`);
  }
}

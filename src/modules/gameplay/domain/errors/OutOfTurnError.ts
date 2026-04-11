import { ConflictError } from '@shared/errors/ConflictError.js';

export class OutOfTurnError extends ConflictError {
  constructor() {
    super('It is not your turn to move.');
  }
}

import { ValidationError } from '@shared/errors/ValidationError.js';

export class InvalidMoveError extends ValidationError {
  constructor(move: string) {
    super(`The move ${move} is illegal in the current board position.`);
  }
}

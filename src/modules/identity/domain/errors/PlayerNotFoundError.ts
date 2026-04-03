import { NotFoundError } from '@shared/errors/NotFoundError.js';

export class PlayerNotFoundError extends NotFoundError {
  constructor() {
    super('Player not found');
  }
}

import { ConflictError } from '@shared/errors/ConflictError.js';

export class PlayerAlreadyExistsError extends ConflictError {
  constructor(identifier: string) {
    super(`Player with identifier '${identifier}' already exists.`);
  }
}

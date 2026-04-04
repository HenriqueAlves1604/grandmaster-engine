import { ValidationError } from '@shared/errors/ValidationError.js';

export class InvalidCredentialsError extends ValidationError {
  constructor() {
    super('Invalid email or password.');
  }
}

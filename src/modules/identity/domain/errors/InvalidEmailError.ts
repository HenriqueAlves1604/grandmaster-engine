import { ValidationError } from '@shared/errors/ValidationError.js';

export class InvalidEmailError extends ValidationError {
  constructor(email: string) {
    super(`The provided email '${email}' is not a valid format.`);
  }
}

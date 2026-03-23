import { ValidationError } from '@shared/errors/ValidationError.js';

export class InvalidPasswordError extends ValidationError {
  constructor(message: string = 'Password does not meet security requirements.') {
    super(message);
  }
}

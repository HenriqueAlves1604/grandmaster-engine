import { ValidationError } from '@shared/errors/ValidationError.js';

export class Password {
  private value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Factory method to create and validate a Password Value Object.
   */
  public static create(rawPassword: string): Password {
    if (!rawPassword) {
      throw new ValidationError('Password cannot be empty.');
    }

    if (rawPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long.');
    }

    const hasUppercase = /[A-Z]/.test(rawPassword);
    const hasLowercase = /[a-z]/.test(rawPassword);
    const hasNumber = /[0-9]/.test(rawPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      throw new ValidationError(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
      );
    }

    return new Password(rawPassword);
  }

  /**
   * Retrieves the raw password string.
   * This should only be used to pass the value to the Hasher Port.
   */
  public getValue(): string {
    return this.value;
  }
}

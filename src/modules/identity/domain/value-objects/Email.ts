import { InvalidEmailError } from '../errors/InvalidEmailError.js';
import validator from 'validator';

export class Email {
  private value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Factory method to create and validate an Email Value Object.
   */
  public static create(email: string): Email {
    const cleanEmail = email.trim().toLowerCase();

    if (!validator.isEmail(cleanEmail)) {
      throw new InvalidEmailError(email);
    }

    return new Email(cleanEmail);
  }

  /**
   * Extracts the primitive value.
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compares two Email Value Objects for equality.
   */
  public equals(otherEmail: Email): boolean {
    return this.value === otherEmail.getValue();
  }
}

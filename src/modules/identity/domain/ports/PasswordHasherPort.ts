import type { Password } from '../value-objects/Password.js';

export interface PasswordHasherPort {
  /**
   * Takes a valid Password Value Object and returns a secure hash string.
   */
  hash(password: Password): Promise<string>;

  /**
   * Compares a raw string password against a stored hash.
   * Useful during the login process.
   */
  compare(rawPassword: string, hash: string): Promise<boolean>;
}

import type { PasswordHasherPort } from '@modules/identity/domain/ports/PasswordHasherPort.js';
import bcrypt from 'bcrypt';
import type { Password } from '../../domain/value-objects/Password.js';

export class BcryptPasswordHasher implements PasswordHasherPort {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 12) {
    this.saltRounds = saltRounds;
  }

  /**
   * Hashes a secure Password Value Object using Bcrypt.
   */
  public async hash(password: Password): Promise<string> {
    const rawPassword = password.getValue();
    return bcrypt.hash(rawPassword, this.saltRounds);
  }

  /**
   * Compares a raw string password against a stored Bcrypt hash.
   */
  public async compare(rawPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, hash);
  }
}

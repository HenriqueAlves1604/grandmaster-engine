import type { PasswordHasherPort } from '@modules/identity/domain/ports/PasswordHasherPort.js';
import type { Password } from '../../domain/value-objects/Password.js';

export class FakePasswordHasher implements PasswordHasherPort {
  public async hash(password: Password): Promise<string> {
    return `${password.getValue()}_hashed`;
  }

  public async compare(rawPassword: string, hash: string): Promise<boolean> {
    return `${rawPassword}_hashed` === hash;
  }
}

import { beforeEach, describe, expect, it } from 'vitest';
import { Password } from '../../domain/value-objects/Password.js';
import { BcryptPasswordHasher } from './BcryptPasswordHasher.js';

describe('BcryptPasswordHasher Adapter', () => {
  let hasher: BcryptPasswordHasher;
  const rawPasswordString = 'Grandmaster123!';

  beforeEach(() => {
    // Using a lower salt round for faster tests. In production, it defaults to 12.
    hasher = new BcryptPasswordHasher(4);
  });

  it('should generate a valid bcrypt hash from a Password value object', async () => {
    const password = Password.create(rawPasswordString);
    const hash = await hasher.hash(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(rawPasswordString);
    expect(hash.startsWith('$2b$')).toBe(true); // Bcrypt standard prefix
  });

  it('should return true when comparing correct password with hash', async () => {
    const password = Password.create(rawPasswordString);
    const hash = await hasher.hash(password);

    const isMatch = await hasher.compare(rawPasswordString, hash);
    expect(isMatch).toBe(true);
  });

  it('should return false when comparing incorrect password with hash', async () => {
    const password = Password.create(rawPasswordString);
    const hash = await hasher.hash(password);

    const isMatch = await hasher.compare('WrongPassword123!', hash);
    expect(isMatch).toBe(false);
  });
});

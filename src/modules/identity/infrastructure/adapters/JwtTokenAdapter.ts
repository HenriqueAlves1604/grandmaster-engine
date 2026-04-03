import type { TokenProviderPort } from '@modules/identity/domain/ports/TokenProviderPort.js';
import { ValidationError } from '@shared/errors/ValidationError.js';
import jwt, { type SignOptions } from 'jsonwebtoken';

export class JwtTokenAdapter implements TokenProviderPort {
  private readonly secret: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new ValidationError('JWT_SECRET environment variable is not defined.');
    }

    this.secret = secret;
  }

  public generateToken(payload: Record<string, unknown>, expiresIn: string): string {
    return jwt.sign(payload, this.secret, { expiresIn } as SignOptions);
  }

  public verifyToken(token: string): Record<string, unknown> | null {
    try {
      return jwt.verify(token, this.secret) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

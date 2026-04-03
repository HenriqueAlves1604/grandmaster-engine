export interface TokenProviderPort {
  /**
   * Generates a signed JWT for a given payload.
   */
  generateToken(payload: Record<string, unknown>, expiresIn: string): string;

  /**
   * Verifies and decodes a JWT. Returns null if invalid or expired.
   */
  verifyToken(token: string): Record<string, unknown> | null;
}

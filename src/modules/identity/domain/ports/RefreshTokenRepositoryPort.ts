import type { RefreshToken } from '../entities/RefreshToken.js';

export interface RefreshTokenRepositoryPort {
  save(refreshToken: RefreshToken): Promise<void>;
  findByToken(token: string): Promise<RefreshToken | null>;
  deleteByToken(token: string): Promise<void>;
  deleteAllByPlayerId(playerId: string): Promise<void>;
}

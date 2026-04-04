import { describe, expect, it } from 'vitest';
import { RefreshToken } from './RefreshToken.js';

describe('RefreshToken Entity', () => {
  it('should create a new refresh token with future expiration', () => {
    const playerId = 'player-uuid';
    const refreshToken = RefreshToken.create(playerId, 7);
    const snapshot = refreshToken.getSnapshot();

    expect(snapshot.token).toHaveLength(80); // 40 bytes hex string
    expect(snapshot.playerId).toBe(playerId);
    expect(snapshot.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('should correctly identify an expired token', () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);

    const token = RefreshToken.restore({
      id: 'any-id',
      token: 'any-token',
      playerId: 'player-id',
      expiresAt: pastDate,
      createdAt: new Date(),
    });

    expect(token.isExpired()).toBe(true);
  });
});

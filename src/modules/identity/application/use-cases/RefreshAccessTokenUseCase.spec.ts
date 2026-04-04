import type { PlayerRepositoryPort } from '@modules/identity/domain/ports/PlayerRepositoryPort.js';
import type { RefreshTokenRepositoryPort } from '@modules/identity/domain/ports/RefreshTokenRepositoryPort.js';
import type { TokenProviderPort } from '@modules/identity/domain/ports/TokenProviderPort.js';
import { UnauthorizedError } from '@shared/errors/UnauthorizedError.js';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { Player } from '../../domain/entities/Player.js';
import { RefreshToken } from '../../domain/entities/RefreshToken.js';
import { RefreshAccessTokenUseCase } from './RefreshAccessTokenUseCase.js';

describe('RefreshAccessTokenUseCase', () => {
  let playerRepository: Mocked<PlayerRepositoryPort>;
  let refreshTokenRepository: Mocked<RefreshTokenRepositoryPort>;
  let tokenProvider: Mocked<TokenProviderPort>;
  let sut: RefreshAccessTokenUseCase;

  beforeEach(() => {
    playerRepository = {
      findById: vi.fn(),
    } as unknown as Mocked<PlayerRepositoryPort>;

    refreshTokenRepository = {
      findByToken: vi.fn(),
      deleteByToken: vi.fn(),
      save: vi.fn(),
    } as unknown as Mocked<RefreshTokenRepositoryPort>;

    tokenProvider = {
      generateToken: vi.fn(),
    } as unknown as Mocked<TokenProviderPort>;

    sut = new RefreshAccessTokenUseCase(playerRepository, refreshTokenRepository, tokenProvider);
  });

  it('should rotate tokens successfully', async () => {
    const oldToken = RefreshToken.create('player-123');
    const player = Player.create('username', 'email@test.com', 'hash');

    // Now TypeScript knows these are vi.fn() and allows mockResolvedValue
    refreshTokenRepository.findByToken.mockResolvedValue(oldToken);
    playerRepository.findById.mockResolvedValue(player);
    tokenProvider.generateToken.mockReturnValue('new-access-token');

    const result = await sut.execute({ refreshToken: oldToken.getSnapshot().token });

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBeDefined();
    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith(oldToken.getSnapshot().token);
    expect(refreshTokenRepository.save).toHaveBeenCalled();
  });

  it('should throw UnauthorizedError if token is expired', async () => {
    const expiredToken = RefreshToken.restore({
      id: 'id',
      token: 'token',
      playerId: 'p',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() - 1000),
    });

    refreshTokenRepository.findByToken.mockResolvedValue(expiredToken);

    await expect(sut.execute({ refreshToken: 'token' })).rejects.toThrow(UnauthorizedError);
  });
});

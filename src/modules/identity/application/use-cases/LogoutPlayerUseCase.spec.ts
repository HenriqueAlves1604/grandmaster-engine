import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import type { RefreshTokenRepositoryPort } from '../../domain/ports/RefreshTokenRepositoryPort.js';
import { LogoutPlayerUseCase } from './LogoutPlayerUseCase.js';

describe('LogoutPlayerUseCase', () => {
  let refreshTokenRepository: Mocked<RefreshTokenRepositoryPort>;
  let sut: LogoutPlayerUseCase;

  beforeEach(() => {
    refreshTokenRepository = {
      findByToken: vi.fn(),
      deleteByToken: vi.fn(),
      save: vi.fn(),
      deleteAllByPlayerId: vi.fn(),
    } as unknown as Mocked<RefreshTokenRepositoryPort>;

    sut = new LogoutPlayerUseCase(refreshTokenRepository);
  });

  it('should successfully delete the refresh token from the database', async () => {
    const tokenToRevoke = 'secure-refresh-token-string';

    refreshTokenRepository.deleteByToken.mockResolvedValue(undefined);

    await sut.execute({ refreshToken: tokenToRevoke });

    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledOnce();
    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith(tokenToRevoke);
  });
});

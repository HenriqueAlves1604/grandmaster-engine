import { UnauthorizedError } from '@shared/errors/UnauthorizedError.js';
import { RefreshToken } from '../../domain/entities/RefreshToken.js';
import type { PlayerRepositoryPort } from '../../domain/ports/PlayerRepositoryPort.js';
import type { RefreshTokenRepositoryPort } from '../../domain/ports/RefreshTokenRepositoryPort.js';
import type { TokenProviderPort } from '../../domain/ports/TokenProviderPort.js';

interface RefreshRequestDTO {
  refreshToken: string;
}

interface RefreshResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export class RefreshAccessTokenUseCase {
  constructor(
    private readonly playerRepository: PlayerRepositoryPort,
    private readonly refreshTokenRepository: RefreshTokenRepositoryPort,
    private readonly tokenProvider: TokenProviderPort,
  ) {}

  public async execute(request: RefreshRequestDTO): Promise<RefreshResponseDTO> {
    const storedToken = await this.refreshTokenRepository.findByToken(request.refreshToken);

    if (!storedToken || storedToken.isExpired()) {
      if (storedToken) {
        await this.refreshTokenRepository.deleteByToken(storedToken.getSnapshot().token);
      }
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }

    const { playerId } = storedToken.getSnapshot();
    const player = await this.playerRepository.findById(playerId);

    if (!player) {
      throw new UnauthorizedError('Player associated with token not found.');
    }

    const playerSnapshot = player.getSnapshot();

    await this.refreshTokenRepository.deleteByToken(request.refreshToken);

    const accessToken = this.tokenProvider.generateToken(
      { sub: playerSnapshot.id, username: playerSnapshot.username },
      '15m',
    );

    const newRefreshToken = RefreshToken.create(playerId);
    await this.refreshTokenRepository.save(newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken.getSnapshot().token,
    };
  }
}

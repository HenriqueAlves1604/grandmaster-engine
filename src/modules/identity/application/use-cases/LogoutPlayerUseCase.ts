import type { RefreshTokenRepositoryPort } from '../../domain/ports/RefreshTokenRepositoryPort.js';

export interface LogoutPlayerRequestDTO {
  refreshToken: string;
}

export class LogoutPlayerUseCase {
  private refreshTokenRepository: RefreshTokenRepositoryPort;

  constructor(refreshTokenRepository: RefreshTokenRepositoryPort) {
    this.refreshTokenRepository = refreshTokenRepository;
  }

  /**
   * Invalidates a session by completely removing the refresh token from the database.
   * This guarantees the token cannot be used to issue new access tokens.
   */
  public async execute(request: LogoutPlayerRequestDTO): Promise<void> {
    await this.refreshTokenRepository.deleteByToken(request.refreshToken);
  }
}

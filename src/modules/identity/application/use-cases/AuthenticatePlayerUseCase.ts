import { RefreshToken } from '@modules/identity/domain/entities/RefreshToken.js';
import type { PasswordHasherPort } from '@modules/identity/domain/ports/PasswordHasherPort.js';
import type { PlayerRepositoryPort } from '@modules/identity/domain/ports/PlayerRepositoryPort.js';
import type { RefreshTokenRepositoryPort } from '@modules/identity/domain/ports/RefreshTokenRepositoryPort.js';
import { InvalidCredentialsError } from '../../domain/errors/InvalidCredentialsError.js';
import type { TokenProviderPort } from '../../domain/ports/TokenProviderPort.js';
import { Email } from '../../domain/value-objects/Email.js';

export interface AuthenticatePlayerRequestDTO {
  email: string;
  rawPassword: string;
}

export interface AuthenticatePlayerResponseDTO {
  token: string;
  refreshToken: string;
  player: {
    id: string;
    username: string;
    email: string;
  };
}

export class AuthenticatePlayerUseCase {
  private playerRepository: PlayerRepositoryPort;
  private passwordHasher: PasswordHasherPort;
  private tokenProvider: TokenProviderPort;
  private refreshTokenRepository: RefreshTokenRepositoryPort;

  constructor(
    playerRepository: PlayerRepositoryPort,
    passwordHasher: PasswordHasherPort,
    tokenProvider: TokenProviderPort,
    refreshTokenRepository: RefreshTokenRepositoryPort,
  ) {
    this.playerRepository = playerRepository;
    this.passwordHasher = passwordHasher;
    this.tokenProvider = tokenProvider;
    this.refreshTokenRepository = refreshTokenRepository;
  }

  /**
   * Orchestrates the authentication of a player.
   * Returns a short-lived JWT, a long-lived Refresh Token, and basic player info.
   */
  public async execute(
    request: AuthenticatePlayerRequestDTO,
  ): Promise<AuthenticatePlayerResponseDTO> {
    const emailVo = Email.create(request.email);

    const player = await this.playerRepository.findByEmail(emailVo.getValue());

    if (!player) {
      throw new InvalidCredentialsError();
    }

    const playerSnapshot = player.getSnapshot();

    const isPasswordValid = await this.passwordHasher.compare(
      request.rawPassword,
      playerSnapshot.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Short-lived Access Token
    const accessToken = this.tokenProvider.generateToken(
      { sub: playerSnapshot.id, username: playerSnapshot.username },
      '15m',
    );

    // Long-lived Refresh Token
    const refreshToken = RefreshToken.create(playerSnapshot.id);
    await this.refreshTokenRepository.save(refreshToken);

    return {
      token: accessToken,
      refreshToken: refreshToken.getSnapshot().token,
      player: {
        id: playerSnapshot.id,
        username: playerSnapshot.username,
        email: playerSnapshot.email,
      },
    };
  }
}

import type { PasswordHasherPort } from '@modules/identity/domain/ports/PasswordHasherPort.js';
import type { PlayerRepositoryPort } from '@modules/identity/domain/ports/PlayerRepositoryPort.js';
import { InvalidCredentialsError } from '../../domain/errors/InvalidCredentialsError.js';
import type { TokenProviderPort } from '../../domain/ports/TokenProviderPort.js';
import { Email } from '../../domain/value-objects/Email.js';

export interface AuthenticatePlayerRequestDTO {
  email: string;
  rawPassword: string;
}

export interface AuthenticatePlayerResponseDTO {
  token: string;
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

  constructor(
    playerRepository: PlayerRepositoryPort,
    passwordHasher: PasswordHasherPort,
    tokenProvider: TokenProviderPort,
  ) {
    this.playerRepository = playerRepository;
    this.passwordHasher = passwordHasher;
    this.tokenProvider = tokenProvider;
  }

  /**
   * Orchestrates the authentication of a player.
   * Returns a JWT and basic player info if successful, throws InvalidCredentialsError otherwise.
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

    const token = this.tokenProvider.generateToken(
      { sub: playerSnapshot.id, username: playerSnapshot.username },
      '24h',
    );

    return {
      token,
      player: {
        id: playerSnapshot.id,
        username: playerSnapshot.username,
        email: playerSnapshot.email,
      },
    };
  }
}

import type { PasswordHasherPort } from '@modules/identity/domain/ports/PasswordHasherPort.js';
import type { PlayerRepositoryPort } from '@modules/identity/domain/ports/PlayerRepositoryPort.js';
import { InvalidCredentialsError } from '../../domain/errors/InvalidCredentialsError.js';
import { Email } from '../../domain/value-objects/Email.js';

export interface AuthenticatePlayerRequestDTO {
  email: string;
  rawPassword: string;
}

export interface AuthenticatePlayerResponseDTO {
  id: string;
  username: string;
  email: string;
}

export class AuthenticatePlayerUseCase {
  private playerRepository: PlayerRepositoryPort;
  private passwordHasher: PasswordHasherPort;

  constructor(playerRepository: PlayerRepositoryPort, passwordHasher: PasswordHasherPort) {
    this.playerRepository = playerRepository;
    this.passwordHasher = passwordHasher;
  }

  /**
   * Orchestrates the authentication of a player.
   * Returns basic player info if successful, throws InvalidCredentialsError otherwise.
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

    return {
      id: playerSnapshot.id,
      username: playerSnapshot.username,
      email: playerSnapshot.email,
    };
  }
}

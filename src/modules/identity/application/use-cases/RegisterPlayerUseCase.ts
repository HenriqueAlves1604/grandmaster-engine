import type { PasswordHasherPort } from '@modules/identity/domain/ports/PasswordHasherPort.js';
import type { PlayerRepositoryPort } from '@modules/identity/domain/ports/PlayerRepositoryPort.js';
import { Player } from '../../domain/entities/Player.js';
import { PlayerStats } from '../../domain/entities/PlayerStats.js';
import { PlayerAlreadyExistsError } from '../../domain/errors/PlayerAlreadyExistsError.js';
import { Email } from '../../domain/value-objects/Email.js';
import { Password } from '../../domain/value-objects/Password.js';

export interface RegisterPlayerRequestDTO {
  username: string;
  email: string;
  rawPassword: string;
}

export class RegisterPlayerUseCase {
  private playerRepository: PlayerRepositoryPort;
  private passwordHasher: PasswordHasherPort;

  constructor(playerRepository: PlayerRepositoryPort, passwordHasher: PasswordHasherPort) {
    this.playerRepository = playerRepository;
    this.passwordHasher = passwordHasher;
  }

  public async execute(request: RegisterPlayerRequestDTO): Promise<Player> {
    const emailVo = Email.create(request.email);
    const passwordVo = Password.create(request.rawPassword);

    const existingPlayer = await this.playerRepository.findByEmailOrUsername(
      emailVo.getValue(),
      request.username,
    );

    if (existingPlayer) {
      const snapshot = existingPlayer.getSnapshot();

      if (snapshot.email === emailVo.getValue()) {
        throw new PlayerAlreadyExistsError('Email address is already in use.');
      }

      if (snapshot.username === request.username) {
        throw new PlayerAlreadyExistsError('Username is already taken.');
      }
    }

    const hashedPassword = await this.passwordHasher.hash(passwordVo);

    const player = Player.create(request.username, emailVo.getValue(), hashedPassword);
    const playerSnapshot = player.getSnapshot();
    const playerStats = PlayerStats.create(playerSnapshot.id);

    await this.playerRepository.save(player, playerStats);

    return player;
  }
}

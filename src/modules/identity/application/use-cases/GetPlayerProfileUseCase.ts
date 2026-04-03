import { PlayerStats } from '../../domain/entities/PlayerStats.js';
import { PlayerNotFoundError } from '../../domain/errors/PlayerNotFoundError.js';
import type { PlayerRepositoryPort } from '../../domain/ports/PlayerRepositoryPort.js';

export interface GetPlayerProfileRequestDTO {
  id: string;
}

export interface GetPlayerProfileResponseDTO {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  stats: {
    currentElo: number;
    highestElo: number;
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
  };
}

export class GetPlayerProfileUseCase {
  private playerRepository: PlayerRepositoryPort;

  constructor(playerRepository: PlayerRepositoryPort) {
    this.playerRepository = playerRepository;
  }

  /**
   * Orchestrates the retrieval of a player's identity and competitive statistics.
   * Throws PlayerNotFoundError if the requested identity does not exist.
   */
  public async execute(request: GetPlayerProfileRequestDTO): Promise<GetPlayerProfileResponseDTO> {
    const player = await this.playerRepository.findById(request.id);

    if (!player) {
      throw new PlayerNotFoundError();
    }

    let stats = await this.playerRepository.findStatsByPlayerId(request.id);

    // Self-healing pattern
    if (!stats) {
      stats = PlayerStats.create(request.id);
    }

    const playerSnapshot = player.getSnapshot();
    const statsSnapshot = stats.getSnapshot();

    return {
      id: playerSnapshot.id,
      username: playerSnapshot.username,
      email: playerSnapshot.email,
      createdAt: playerSnapshot.createdAt,
      stats: {
        currentElo: statsSnapshot.currentElo,
        highestElo: statsSnapshot.highestElo,
        totalMatches: statsSnapshot.totalMatches,
        wins: statsSnapshot.wins,
        losses: statsSnapshot.losses,
        draws: statsSnapshot.draws,
      },
    };
  }
}

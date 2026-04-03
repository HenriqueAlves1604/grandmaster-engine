import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Player } from '../../domain/entities/Player.js';
import { PlayerStats } from '../../domain/entities/PlayerStats.js';
import { PlayerNotFoundError } from '../../domain/errors/PlayerNotFoundError.js';
import type { PlayerRepositoryPort } from '../../domain/ports/PlayerRepositoryPort.js';
import { GetPlayerProfileUseCase } from './GetPlayerProfileUseCase.js';

describe('GetPlayerProfileUseCase', () => {
  let playerRepository: PlayerRepositoryPort;
  let sut: GetPlayerProfileUseCase;

  const playerId = 'existing-uuid';

  beforeEach(() => {
    playerRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      findByEmailOrUsername: vi.fn(),
      findStatsByPlayerId: vi.fn(),
    } as unknown as PlayerRepositoryPort;

    sut = new GetPlayerProfileUseCase(playerRepository);
  });

  it('should return a complete profile when player and stats exist', async () => {
    const player = Player.restore({
      id: playerId,
      username: 'magnus',
      email: 'magnus@chess.com',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const stats = PlayerStats.restore({
      playerId,
      currentElo: 1500,
      highestElo: 1600,
      totalMatches: 10,
      wins: 8,
      losses: 1,
      draws: 1,
      updatedAt: new Date(),
    });

    vi.spyOn(playerRepository, 'findById').mockResolvedValue(player);
    vi.spyOn(playerRepository, 'findStatsByPlayerId').mockResolvedValue(stats);

    const response = await sut.execute({ id: playerId });

    expect(response.id).toBe(playerId);
    expect(response.username).toBe('magnus');
    expect(response.stats.currentElo).toBe(1500);
    expect(response.stats.wins).toBe(8);
  });

  it('should return default stats (self-healing) if stats are missing in database', async () => {
    const player = Player.restore({
      id: playerId,
      username: 'magnus',
      email: 'magnus@chess.com',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    vi.spyOn(playerRepository, 'findById').mockResolvedValue(player);
    // Simulating a case where stats were never created for some reason
    vi.spyOn(playerRepository, 'findStatsByPlayerId').mockResolvedValue(null);

    const response = await sut.execute({ id: playerId });

    expect(response.id).toBe(playerId);
    expect(response.stats.currentElo).toBe(1200); // Default value
    expect(response.stats.totalMatches).toBe(0);
  });

  it('should throw PlayerNotFoundError if the player identity does not exist', async () => {
    vi.spyOn(playerRepository, 'findById').mockResolvedValue(null);

    await expect(sut.execute({ id: 'non-existent' })).rejects.toThrow(PlayerNotFoundError);
  });
});

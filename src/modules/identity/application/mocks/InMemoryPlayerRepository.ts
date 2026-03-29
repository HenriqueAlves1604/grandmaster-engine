import type { PlayerRepositoryPort } from '@modules/identity/domain/ports/PlayerRepositoryPort.js';
import type { Player } from '../../domain/entities/Player.js';
import type { PlayerStats } from '../../domain/entities/PlayerStats.js';

export class InMemoryPlayerRepository implements PlayerRepositoryPort {
  public players: Player[] = [];
  public stats: PlayerStats[] = [];

  public async save(player: Player, stats?: PlayerStats): Promise<void> {
    const playerSnapshot = player.getSnapshot();
    const existingIndex = this.players.findIndex((p) => p.getSnapshot().id === playerSnapshot.id);

    if (existingIndex >= 0) {
      this.players[existingIndex] = player;
    } else {
      this.players.push(player);
    }

    if (stats) {
      const statsSnapshot = stats.getSnapshot();
      const statsIndex = this.stats.findIndex(
        (s) => s.getSnapshot().playerId === statsSnapshot.playerId,
      );

      if (statsIndex >= 0) {
        this.stats[statsIndex] = stats;
      } else {
        this.stats.push(stats);
      }
    }
  }

  public async findById(id: string): Promise<Player | null> {
    return this.players.find((p) => p.getSnapshot().id === id) || null;
  }

  public async findByEmail(email: string): Promise<Player | null> {
    return this.players.find((p) => p.getSnapshot().email === email) || null;
  }

  public async findByUsername(username: string): Promise<Player | null> {
    return this.players.find((p) => p.getSnapshot().username === username) || null;
  }

  public async findByEmailOrUsername(email: string, username: string): Promise<Player | null> {
    return (
      this.players.find((p) => {
        const snap = p.getSnapshot();
        return snap.email === email || snap.username === username;
      }) || null
    );
  }

  public async findStatsByPlayerId(playerId: string): Promise<PlayerStats | null> {
    return this.stats.find((s) => s.getSnapshot().playerId === playerId) || null;
  }
}

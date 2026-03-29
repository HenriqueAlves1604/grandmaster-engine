import type { Player } from '../entities/Player.js';
import type { PlayerStats } from '../entities/PlayerStats.js';

export interface PlayerRepositoryPort {
  /**
   * Persists a new or updated player to the database.
   * Can optionally save the associated stats in the same transaction.
   */
  save(player: Player, stats?: PlayerStats): Promise<void>;

  /**
   * Finds a player by their unique UUID.
   */
  findById(id: string): Promise<Player | null>;

  /**
   * Finds a player by their email address (used for login and duplicate checks).
   */
  findByEmail(email: string): Promise<Player | null>;

  /**
   * Finds a player by their username (used for duplicate checks).
   */
  findByUsername(username: string): Promise<Player | null>;

  /**
   * Finds a player by either their email OR username.
   * Optimized for registration duplicate checks to avoid multiple database roundtrips.
   */
  findByEmailOrUsername(email: string, username: string): Promise<Player | null>;

  /**
   * Retrieves the stats associated with a specific player.
   */
  findStatsByPlayerId(playerId: string): Promise<PlayerStats | null>;
}

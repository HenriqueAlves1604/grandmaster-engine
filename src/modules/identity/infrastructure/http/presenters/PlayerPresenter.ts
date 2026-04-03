import type { Player } from '../../../domain/entities/Player.js';

export interface PlayerResponseDTO {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export class PlayerPresenter {
  /**
   * Transforms a rich Domain Entity into a safe JSON object for the HTTP Response.
   * Security: This ensures sensitive data like 'passwordHash' or 'deletedAt' never leaks.
   */
  public static toHTTP(player: Player): PlayerResponseDTO {
    const snapshot = player.getSnapshot();

    return {
      id: snapshot.id,
      username: snapshot.username,
      email: snapshot.email,
      createdAt: snapshot.createdAt,
    };
  }
}

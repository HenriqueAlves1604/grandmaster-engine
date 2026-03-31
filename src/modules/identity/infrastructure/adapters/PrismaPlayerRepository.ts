import type { PlayerRepositoryPort } from '@modules/identity/domain/ports/PlayerRepositoryPort.js';
import type { PrismaClient, Player as PrismaPlayerModel } from '@prisma/client';
import { Player } from '../../domain/entities/Player.js';
import { PlayerStats } from '../../domain/entities/PlayerStats.js';

export class PrismaPlayerRepository implements PlayerRepositoryPort {
  private readonly prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  public async save(player: Player, stats?: PlayerStats): Promise<void> {
    const playerSnapshot = player.getSnapshot();

    const basePlayerData = {
      username: playerSnapshot.username,
      email: playerSnapshot.email,
      passwordHash: playerSnapshot.passwordHash,
      updatedAt: playerSnapshot.updatedAt,
      deletedAt: playerSnapshot.deletedAt,
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.player.upsert({
        where: { id: playerSnapshot.id },
        update: basePlayerData,
        create: {
          id: playerSnapshot.id,
          createdAt: playerSnapshot.createdAt,
          ...basePlayerData,
        },
      });

      if (stats) {
        const statsSnapshot = stats.getSnapshot();

        const baseStatsData = {
          currentElo: statsSnapshot.currentElo,
          highestElo: statsSnapshot.highestElo,
          totalMatches: statsSnapshot.totalMatches,
          wins: statsSnapshot.wins,
          losses: statsSnapshot.losses,
          draws: statsSnapshot.draws,
          updatedAt: statsSnapshot.updatedAt,
        };

        await tx.playerStats.upsert({
          where: { playerId: statsSnapshot.playerId },
          update: baseStatsData,
          create: {
            playerId: statsSnapshot.playerId,
            ...baseStatsData,
          },
        });
      }
    });
  }

  public async findById(id: string): Promise<Player | null> {
    const row = await this.prisma.player.findUnique({ where: { id } });
    if (!row) return null;
    return this.mapToDomain(row);
  }

  public async findByEmail(email: string): Promise<Player | null> {
    const row = await this.prisma.player.findUnique({ where: { email } });
    if (!row) return null;
    return this.mapToDomain(row);
  }

  public async findByUsername(username: string): Promise<Player | null> {
    const row = await this.prisma.player.findUnique({ where: { username } });
    if (!row) return null;
    return this.mapToDomain(row);
  }

  public async findByEmailOrUsername(email: string, username: string): Promise<Player | null> {
    const row = await this.prisma.player.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (!row) return null;
    return this.mapToDomain(row);
  }

  public async findStatsByPlayerId(playerId: string): Promise<PlayerStats | null> {
    const row = await this.prisma.playerStats.findUnique({ where: { playerId } });
    if (!row) return null;

    return PlayerStats.restore({
      playerId: row.playerId,
      currentElo: row.currentElo,
      highestElo: row.highestElo,
      totalMatches: row.totalMatches,
      wins: row.wins,
      losses: row.losses,
      draws: row.draws,
      updatedAt: row.updatedAt,
    });
  }

  /**
   * Translates a Prisma database row back into a Domain Entity
   */
  private mapToDomain(row: PrismaPlayerModel): Player {
    return Player.restore({
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.passwordHash,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }
}

import type { Prisma, PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';
import { Player } from '../../domain/entities/Player.js';
import { PlayerStats } from '../../domain/entities/PlayerStats.js';
import { PrismaPlayerRepository } from './PrismaPlayerRepository.js';

describe('PrismaPlayerRepository', () => {
  let prismaMock: DeepMockProxy<PrismaClient>;
  let sut: PrismaPlayerRepository;

  const fixedDate = new Date('2026-03-30T10:00:00.000Z');

  // Dummy Prisma row to simulate database returns
  const dummyPrismaPlayer = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'grandmaster',
    email: 'magnus@chess.com',
    passwordHash: 'hashed_password',
    createdAt: fixedDate,
    updatedAt: fixedDate,
    deletedAt: null,
  };

  const dummyPrismaStats = {
    playerId: dummyPrismaPlayer.id,
    currentElo: 1200,
    highestElo: 1200,
    totalMatches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    updatedAt: fixedDate,
  };

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    sut = new PrismaPlayerRepository(prismaMock as PrismaClient);
    prismaMock.$transaction.mockImplementation(async (arg) => {
      const transactionCallback = arg as (tx: Prisma.TransactionClient) => Promise<unknown>;
      return transactionCallback(prismaMock as PrismaClient);
    });
  });

  describe('save', () => {
    it('should save only the player if no stats are provided', async () => {
      const player = Player.restore(dummyPrismaPlayer);

      await sut.save(player);

      expect(prismaMock.$transaction).toHaveBeenCalledOnce();
      expect(prismaMock.player.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: player.getSnapshot().id },
        }),
      );
      expect(prismaMock.playerStats.upsert).not.toHaveBeenCalled();
    });

    it('should save both player and stats when stats are provided', async () => {
      const player = Player.restore(dummyPrismaPlayer);
      const stats = PlayerStats.restore(dummyPrismaStats);

      await sut.save(player, stats);

      expect(prismaMock.$transaction).toHaveBeenCalledOnce();
      expect(prismaMock.player.upsert).toHaveBeenCalledOnce();
      expect(prismaMock.playerStats.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { playerId: stats.getSnapshot().playerId },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a Player domain entity when found', async () => {
      prismaMock.player.findUnique.mockResolvedValue(dummyPrismaPlayer);

      const result = await sut.findById(dummyPrismaPlayer.id);

      expect(prismaMock.player.findUnique).toHaveBeenCalledWith({
        where: { id: dummyPrismaPlayer.id },
      });
      expect(result).toBeInstanceOf(Player);
      expect(result?.getSnapshot().email).toBe(dummyPrismaPlayer.email);
    });

    it('should return null when player is not found', async () => {
      prismaMock.player.findUnique.mockResolvedValue(null);

      const result = await sut.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a Player domain entity when found', async () => {
      prismaMock.player.findUnique.mockResolvedValue(dummyPrismaPlayer);

      const result = await sut.findByEmail(dummyPrismaPlayer.email);

      expect(prismaMock.player.findUnique).toHaveBeenCalledWith({
        where: { email: dummyPrismaPlayer.email },
      });
      expect(result).toBeInstanceOf(Player);
    });

    it('should return null when player is not found', async () => {
      prismaMock.player.findUnique.mockResolvedValue(null);

      const result = await sut.findByEmail('ghost@chess.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return a Player domain entity when found', async () => {
      prismaMock.player.findUnique.mockResolvedValue(dummyPrismaPlayer);

      const result = await sut.findByUsername(dummyPrismaPlayer.username);

      expect(prismaMock.player.findUnique).toHaveBeenCalledWith({
        where: { username: dummyPrismaPlayer.username },
      });
      expect(result).toBeInstanceOf(Player);
    });
  });

  describe('findByEmailOrUsername', () => {
    it('should return a Player domain entity when found by OR condition', async () => {
      prismaMock.player.findFirst.mockResolvedValue(dummyPrismaPlayer);

      const result = await sut.findByEmailOrUsername(
        dummyPrismaPlayer.email,
        dummyPrismaPlayer.username,
      );

      expect(prismaMock.player.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: dummyPrismaPlayer.email }, { username: dummyPrismaPlayer.username }],
        },
      });
      expect(result).toBeInstanceOf(Player);
    });
  });

  describe('findStatsByPlayerId', () => {
    it('should return a PlayerStats domain entity when found', async () => {
      prismaMock.playerStats.findUnique.mockResolvedValue(dummyPrismaStats);

      const result = await sut.findStatsByPlayerId(dummyPrismaPlayer.id);

      expect(prismaMock.playerStats.findUnique).toHaveBeenCalledWith({
        where: { playerId: dummyPrismaPlayer.id },
      });
      expect(result).toBeInstanceOf(PlayerStats);
      expect(result?.getSnapshot().currentElo).toBe(1200);
    });

    it('should return null when stats are not found', async () => {
      prismaMock.playerStats.findUnique.mockResolvedValue(null);

      const result = await sut.findStatsByPlayerId('non-existent-id');

      expect(result).toBeNull();
    });
  });
});

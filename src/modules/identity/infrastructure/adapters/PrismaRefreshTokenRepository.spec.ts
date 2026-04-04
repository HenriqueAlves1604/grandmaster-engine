import type { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RefreshToken } from '../../domain/entities/RefreshToken.js';
import { PrismaRefreshTokenRepository } from './PrismaRefreshTokenRepository.js';

describe('PrismaRefreshTokenRepository', () => {
  let prismaMock: PrismaClient;
  let sut: PrismaRefreshTokenRepository;

  beforeEach(() => {
    prismaMock = {
      refreshToken: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
    } as unknown as PrismaClient;

    sut = new PrismaRefreshTokenRepository(prismaMock);
  });

  describe('save', () => {
    it('should map the entity and call prisma upsert correctly', async () => {
      const playerId = 'player-123';
      const refreshToken = RefreshToken.create(playerId, 7);
      const snapshot = refreshToken.getSnapshot();

      await sut.save(refreshToken);

      expect(prismaMock.refreshToken.upsert).toHaveBeenCalledOnce();
      expect(prismaMock.refreshToken.upsert).toHaveBeenCalledWith({
        where: { id: snapshot.id },
        update: snapshot,
        create: snapshot,
      });
    });
  });

  describe('findByToken', () => {
    it('should return a restored RefreshToken entity if record is found', async () => {
      const mockRecord = {
        id: 'some-uuid',
        token: 'hashed-secure-token',
        playerId: 'player-123',
        expiresAt: new Date(Date.now() + 100000),
        createdAt: new Date(),
      };

      vi.mocked(prismaMock.refreshToken.findUnique).mockResolvedValue(mockRecord);

      const result = await sut.findByToken('hashed-secure-token');

      expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'hashed-secure-token' },
      });
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(RefreshToken);
      expect(result?.getSnapshot().playerId).toBe('player-123');
    });

    it('should return null if the record does not exist', async () => {
      vi.mocked(prismaMock.refreshToken.findUnique).mockResolvedValue(null);

      const result = await sut.findByToken('non-existent-token');

      expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledOnce();
      expect(result).toBeNull();
    });
  });

  describe('deleteByToken', () => {
    it('should call prisma delete with the correct token', async () => {
      await sut.deleteByToken('token-to-delete');

      expect(prismaMock.refreshToken.delete).toHaveBeenCalledOnce();
      expect(prismaMock.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: 'token-to-delete' },
      });
    });
  });

  describe('deleteAllByPlayerId', () => {
    it('should call prisma deleteMany with the correct playerId', async () => {
      await sut.deleteAllByPlayerId('player-123');

      expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledOnce();
      expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { playerId: 'player-123' },
      });
    });
  });
});

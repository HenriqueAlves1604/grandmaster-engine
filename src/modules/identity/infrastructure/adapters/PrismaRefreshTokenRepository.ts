import type { PrismaClient } from '@prisma/client';
import { RefreshToken } from '../../domain/entities/RefreshToken.js';
import type { RefreshTokenRepositoryPort } from '../../domain/ports/RefreshTokenRepositoryPort.js';

export class PrismaRefreshTokenRepository implements RefreshTokenRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(refreshToken: RefreshToken): Promise<void> {
    const data = refreshToken.getSnapshot();
    await this.prisma.refreshToken.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  public async findByToken(token: string): Promise<RefreshToken | null> {
    const record = await this.prisma.refreshToken.findUnique({ where: { token } });
    return record ? RefreshToken.restore(record) : null;
  }

  public async deleteByToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({ where: { token } });
  }

  public async deleteAllByPlayerId(playerId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { playerId } });
  }
}

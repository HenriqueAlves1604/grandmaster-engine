import type { PrismaClient } from '@prisma/client';
import { TimeControl } from '../../domain/entities/TimeControl.js';
import type { TimeControlRepositoryPort } from '../../domain/ports/TimeControlRepositoryPort.js';

export class PrismaTimeControlRepository implements TimeControlRepositoryPort {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async findAll(): Promise<TimeControl[]> {
    const records = await this.prisma.timeControl.findMany({
      orderBy: { baseTimeSeconds: 'asc' },
    });

    return records.map((record) =>
      TimeControl.reconstitute({
        id: record.id,
        name: record.name,
        baseTimeSeconds: record.baseTimeSeconds,
        incrementSeconds: record.incrementSeconds,
      }),
    );
  }

  public async findById(id: number): Promise<TimeControl | null> {
    const record = await this.prisma.timeControl.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return TimeControl.reconstitute({
      id: record.id,
      name: record.name,
      baseTimeSeconds: record.baseTimeSeconds,
      incrementSeconds: record.incrementSeconds,
    });
  }
}

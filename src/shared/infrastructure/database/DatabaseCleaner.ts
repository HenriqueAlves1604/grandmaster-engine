import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DatabaseCleaner {
  /**
   * Wipes all data from the test database.
   * Order is important: child tables with foreign keys must be deleted
   * BEFORE their parent tables to avoid constraint violations.
   */
  public static async clean(): Promise<void> {
    await prisma.refreshToken.deleteMany();
    await prisma.playerStats.deleteMany();
    await prisma.player.deleteMany();
    // (TODO) await prisma.moves.deleteMany();
    // (TODO) await prisma.matches.deleteMany();
    // (TODO) await prisma.tournamentParticipant.deleteMany();
    // (TODO) await prisma.tournament.deleteMany();
    await prisma.timeControl.deleteMany();
  }

  /**
   * Closes the database connection to prevent memory leaks
   * or "Too many connections" errors during the test suite execution.
   */
  public static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

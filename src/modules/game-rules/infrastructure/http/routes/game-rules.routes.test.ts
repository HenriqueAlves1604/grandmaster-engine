import { PrismaClient } from '@prisma/client';
import { DatabaseCleaner } from '@shared/infrastructure/database/DatabaseCleaner.js';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../../../../app.js';

const prisma = new PrismaClient();

describe('Game Rules Routes E2E', () => {
  beforeEach(async () => {
    await DatabaseCleaner.clean();
  });

  afterAll(async () => {
    await DatabaseCleaner.disconnect();
    await prisma.$disconnect();
  });

  describe('GET /api/v1/game-rules/time-controls', () => {
    it('should return 200 and a list of time controls ordered by base time', async () => {
      await prisma.timeControl.createMany({
        data: [
          { name: 'Rapid 10+5', baseTimeSeconds: 600, incrementSeconds: 5 },
          { name: 'Bullet 1+0', baseTimeSeconds: 60, incrementSeconds: 0 },
          { name: 'Blitz 3+2', baseTimeSeconds: 180, incrementSeconds: 2 },
        ],
      });

      // Act
      const response = await request(app).get('/api/v1/game-rules/time-controls');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);

      const returnedTimeControls = response.body.data;

      expect(returnedTimeControls[0].name).toBe('Bullet 1+0');
      expect(returnedTimeControls[0].baseTimeSeconds).toBe(60);

      expect(returnedTimeControls[1].name).toBe('Blitz 3+2');
      expect(returnedTimeControls[1].baseTimeSeconds).toBe(180);

      expect(returnedTimeControls[2].name).toBe('Rapid 10+5');
      expect(returnedTimeControls[2].baseTimeSeconds).toBe(600);
    });

    it('should return 200 and an empty array if no time controls are seeded', async () => {
      // Act
      const response = await request(app).get('/api/v1/game-rules/time-controls');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });
});

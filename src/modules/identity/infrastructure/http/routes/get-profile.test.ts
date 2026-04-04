import { PrismaClient } from '@prisma/client';
import { DatabaseCleaner } from '@shared/infrastructure/database/DatabaseCleaner.js';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../../../../app.js';

const prisma = new PrismaClient();

describe('GET /api/v1/players/me (Integration)', () => {
  let validToken: string;
  let testPlayerId: string;

  beforeEach(async () => {
    // Wipe the database to guarantee idempotency
    await DatabaseCleaner.clean();

    // Seed a valid player directly into the test database
    const player = await prisma.player.create({
      data: {
        username: 'capablanca',
        email: 'jose.capablanca@chess.com',
        passwordHash: 'hashed_mock_password',
      },
    });

    testPlayerId = player.id;

    validToken = jwt.sign({ sub: testPlayerId }, process.env.JWT_SECRET as string, {
      expiresIn: '15m',
    });
  });

  afterAll(async () => {
    await DatabaseCleaner.disconnect();
    await prisma.$disconnect();
  });

  it('should return 200 and the player profile with self-healed stats', async () => {
    const response = await request(app)
      .get('/api/v1/players/me')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id', testPlayerId);
    expect(response.body.data.username).toBe('capablanca');
    expect(response.body.data.email).toBe('jose.capablanca@chess.com');

    expect(response.body.data).toHaveProperty('stats');
    expect(response.body.data.stats.currentElo).toBe(1200);
    expect(response.body.data.stats.totalMatches).toBe(0);
  });

  it('should return 401 Unauthorized if no token is provided', async () => {
    const response = await request(app).get('/api/v1/players/me');

    expect(response.status).toBe(401);
  });

  it('should return 401 Unauthorized if token is invalid or tampered', async () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid_payload.signature';

    const response = await request(app)
      .get('/api/v1/players/me')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.status).toBe(401);
  });
});

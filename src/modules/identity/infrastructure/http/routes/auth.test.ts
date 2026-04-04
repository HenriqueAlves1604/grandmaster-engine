import { PrismaClient } from '@prisma/client';
import { DatabaseCleaner } from '@shared/infrastructure/database/DatabaseCleaner.js';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../../../../app.js';

const prisma = new PrismaClient();

describe('Auth Routes E2E', () => {
  const TEST_PASSWORD = 'StrongPassword123!';
  let testPlayerId: string;

  beforeEach(async () => {
    await DatabaseCleaner.clean();
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
    const player = await prisma.player.create({
      data: {
        username: 'auth_master',
        email: 'auth@chess.com',
        passwordHash,
      },
    });

    testPlayerId = player.id;
  });

  afterAll(async () => {
    await DatabaseCleaner.disconnect();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate a valid player and return tokens', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'auth@chess.com',
        rawPassword: TEST_PASSWORD,
      });

      expect(response.status).toBe(200);

      const responseBody = response.body.data;

      expect(responseBody).toHaveProperty('token');
      expect(responseBody).toHaveProperty('refreshToken');
      expect(responseBody.player).toHaveProperty('id', testPlayerId);
      expect(responseBody.player.username).toBe('auth_master');

      // Verify the refresh token was actually saved in the database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: responseBody.refreshToken },
      });
      expect(storedToken).not.toBeNull();
      expect(storedToken?.playerId).toBe(testPlayerId);
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'auth@chess.com',
        rawPassword: 'WrongPassword!',
      });

      expect(400).toBe(response.status);
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'ghost@chess.com',
        rawPassword: TEST_PASSWORD,
      });

      expect(400).toBe(response.status);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let validRefreshToken: string;

    beforeEach(async () => {
      validRefreshToken = randomUUID();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days from now

      await prisma.refreshToken.create({
        data: {
          token: validRefreshToken,
          playerId: testPlayerId,
          expiresAt: futureDate,
        },
      });
    });

    it('should issue new tokens and revoke the old refresh token', async () => {
      const response = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: validRefreshToken,
      });

      expect(response.status).toBe(200);

      const responseBody = response.body.data || response.body;

      expect(responseBody).toHaveProperty('accessToken');
      expect(responseBody).toHaveProperty('refreshToken');
      expect(responseBody.refreshToken).not.toBe(validRefreshToken);

      // Verify the old token was deleted from the database (Rotation)
      const oldTokenInDb = await prisma.refreshToken.findUnique({
        where: { token: validRefreshToken },
      });
      expect(oldTokenInDb).toBeNull();

      // Verify the new token was saved
      const newTokenInDb = await prisma.refreshToken.findUnique({
        where: { token: responseBody.refreshToken },
      });
      expect(newTokenInDb).not.toBeNull();
    });

    it('should reject an invalid or tampered refresh token', async () => {
      const response = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: 'invalid-token-string',
      });

      expect(response.status).toBe(401);
    });

    it('should reject an expired refresh token and delete it', async () => {
      // Create an expired token explicitly
      const expiredToken = randomUUID();
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await prisma.refreshToken.create({
        data: {
          token: expiredToken,
          playerId: testPlayerId,
          expiresAt: pastDate,
        },
      });

      const response = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: expiredToken,
      });

      expect(response.status).toBe(401);

      // Verify the expired token was purged from the database
      const tokenInDb = await prisma.refreshToken.findUnique({
        where: { token: expiredToken },
      });
      expect(tokenInDb).toBeNull();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should successfully invalidate a session by deleting the refresh token', async () => {
      const tokenToRevoke = randomUUID();
      await prisma.refreshToken.create({
        data: {
          token: tokenToRevoke,
          playerId: testPlayerId,
          expiresAt: new Date(Date.now() + 100000),
        },
      });

      const response = await request(app).post('/api/v1/auth/logout').send({
        refreshToken: tokenToRevoke,
      });

      expect(204).toBe(response.status);

      const tokenInDb = await prisma.refreshToken.findUnique({
        where: { token: tokenToRevoke },
      });
      expect(tokenInDb).toBeNull();
    });
  });
});

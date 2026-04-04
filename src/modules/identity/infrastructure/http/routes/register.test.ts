import { execSync } from 'node:child_process';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../../../../app.js';

describe('Register Player E2E', () => {
  beforeAll(() => {
    execSync('npx prisma db push --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });
  });

  it('should create a new player and return 201', async () => {
    const response = await request(app).post('/api/v1/players/register').send({
      username: 'grandmaster_test',
      email: 'test@chess.com',
      rawPassword: 'StrongPassword123!',
    });

    expect(response.status).toBe(201);
    expect(response.body.player).toHaveProperty('id');
    expect(response.body.player.username).toBe('grandmaster_test');
  });

  it('should not allow duplicate emails', async () => {
    const response = await request(app).post('/api/v1/players/register').send({
      username: 'another_user',
      email: 'test@chess.com',
      rawPassword: 'AnotherPassword123!',
    });

    expect(response.status).toBe(409); // Conflict / PlayerAlreadyExists
  });
});

import { ValidationError } from '@shared/errors/ValidationError.js';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtTokenAdapter } from './JwtTokenAdapter.js';

describe('JwtTokenAdapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should throw ValidationError if JWT_SECRET is not defined', () => {
      delete process.env.JWT_SECRET;

      expect(() => new JwtTokenAdapter()).toThrowError(ValidationError);
      expect(() => new JwtTokenAdapter()).toThrowError(
        'JWT_SECRET environment variable is not defined.',
      );
    });

    it('should initialize successfully when JWT_SECRET is provided', () => {
      process.env.JWT_SECRET = 'super-secret-test-key';

      expect(() => new JwtTokenAdapter()).not.toThrowError();
    });
  });

  describe('generateToken', () => {
    it('should return a valid JWT string structure', () => {
      process.env.JWT_SECRET = 'super-secret-test-key';
      const adapter = new JwtTokenAdapter();
      const payload = { sub: 'player-123', role: 'grandmaster' };

      const token = adapter.generateToken(payload, '1h');

      expect(typeof token).toBe('string');

      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('should return the decoded payload for a valid token', () => {
      process.env.JWT_SECRET = 'super-secret-test-key';
      const adapter = new JwtTokenAdapter();
      const payload = { sub: 'player-123' };

      const token = adapter.generateToken(payload, '1h');
      const decodedPayload = adapter.verifyToken(token);

      expect(decodedPayload).not.toBeNull();
      expect(decodedPayload?.sub).toBe('player-123');
    });

    it('should return null for a malformed token string', () => {
      process.env.JWT_SECRET = 'super-secret-test-key';
      const adapter = new JwtTokenAdapter();

      const decodedPayload = adapter.verifyToken('invalid.token.structure');

      expect(decodedPayload).toBeNull();
    });

    it('should return null if the token was signed with a different secret', () => {
      // System A signs the token
      process.env.JWT_SECRET = 'secret-key-A';
      const adapterA = new JwtTokenAdapter();
      const tokenFromA = adapterA.generateToken({ sub: 'player-123' }, '1h');

      // System B tries to verify it
      process.env.JWT_SECRET = 'secret-key-B';
      const adapterB = new JwtTokenAdapter();

      const decodedPayload = adapterB.verifyToken(tokenFromA);

      expect(decodedPayload).toBeNull();
    });

    it('should return null if the token is expired', () => {
      process.env.JWT_SECRET = 'super-secret-test-key';
      const adapter = new JwtTokenAdapter();

      const expiredToken = jwt.sign({ sub: 'player-123' }, process.env.JWT_SECRET, {
        expiresIn: '-10s',
      });

      const decodedPayload = adapter.verifyToken(expiredToken);

      expect(decodedPayload).toBeNull();
    });
  });
});

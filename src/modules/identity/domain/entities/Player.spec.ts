import { ConflictError } from '@shared/errors/ConflictError.js';
import { describe, expect, it } from 'vitest';
import type { PlayerProps } from './Player.js';
import { Player } from './Player.js';

describe('Player Entity', () => {
  const validUsername = 'gm_magnus';
  const validEmail = 'magnus@chess.com';
  const validPasswordHash = '$2b$10$hashedpassword';

  it('should create a new player with valid properties', () => {
    const player = Player.create(validUsername, validEmail, validPasswordHash);
    const snapshot = player.getSnapshot();
    const uuidLength = 36;

    expect(snapshot.id).toBeDefined();
    expect(snapshot.id).toHaveLength(uuidLength);
    expect(snapshot.username).toBe(validUsername);
    expect(snapshot.email).toBe(validEmail);
    expect(snapshot.passwordHash).toBe(validPasswordHash);
    expect(snapshot.createdAt).toBeInstanceOf(Date);
    expect(snapshot.updatedAt).toEqual(snapshot.createdAt);
    expect(snapshot.deletedAt).toBeNull();
  });

  it('should restore a player from existing properties', () => {
    const props: PlayerProps = {
      id: 'existing-uuid',
      username: 'old_player',
      email: 'old@chess.com',
      passwordHash: 'old_hash',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
      deletedAt: null,
    };

    const player = Player.restore(props);
    expect(player.getSnapshot()).toEqual(props);
  });

  it('should mark player as deleted', () => {
    const player = Player.create(validUsername, validEmail, validPasswordHash);

    player.markAsDeleted();
    const snapshot = player.getSnapshot();

    expect(snapshot.deletedAt).toBeInstanceOf(Date);
    expect(snapshot.updatedAt).toEqual(snapshot.deletedAt);
  });

  it('should throw ConflictError when deleting an already deleted player', () => {
    const player = Player.create(validUsername, validEmail, validPasswordHash);
    player.markAsDeleted();

    expect(() => player.markAsDeleted()).toThrow(ConflictError);
    expect(() => player.markAsDeleted()).toThrow('Player is already deleted.');
  });

  it('should update the updatedAt timestamp when marked as deleted', async () => {
    const player = Player.create(validUsername, validEmail, validPasswordHash);
    const initialUpdate = player.getSnapshot().updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 10));

    player.markAsDeleted();
    const postUpdate = player.getSnapshot().updatedAt;

    expect(postUpdate.getTime()).toBeGreaterThan(initialUpdate.getTime());
  });
});

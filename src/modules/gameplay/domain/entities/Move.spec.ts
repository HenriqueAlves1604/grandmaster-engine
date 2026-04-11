import { describe, expect, it } from 'vitest';
import { Fen } from '../value-objects/Fen.js';
import { Move } from './Move.js';

describe('Move Entity', () => {
  const mockFenStr = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
  const mockFen = Fen.create(mockFenStr);

  it('should create a new Move instance correctly', () => {
    const move = Move.create(
      'game-123',
      'player-w',
      1,
      'e4',
      mockFen,
      1500, // 1.5 seconds taken
    );

    expect(move.getGameId()).toBe('game-123');
    expect(move.getPlayerId()).toBe('player-w');
    expect(move.getMoveNumber()).toBe(1);
    expect(move.getNotation()).toBe('e4');
    expect(move.getFenAfter().getValue()).toBe(mockFenStr);
    expect(move.getTimeTakenMs()).toBe(1500);

    // Auto-generates createdAt if not provided
    expect(move.getCreatedAt()).toBeInstanceOf(Date);
    // ID should be undefined for a newly created domain move (not yet in DB)
    expect(move.getId()).toBeUndefined();
  });

  it('should reconstitute an existing Move from database properties', () => {
    const pastDate = new Date('2026-01-01T10:00:00Z');

    const reconstitutedMove = Move.reconstitute({
      id: 10n, // BigInt from database
      gameId: 'game-123',
      playerId: 'player-b',
      moveNumber: 2,
      notation: 'e5',
      fenAfter: mockFen,
      timeTakenMs: 800,
      createdAt: pastDate,
    });

    expect(reconstitutedMove.getId()).toBe(10n);
    expect(reconstitutedMove.getCreatedAt()).toEqual(pastDate);
    expect(reconstitutedMove.getPlayerId()).toBe('player-b');
  });
});

import { ValidationError } from '@shared/errors/ValidationError.js';
import { describe, expect, it } from 'vitest';
import { Game } from '../entities/Game.js';
import { Fen } from './Fen.js';

describe('Fen Value Object', () => {
  it('should create a valid Fen instance with the initial board state', () => {
    const fen = Fen.create(Game.INITIAL_FEN_STRING);
    expect(fen.getValue()).toBe(Game.INITIAL_FEN_STRING);
  });

  it('should create a valid Fen instance with a complex mid-game state', () => {
    const midGameFen = 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq - 3 3';
    const fen = Fen.create(midGameFen);
    expect(fen.getValue()).toBe(midGameFen);
  });

  it('should automatically trim surrounding whitespace', () => {
    const paddedFen = `   ${Game.INITIAL_FEN_STRING}   `;
    const fen = Fen.create(paddedFen);
    expect(fen.getValue()).toBe(Game.INITIAL_FEN_STRING);
  });

  it('should throw a ValidationError if the FEN has fewer than 6 segments', () => {
    // Missing the last segment (fullmove number)
    const shortFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0';

    expect(() => Fen.create(shortFen)).toThrow(ValidationError);
    expect(() => Fen.create(shortFen)).toThrow('Invalid FEN structure. Expected 6 segments');
  });

  it('should throw a ValidationError if the FEN has more than 6 segments', () => {
    // Extra data at the end
    const longFen = `${Game.INITIAL_FEN_STRING} extra_data`;

    expect(() => Fen.create(longFen)).toThrow(ValidationError);
    expect(() => Fen.create(longFen)).toThrow('Invalid FEN structure. Expected 6 segments');
  });

  it('should throw a ValidationError if the active color is invalid', () => {
    // Active color is 'x' instead of 'w' or 'b'
    const invalidColorFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1';

    expect(() => Fen.create(invalidColorFen)).toThrow(ValidationError);
    expect(() => Fen.create(invalidColorFen)).toThrow('Active color must be "w" or "b"');
  });

  it('should throw a ValidationError if the piece placement structure is completely broken', () => {
    const invalidPlacementFen = 'rnbqkbnrpppppppp8888PPPPPPPPRNBQKBNR w KQkq - 0 1';

    expect(() => Fen.create(invalidPlacementFen)).toThrow(ValidationError);
    expect(() => Fen.create(invalidPlacementFen)).toThrow(
      'Piece placement must contain ranks separated by "/"',
    );
  });

  it('should throw a ValidationError for empty strings', () => {
    expect(() => Fen.create('')).toThrow(ValidationError);
  });
});

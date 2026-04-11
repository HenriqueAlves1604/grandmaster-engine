import { ValidationError } from '@shared/errors/ValidationError.js';

export class Fen {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(rawFen: string): Fen {
    const trimmed = rawFen.trim();

    // A standard FEN string always has 6 space-separated segments.
    // 1: Piece placement, 2: Active color, 3: Castling, 4: En passant, 5: Halfmove clock, 6: Fullmove number
    const fenSegments = trimmed.split(' ');

    if (!fenSegments || fenSegments.length !== 6) {
      throw new ValidationError(
        `Invalid FEN structure. Expected 6 segments, got ${fenSegments.length}.`,
      );
    }

    // Basic structural validation (chess.js will do the deep logical validation later)
    const pieces = fenSegments[0];
    const activeColor = fenSegments[1];

    if (!pieces || !activeColor) {
      throw new ValidationError('Invalid FEN structure: Missing piece placement or active color.');
    }

    if (activeColor !== 'w' && activeColor !== 'b') {
      throw new ValidationError('Invalid FEN: Active color must be "w" or "b".');
    }

    if (!pieces.includes('/')) {
      throw new ValidationError(
        'Invalid FEN: Piece placement must contain ranks separated by "/".',
      );
    }

    return new Fen(trimmed);
  }

  public getValue(): string {
    return this.value;
  }
}

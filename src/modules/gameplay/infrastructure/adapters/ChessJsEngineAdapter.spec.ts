import { beforeEach, describe, expect, it } from 'vitest';
import { Game } from '../../domain/entities/Game.js';
import { Fen } from '../../domain/value-objects/Fen.js';
import { UciMove } from '../../domain/value-objects/UciMove.js';
import { ChessJsEngineAdapter } from './ChessJsEngineAdapter.js';

describe('ChessJsEngineAdapter', () => {
  let adapter: ChessJsEngineAdapter;
  let initialFen: Fen;

  beforeEach(() => {
    adapter = new ChessJsEngineAdapter();
    initialFen = Fen.create(Game.INITIAL_FEN_STRING);
  });

  it('should load a valid FEN successfully', () => {
    expect(() => adapter.loadGame(initialFen)).not.toThrow();
    expect(adapter.getFen().getValue()).toBe(Game.INITIAL_FEN_STRING);
  });

  it('should return a MoveResult for a legal move', () => {
    adapter.loadGame(initialFen);
    const move = UciMove.create('e2e4');

    const result = adapter.validateAndMakeMove(move);
    expect(result).not.toBeNull();
    expect(result?.san).toBe('e4');
    expect(result?.isCheckmate).toBe(false);

    const fenValue = result?.fenAfter.getValue();
    expect(fenValue).toContain(' b ');

    const expectedFenAfterE4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
    expect(fenValue).toBe(expectedFenAfterE4);
  });

  it('should return null for an illegal move', () => {
    adapter.loadGame(initialFen);
    const move = UciMove.create('e2e5'); // Illegal: Pawn can't jump 3 squares

    const result = adapter.validateAndMakeMove(move);

    expect(result).toBeNull();
  });

  it('should detect checkmate correctly', () => {
    const mateSetupFen = Fen.create(
      'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    );
    adapter.loadGame(mateSetupFen);
    const mateMove = UciMove.create('f3f7');

    const result = adapter.validateAndMakeMove(mateMove);

    expect(result?.isCheckmate).toBe(true);
    expect(result?.san).toBe('Qxf7#');
  });
});

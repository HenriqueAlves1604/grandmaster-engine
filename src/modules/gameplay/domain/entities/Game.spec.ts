import { describe, expect, it } from 'vitest';
import { GameResult } from '../enums/GameResult.js';
import { GameStatus } from '../enums/GameStatus.js';
import { Fen } from '../value-objects/Fen.js';
import { Game } from './Game.js';

describe('Game Entity (Aggregate Root)', () => {
  it('should create a new game in WAITING state with initial FEN', () => {
    const game = Game.create('game-1', 'player-w', 'player-b', 1);

    expect(game.getStatus()).toBe(GameStatus.WAITING);
    expect(game.getResult()).toBe(GameResult.NONE);
    expect(game.getFen().getValue()).toBe(Game.INITIAL_FEN_STRING);
    expect(game.getSequence()).toBe(0);
  });

  it('should start a game and change state to ONGOING', () => {
    const game = Game.create('game-1', 'player-w', 'player-b', 1);
    game.start();

    expect(game.getStatus()).toBe(GameStatus.ONGOING);
  });

  it('should not allow starting an already started game', () => {
    const game = Game.create('game-1', 'player-w', 'player-b', 1);
    game.start();

    expect(() => game.start()).toThrow('start the game');
  });

  it('should apply move updates and increment sequence', () => {
    const game = Game.create('game-1', 'player-w', 'player-b', 1);
    game.start();

    const nextFenStr = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    const nextFen = Fen.create(nextFenStr);
    game.applyMoveUpdate(nextFen);

    expect(game.getFen().getValue()).toBe(nextFenStr);
    expect(game.getSequence()).toBe(1);
  });

  it('should not allow applying moves to a non-ongoing game', () => {
    const game = Game.create('game-1', 'player-w', 'player-b', 1); // WAITING
    const validFen = Fen.create('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');

    expect(() => game.applyMoveUpdate(validFen)).toThrow('apply move updates');
  });

  it('should finish an ongoing game with a specific result', () => {
    const game = Game.create('game-1', 'player-w', 'player-b', 1);
    game.start();

    game.finish(GameResult.WHITE_WINS);

    expect(game.getStatus()).toBe(GameStatus.FINISHED);
    expect(game.getResult()).toBe(GameResult.WHITE_WINS);
  });

  it('should abort a waiting game correctly', () => {
    const game = Game.create('game-1', 'player-w', 'player-b', 1);
    game.abort();

    expect(game.getStatus()).toBe(GameStatus.ABORTED);
  });
});

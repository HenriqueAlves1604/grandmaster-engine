import { GameResult } from '../enums/GameResult.js';
import { GameStatus } from '../enums/GameStatus.js';
import { InvalidGameStateError } from '../errors/InvalidGameStateError.js';
import { Fen } from '../value-objects/Fen.js';

export interface GameProps {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string;
  timeControlId: number;
  status: GameStatus;
  result: GameResult;
  currentFen: Fen;
  moveSequence: number;
}

export class Game {
  private props: GameProps;

  public static readonly INITIAL_FEN_STRING =
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  private constructor(props: GameProps) {
    this.props = props;
  }

  public static create(
    id: string,
    whitePlayerId: string,
    blackPlayerId: string,
    timeControlId: number,
  ): Game {
    return new Game({
      id,
      whitePlayerId,
      blackPlayerId,
      timeControlId,
      status: GameStatus.WAITING,
      result: GameResult.NONE,
      currentFen: Fen.create(Game.INITIAL_FEN_STRING),
      moveSequence: 0,
    });
  }

  public static reconstitute(props: GameProps): Game {
    return new Game({ ...props });
  }

  public start(): void {
    if (this.props.status !== GameStatus.WAITING) {
      throw new InvalidGameStateError('start the game', this.props.status);
    }
    this.props.status = GameStatus.ONGOING;
  }

  public applyMoveUpdate(newFen: Fen): void {
    if (this.props.status !== GameStatus.ONGOING) {
      throw new InvalidGameStateError('apply move updates', this.props.status);
    }
    this.props.currentFen = newFen;
    this.props.moveSequence++;
  }

  public finish(result: GameResult): void {
    if (this.props.status !== GameStatus.ONGOING) {
      throw new InvalidGameStateError('finish the game', this.props.status);
    }
    this.props.status = GameStatus.FINISHED;
    this.props.result = result;
  }

  public abort(): void {
    if (this.props.status !== GameStatus.WAITING) {
      throw new InvalidGameStateError('abort the game', this.props.status);
    }
    this.props.status = GameStatus.ABORTED;
    this.props.result = GameResult.NONE;
  }

  public getId(): string {
    return this.props.id;
  }
  public getStatus(): GameStatus {
    return this.props.status;
  }
  public getResult(): GameResult {
    return this.props.result;
  }
  public getFen(): Fen {
    return this.props.currentFen;
  }
  public getSequence(): number {
    return this.props.moveSequence;
  }
}

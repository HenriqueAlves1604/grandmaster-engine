import { ValidationError } from '@shared/errors/ValidationError.js';
import { Chess } from 'chess.js';
import type { ChessEnginePort, MoveResult } from '../../domain/ports/ChessEnginePort.js';
import { Fen } from '../../domain/value-objects/Fen.js';
import type { UciMove } from '../../domain/value-objects/UciMove.js';

export class ChessJsEngineAdapter implements ChessEnginePort {
  private engine: Chess;

  constructor() {
    this.engine = new Chess();
  }

  public loadGame(fen: Fen): void {
    try {
      this.engine.load(fen.getValue());
    } catch {
      throw new ValidationError(
        `Invalid FEN string provided to Chess Engine: "${fen.getValue()}".`,
      );
    }
  }

  public validateAndMakeMove(move: UciMove): MoveResult | null {
    try {
      const moveParams: { from: string; to: string; promotion?: string } = {
        from: move.getFrom(),
        to: move.getTo(),
      };

      const promotion = move.getPromotion();
      if (promotion) {
        moveParams.promotion = promotion;
      }

      const result = this.engine.move(moveParams);

      return {
        fenAfter: Fen.create(this.engine.fen()),
        isCheckmate: this.engine.isCheckmate(),
        isDraw:
          this.engine.isDraw() || this.engine.isStalemate() || this.engine.isThreefoldRepetition(),
        san: result.san,
      };
    } catch {
      return null;
    }
  }

  public getFen(): Fen {
    return Fen.create(this.engine.fen());
  }
}

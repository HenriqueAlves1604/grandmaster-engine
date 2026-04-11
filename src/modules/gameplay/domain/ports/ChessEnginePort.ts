import type { Fen } from '../value-objects/Fen.js';
import type { UciMove } from '../value-objects/UciMove.js';

export interface MoveResult {
  fenAfter: Fen;
  isCheckmate: boolean;
  isDraw: boolean;
  san: string;
}

export interface ChessEnginePort {
  loadGame(fen: Fen): void;
  validateAndMakeMove(move: UciMove): MoveResult | null;
  getFen(): Fen;
}

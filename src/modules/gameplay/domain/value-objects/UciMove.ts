import { ValidationError } from '@shared/errors/ValidationError.js';

export class UciMove {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(rawMove: string): UciMove {
    const trimmed = rawMove.trim().toLowerCase();

    // Coordinates from a1-h8 to a1-h8, with optional promotion piece (q, r, b, n)
    const uciRegex = /^[a-h][1-8][a-h][1-8][qrbn]?$/;

    if (!uciRegex.test(trimmed)) {
      throw new ValidationError(
        `Invalid UCI move format: "${trimmed}". Expected format like "e2e4" or "e7e8q".`,
      );
    }

    return new UciMove(trimmed);
  }

  public getValue(): string {
    return this.value;
  }

  public getFrom(): string {
    return this.value.substring(0, 2);
  }

  public getTo(): string {
    return this.value.substring(2, 4);
  }

  public getPromotion(): string | undefined {
    return this.value[4];
  }
}

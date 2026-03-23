import { MatchResult } from '@shared/enums/MatchResult.js';

const DEFAULT_ELO = 1200;

export interface PlayerStatsProps {
  playerId: string;
  currentElo: number;
  highestElo: number;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  updatedAt: Date;
}

export class PlayerStats {
  private playerId: string;
  private currentElo: number;
  private highestElo: number;
  private totalMatches: number;
  private wins: number;
  private losses: number;
  private draws: number;
  private updatedAt: Date;

  private constructor(props: PlayerStatsProps) {
    this.playerId = props.playerId;
    this.currentElo = props.currentElo;
    this.highestElo = props.highestElo;
    this.totalMatches = props.totalMatches;
    this.wins = props.wins;
    this.losses = props.losses;
    this.draws = props.draws;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Factory method to create initial stats for a new Player.
   */
  public static create(playerId: string): PlayerStats {
    const now = new Date();
    return new PlayerStats({
      playerId,
      currentElo: DEFAULT_ELO,
      highestElo: DEFAULT_ELO,
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      updatedAt: now,
    });
  }

  /**
   * Factory method to reconstitute stats from the database.
   */
  public static restore(props: PlayerStatsProps): PlayerStats {
    return new PlayerStats(props);
  }

  /**
   * Updates ELO and matches count after a game result.
   */
  public updateRating(newElo: number, result: MatchResult): void {
    this.currentElo = newElo;
    this.totalMatches += 1;

    if (this.currentElo > this.highestElo) {
      this.highestElo = this.currentElo;
    }

    if (result === MatchResult.WIN) this.wins += 1;
    if (result === MatchResult.LOSS) this.losses += 1;
    if (result === MatchResult.DRAW) this.draws += 1;

    this.updatedAt = new Date();
  }

  /**
   * Exports the current state of the stats entity for persistence.
   */
  public getSnapshot(): PlayerStatsProps {
    return {
      playerId: this.playerId,
      currentElo: this.currentElo,
      highestElo: this.highestElo,
      totalMatches: this.totalMatches,
      wins: this.wins,
      losses: this.losses,
      draws: this.draws,
      updatedAt: this.updatedAt,
    };
  }
}

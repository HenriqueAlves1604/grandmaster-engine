import { MatchResult } from '@shared/enums/MatchResult.js';
import { describe, expect, it } from 'vitest';
import { PlayerStats } from './PlayerStats.js';

describe('PlayerStats Entity', () => {
  const playerId = 'test-player-uuid';

  it('should create initial stats with default values', () => {
    const stats = PlayerStats.create(playerId);
    const snapshot = stats.getSnapshot();
    const defaultElo = 1200;

    expect(snapshot.playerId).toBe(playerId);
    expect(snapshot.currentElo).toBe(defaultElo);
    expect(snapshot.highestElo).toBe(defaultElo);
    expect(snapshot.totalMatches).toBe(0);
    expect(snapshot.wins).toBe(0);
    expect(snapshot.losses).toBe(0);
    expect(snapshot.draws).toBe(0);
    expect(snapshot.updatedAt).toBeInstanceOf(Date);
  });

  it('should update rating and highest elo on a win', () => {
    const stats = PlayerStats.create(playerId);
    const newElo = 1215;

    stats.updateRating(newElo, MatchResult.WIN);
    const snapshot = stats.getSnapshot();

    expect(snapshot.currentElo).toBe(newElo);
    expect(snapshot.highestElo).toBe(newElo);
    expect(snapshot.totalMatches).toBe(1);
    expect(snapshot.wins).toBe(1);
  });

  it('should not update highest elo if new rating is lower', () => {
    const stats = PlayerStats.create(playerId);
    const previousElo = 1250;
    const currentElo = 1240;
    stats.updateRating(previousElo, MatchResult.WIN);

    stats.updateRating(currentElo, MatchResult.LOSS);
    const snapshot = stats.getSnapshot();

    expect(snapshot.currentElo).toBe(currentElo);
    expect(snapshot.highestElo).toBe(previousElo);
    expect(snapshot.totalMatches).toBe(2);
    expect(snapshot.losses).toBe(1);
  });

  it('should correctly increment draws', () => {
    const stats = PlayerStats.create(playerId);

    stats.updateRating(1200, MatchResult.DRAW);
    const snapshot = stats.getSnapshot();

    expect(snapshot.draws).toBe(1);
    expect(snapshot.totalMatches).toBe(1);
  });

  it('should restore player stats from provided properties', () => {
    const props = {
      playerId: 'existing-id',
      currentElo: 1500,
      highestElo: 1600,
      totalMatches: 100,
      wins: 60,
      losses: 30,
      draws: 10,
      updatedAt: new Date(),
    };

    const stats = PlayerStats.restore(props);
    expect(stats.getSnapshot()).toEqual(props);
  });

  it('should update updatedAt timestamp on each rating change', async () => {
    const stats = PlayerStats.create(playerId);
    const initialUpdate = stats.getSnapshot().updatedAt;

    // Small delay to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 10));

    stats.updateRating(1210, MatchResult.WIN);
    const postUpdate = stats.getSnapshot().updatedAt;

    expect(postUpdate.getTime()).toBeGreaterThan(initialUpdate.getTime());
  });
});

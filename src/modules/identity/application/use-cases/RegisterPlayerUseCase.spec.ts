import { beforeEach, describe, expect, it } from 'vitest';
import { PlayerAlreadyExistsError } from '../../domain/errors/PlayerAlreadyExistsError.js';
import { FakePasswordHasher } from '../mocks/FakePasswordHasher.js';
import { InMemoryPlayerRepository } from '../mocks/InMemoryPlayerRepository.js';
import { RegisterPlayerUseCase } from './RegisterPlayerUseCase.js';

describe('RegisterPlayerUseCase', () => {
  let playerRepository: InMemoryPlayerRepository;
  let passwordHasher: FakePasswordHasher;
  let sut: RegisterPlayerUseCase;

  beforeEach(() => {
    playerRepository = new InMemoryPlayerRepository();
    passwordHasher = new FakePasswordHasher();
    sut = new RegisterPlayerUseCase(playerRepository, passwordHasher);
  });

  it('should successfully register a new player and their stats', async () => {
    const request = {
      username: 'magnus_carlsen',
      email: 'magnus@chess.com',
      rawPassword: 'StrongPassword123!',
    };
    const defaultElo = 1200;

    await sut.execute(request);

    expect(playerRepository.players).toHaveLength(1);
    expect(playerRepository.stats).toHaveLength(1);

    const savedPlayer = playerRepository.players[0]!.getSnapshot();
    expect(savedPlayer.username).toBe(request.username);
    expect(savedPlayer.email).toBe(request.email);
    expect(savedPlayer.passwordHash).toBe(`${request.rawPassword}_hashed`);

    const savedStats = playerRepository.stats[0]!.getSnapshot();
    expect(savedStats.playerId).toBe(savedPlayer.id);
    expect(savedStats.currentElo).toBe(defaultElo);
  });

  it('should throw PlayerAlreadyExistsError if email is already taken', async () => {
    const uniqueEmail = 'conflict@chess.com';
    const firstRequest = {
      username: 'player_one',
      email: uniqueEmail,
      rawPassword: 'Password123!',
    };

    await sut.execute(firstRequest);

    const duplicateEmailRequest = {
      username: 'player_two',
      email: uniqueEmail,
      rawPassword: 'Password123!',
    };

    await expect(sut.execute(duplicateEmailRequest)).rejects.toThrow(PlayerAlreadyExistsError);
    await expect(sut.execute(duplicateEmailRequest)).rejects.toThrow(
      'Email address is already in use.',
    );
  });

  it('should throw PlayerAlreadyExistsError if username is already taken', async () => {
    const uniqueUsername = 'unique_username';
    const firstRequest = {
      username: uniqueUsername,
      email: 'first@chess.com',
      rawPassword: 'Password123!',
    };

    await sut.execute(firstRequest);

    const duplicateUsernameRequest = {
      username: uniqueUsername,
      email: 'second@chess.com',
      rawPassword: 'Password123!',
    };

    await expect(sut.execute(duplicateUsernameRequest)).rejects.toThrow(PlayerAlreadyExistsError);
    await expect(sut.execute(duplicateUsernameRequest)).rejects.toThrow(
      'Username is already taken.',
    );
  });
});

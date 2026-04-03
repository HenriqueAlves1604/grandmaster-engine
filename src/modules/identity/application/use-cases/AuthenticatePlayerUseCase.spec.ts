import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Player } from '../../domain/entities/Player.js';
import { InvalidCredentialsError } from '../../domain/errors/InvalidCredentialsError.js';
import { InvalidEmailError } from '../../domain/errors/InvalidEmailError.js';
import type { TokenProviderPort } from '../../domain/ports/TokenProviderPort.js';
import { FakePasswordHasher } from '../mocks/FakePasswordHasher.js';
import { InMemoryPlayerRepository } from '../mocks/InMemoryPlayerRepository.js';
import { AuthenticatePlayerUseCase } from './AuthenticatePlayerUseCase.js';

describe('AuthenticatePlayerUseCase', () => {
  let playerRepository: InMemoryPlayerRepository;
  let passwordHasher: FakePasswordHasher;
  let tokenProvider: TokenProviderPort;
  let sut: AuthenticatePlayerUseCase;

  const validPassword = 'StrongPassword123!';
  const mockedHash = `${validPassword}_hashed`;
  const existingPlayerEmail = 'magnus@chess.com';
  const mockedJwtToken = 'mocked.jwt.token';

  beforeEach(async () => {
    playerRepository = new InMemoryPlayerRepository();
    passwordHasher = new FakePasswordHasher();

    tokenProvider = {
      generateToken: vi.fn().mockReturnValue(mockedJwtToken),
      verifyToken: vi.fn(),
    };

    sut = new AuthenticatePlayerUseCase(playerRepository, passwordHasher, tokenProvider);

    // Seed the in-memory repository with an existing player
    const player = Player.create('grandmaster', existingPlayerEmail, mockedHash);
    await playerRepository.save(player);
  });

  it('should successfully authenticate with valid credentials', async () => {
    const request = {
      email: existingPlayerEmail,
      rawPassword: validPassword,
    };

    const response = await sut.execute(request);

    expect(tokenProvider.generateToken).toHaveBeenCalledOnce();
    expect(response.token).toBe(mockedJwtToken);

    expect(response.player.id).toBeDefined();
    expect(response.player.username).toBe('grandmaster');
    expect(response.player.email).toBe(existingPlayerEmail);
  });

  it('should throw InvalidCredentialsError if email is not found', async () => {
    const request = {
      email: 'ghost@chess.com',
      rawPassword: validPassword,
    };

    await expect(sut.execute(request)).rejects.toThrow(InvalidCredentialsError);
  });

  it('should throw InvalidCredentialsError if password does not match', async () => {
    const request = {
      email: existingPlayerEmail,
      rawPassword: 'WrongPassword!',
    };

    await expect(sut.execute(request)).rejects.toThrow(InvalidCredentialsError);
  });

  it('should throw InvalidEmailError if email format is invalid', async () => {
    const request = {
      email: 'not-an-email',
      rawPassword: validPassword,
    };

    await expect(sut.execute(request)).rejects.toThrow(InvalidEmailError);
  });
});

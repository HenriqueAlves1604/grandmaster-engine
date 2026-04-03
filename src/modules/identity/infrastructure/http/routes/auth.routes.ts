import { PrismaClient } from '@prisma/client';
import { validate } from '@shared/infrastructure/http/middlewares/ZodValidator.js';
import { Router } from 'express';
import { AuthenticatePlayerUseCase } from '../../../application/use-cases/AuthenticatePlayerUseCase.js';
import { AuthenticatePlayerController } from '../controllers/AuthenticatePlayerController.js';
import { authenticatePlayerSchema } from '../schemas/authenticatePlayerSchema.js';

import { BcryptPasswordHasher } from '../../adapters/BcryptPasswordHasher.js';
import { JwtTokenAdapter } from '../../adapters/JwtTokenAdapter.js';
import { PrismaPlayerRepository } from '../../adapters/PrismaPlayerRepository.js';

const authRouter: Router = Router();

const prismaClient = new PrismaClient();

const playerRepository = new PrismaPlayerRepository(prismaClient);
const passwordAdapter = new BcryptPasswordHasher();
const tokenAdapter = new JwtTokenAdapter();

const authenticatePlayerUseCase = new AuthenticatePlayerUseCase(
  playerRepository,
  passwordAdapter,
  tokenAdapter,
);

const authenticatePlayerController = new AuthenticatePlayerController(authenticatePlayerUseCase);

authRouter.post('/login', validate(authenticatePlayerSchema), authenticatePlayerController.handle);

export { authRouter };

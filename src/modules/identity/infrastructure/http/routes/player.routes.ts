import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { validate } from '../../../../../shared/infrastructure/http/middlewares/ZodValidator.js';
import { RegisterPlayerUseCase } from '../../../application/use-cases/RegisterPlayerUseCase.js';
import { BcryptPasswordHasher } from '../../adapters/BcryptPasswordHasher.js';
import { PrismaPlayerRepository } from '../../adapters/PrismaPlayerRepository.js';
import { RegisterPlayerController } from '../controllers/RegisterPlayerController.js';
import { registerPlayerSchema } from '../schemas/registerPlayerSchema.js';

const playerRouter: Router = Router();

// Dependency Injection
const prismaClient = new PrismaClient();
const playerRepository = new PrismaPlayerRepository(prismaClient);
const passwordHasher = new BcryptPasswordHasher();
const registerPlayerUseCase = new RegisterPlayerUseCase(playerRepository, passwordHasher);
const registerPlayerController = new RegisterPlayerController(registerPlayerUseCase);

// Routes
playerRouter.post('/register', validate(registerPlayerSchema), registerPlayerController.handle);

export { playerRouter };

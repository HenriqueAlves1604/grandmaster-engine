import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { ListTimeControlsUseCase } from '../../../application/use-cases/ListTimeControlsUseCase.js';
import { PrismaTimeControlRepository } from '../../adapters/PrismaTimeControlRepository.js';
import { ListTimeControlsController } from '../controllers/ListTimeControlsController.js';

const gameRulesRouter: Router = Router();

// Infrastructure
const prismaClient = new PrismaClient();

// Adapters
const timeControlRepository = new PrismaTimeControlRepository(prismaClient);

// Use Cases
const listTimeControlsUseCase = new ListTimeControlsUseCase(timeControlRepository);

// Controllers
const listTimeControlsController = new ListTimeControlsController(listTimeControlsUseCase);

// Routes
gameRulesRouter.get('/time-controls', listTimeControlsController.handle);

export { gameRulesRouter };

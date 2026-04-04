import { PrismaClient } from '@prisma/client';
import { validate } from '@shared/infrastructure/http/middlewares/ZodValidator.js';
import { Router } from 'express';

// Schemas
import { authenticatePlayerSchema } from '../schemas/authenticatePlayerSchema.js';
import { refreshAccessTokenSchema } from '../schemas/refreshAccessTokenSchema.js';

// Use Cases
import { AuthenticatePlayerUseCase } from '../../../application/use-cases/AuthenticatePlayerUseCase.js';
import { RefreshAccessTokenUseCase } from '../../../application/use-cases/RefreshAccessTokenUseCase.js';

// Controllers
import { AuthenticatePlayerController } from '../controllers/AuthenticatePlayerController.js';
import { RefreshAccessTokenController } from '../controllers/RefreshAccessTokenController.js';

// Adapters
import { BcryptPasswordHasher } from '../../adapters/BcryptPasswordHasher.js';
import { JwtTokenAdapter } from '../../adapters/JwtTokenAdapter.js';
import { PrismaPlayerRepository } from '../../adapters/PrismaPlayerRepository.js';
import { PrismaRefreshTokenRepository } from '../../adapters/PrismaRefreshTokenRepository.js';

const authRouter: Router = Router();

// Infrastructure init
const prismaClient = new PrismaClient();

// Adapters init
const playerRepository = new PrismaPlayerRepository(prismaClient);
const passwordAdapter = new BcryptPasswordHasher();
const tokenAdapter = new JwtTokenAdapter();
const refreshTokenRepository = new PrismaRefreshTokenRepository(prismaClient);

// Use Cases init
const authenticatePlayerUseCase = new AuthenticatePlayerUseCase(
  playerRepository,
  passwordAdapter,
  tokenAdapter,
  refreshTokenRepository,
);

const refreshAccessTokenUseCase = new RefreshAccessTokenUseCase(
  playerRepository,
  refreshTokenRepository,
  tokenAdapter,
);

// Controllers init
const authenticatePlayerController = new AuthenticatePlayerController(authenticatePlayerUseCase);

const refreshAccessTokenController = new RefreshAccessTokenController(refreshAccessTokenUseCase);

// Routes
authRouter.post('/login', validate(authenticatePlayerSchema), authenticatePlayerController.handle);

authRouter.post(
  '/refresh',
  validate(refreshAccessTokenSchema),
  refreshAccessTokenController.handle,
);

export { authRouter };

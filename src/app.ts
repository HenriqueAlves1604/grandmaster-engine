import { gameRulesRouter } from '@modules/game-rules/infrastructure/http/routes/game-rules.routes.js';
import 'dotenv/config';
import express, { type Express } from 'express';
import { authRouter } from './modules/identity/infrastructure/http/routes/auth.routes.js';
import { playerRouter } from './modules/identity/infrastructure/http/routes/player.routes.js';
import { errorHandler } from './shared/infrastructure/http/middlewares/ErrorHandler.js';

const app: Express = express();

// Built-in Middlewares
app.use(express.json());

// Routes Registration
app.use('/api/v1/players', playerRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/game-rules', gameRulesRouter);

// Global Error Handler
app.use(errorHandler);

export { app };

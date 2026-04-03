import 'dotenv/config';
import express, { type Express } from 'express';
import { authRouter } from './modules/identity/infrastructure/http/routes/auth.routes.js';
import { playerRouter } from './modules/identity/infrastructure/http/routes/player.routes.js';
import { errorHandler } from './shared/infrastructure/http/middlewares/ErrorHandler.js';

const app: Express = express();

// 1. Built-in Middlewares
app.use(express.json());

// 2. Routes Registration
app.use('/api/v1/players', playerRouter);
app.use('/api/v1/auth', authRouter);

// 3. Global Error Handler
app.use(errorHandler);

export { app };

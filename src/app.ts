import 'dotenv/config';
import express, { type Express } from 'express';
import { playerRouter } from './modules/identity/infrastructure/http/routes/player.routes.js';
import { errorHandler } from './shared/infrastructure/http/middlewares/ErrorHandler.js';

const app: Express = express();

// 1. Built-in Middlewares
app.use(express.json());

// 2. Routes Registration
app.use('/api/v1/players', playerRouter);

// 3. Global Error Handler
app.use(errorHandler);

export { app };

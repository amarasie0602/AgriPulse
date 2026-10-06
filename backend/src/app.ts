import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { farmsRouter } from './modules/farms/farms.routes';
import { resourcesRouter } from './modules/resources/resources.routes';
import { usersRouter } from './modules/users/users.routes';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_URL }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'agripulse-backend' });
  });

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/farms', farmsRouter);
  app.use('/resources', resourcesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

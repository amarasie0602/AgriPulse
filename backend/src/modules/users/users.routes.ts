import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import { usersController } from './users.controller';
import { updateProfileSchema } from './users.validation';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, usersController.me);
usersRouter.patch('/me', requireAuth, validateBody(updateProfileSchema), usersController.updateMe);

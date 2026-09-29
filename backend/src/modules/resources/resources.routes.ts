import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import { resourcesController } from './resources.controller';
import { createResourceEntrySchema } from './resources.validation';

export const resourcesRouter = Router();

resourcesRouter.use(requireAuth);

resourcesRouter.get('/', resourcesController.list);
resourcesRouter.post('/', validateBody(createResourceEntrySchema), resourcesController.create);
resourcesRouter.get('/summary', resourcesController.summary);
resourcesRouter.delete('/:id', resourcesController.remove);

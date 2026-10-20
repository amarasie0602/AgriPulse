import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import { resourcesController } from './resources.controller';
import { createResourceEntrySchema } from './resources.validation';
import { resourcesService } from './resources.service';

export const resourcesRouter = Router();

resourcesRouter.use(requireAuth);

resourcesRouter.get('/', resourcesController.list);
resourcesRouter.post('/', validateBody(createResourceEntrySchema), resourcesController.create);
resourcesRouter.put<{ id: string }>('/:id', validateBody(createResourceEntrySchema), async (req, res) => {
  res.json(await resourcesService.update(req.auth!.sub, req.params.id, req.body));
});
resourcesRouter.get('/summary', resourcesController.summary);
resourcesRouter.delete('/:id', resourcesController.remove);

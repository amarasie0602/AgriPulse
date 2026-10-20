import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import { farmsService } from './farms.service';
import { createFarmSchema, updateFarmSchema } from './farms.validation';

export const farmsRouter = Router();
farmsRouter.use(requireAuth);
// Express 5 forwards rejected async handlers to the existing error middleware.
farmsRouter.get('/', async (req, res) => {
  res.json(await farmsService.list(req.auth!.sub));
});
farmsRouter.post('/', validateBody(createFarmSchema), async (req, res) => {
  res.status(201).json(await farmsService.create(req.auth!.sub, req.body));
});
farmsRouter.get<{ id: string }>('/:id', async (req, res) => {
  res.json(await farmsService.get(req.auth!.sub, req.params.id));
});
farmsRouter.patch<{ id: string }>('/:id', validateBody(updateFarmSchema), async (req, res) => {
  res.json(await farmsService.update(req.auth!.sub, req.params.id, req.body));
});
farmsRouter.delete<{ id: string }>('/:id', async (req, res) => {
  await farmsService.remove(req.auth!.sub, req.params.id);
  res.status(204).end();
});

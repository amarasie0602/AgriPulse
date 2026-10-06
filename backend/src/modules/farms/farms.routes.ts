import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import { farmsController } from './farms.controller';
import { createFarmSchema, createFieldSchema, updateFarmSchema, updateFieldSchema } from './farms.validation';

export const farmsRouter = Router();

farmsRouter.use(requireAuth);

farmsRouter.get('/', farmsController.list);
farmsRouter.post('/', validateBody(createFarmSchema), farmsController.create);
farmsRouter.get('/:farmId', farmsController.getById);
farmsRouter.patch('/:farmId', validateBody(updateFarmSchema), farmsController.update);
farmsRouter.delete('/:farmId', farmsController.remove);
farmsRouter.post('/:farmId/fields', validateBody(createFieldSchema), farmsController.addField);
farmsRouter.patch('/:farmId/fields/:fieldId', validateBody(updateFieldSchema), farmsController.updateField);
farmsRouter.delete('/:farmId/fields/:fieldId', farmsController.removeField);

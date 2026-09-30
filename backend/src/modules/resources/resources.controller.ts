import type { NextFunction, Request, Response } from 'express';
import { resourcesService } from './resources.service';
import type { CreateResourceEntryInput } from './resources.validation';

export const resourcesController = {
  async create(req: Request<unknown, unknown, CreateResourceEntryInput>, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await resourcesService.create(req.auth!.sub, req.body);
      res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entries = await resourcesService.list(req.auth!.sub);
      res.status(200).json(entries);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      await resourcesService.remove(req.auth!.sub, req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  async summary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await resourcesService.summary(req.auth!.sub);
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  },
};

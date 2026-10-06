import type { NextFunction, Request, Response } from 'express';
import { farmsService } from './farms.service';
import type { CreateFarmInput, CreateFieldInput, UpdateFarmInput, UpdateFieldInput } from './farms.validation';

export const farmsController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const farms = await farmsService.list(req.auth!.sub);
      res.status(200).json(farms);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request<unknown, unknown, CreateFarmInput>, res: Response, next: NextFunction): Promise<void> {
    try {
      const farm = await farmsService.create(req.auth!.sub, req.body);
      res.status(201).json(farm);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request<{ farmId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const farm = await farmsService.getById(req.auth!.sub, req.params.farmId);
      res.status(200).json(farm);
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: Request<{ farmId: string }, unknown, UpdateFarmInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const farm = await farmsService.update(req.auth!.sub, req.params.farmId, req.body);
      res.status(200).json(farm);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request<{ farmId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      await farmsService.remove(req.auth!.sub, req.params.farmId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  async addField(
    req: Request<{ farmId: string }, unknown, CreateFieldInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const farm = await farmsService.addField(req.auth!.sub, req.params.farmId, req.body);
      res.status(201).json(farm);
    } catch (error) {
      next(error);
    }
  },

  async updateField(
    req: Request<{ farmId: string; fieldId: string }, unknown, UpdateFieldInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const farm = await farmsService.updateField(req.auth!.sub, req.params.farmId, req.params.fieldId, req.body);
      res.status(200).json(farm);
    } catch (error) {
      next(error);
    }
  },

  async removeField(req: Request<{ farmId: string; fieldId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const farm = await farmsService.removeField(req.auth!.sub, req.params.farmId, req.params.fieldId);
      res.status(200).json(farm);
    } catch (error) {
      next(error);
    }
  },
};

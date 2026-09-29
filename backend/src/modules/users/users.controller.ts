import type { NextFunction, Request, Response } from 'express';
import { usersService } from './users.service';
import type { UpdateProfileInput } from './users.validation';

export const usersController = {
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // requireAuth guarantees req.auth is set before this handler runs.
      const profile = await usersService.getProfile(req.auth!.sub);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  },

  async updateMe(req: Request<unknown, unknown, UpdateProfileInput>, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await usersService.updateProfile(req.auth!.sub, req.body);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  },
};

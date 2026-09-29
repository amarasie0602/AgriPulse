import type { NextFunction, Request, Response } from 'express';
import { authService } from './auth.service';
import type { GoogleAuthInput, LoginInput, RegisterInput } from './auth.validation';

export const authController = {
  async register(req: Request<unknown, unknown, RegisterInput>, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request<unknown, unknown, LoginInput>, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async google(req: Request<unknown, unknown, GoogleAuthInput>, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.loginWithGoogle(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /** Lets the frontend validate a stored token / re-fetch the current profile. */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.auth ? await authService.findPublicUserById(req.auth.sub) : null;
      if (!user) {
        res.status(401).json({ message: 'This account no longer exists.' });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
};

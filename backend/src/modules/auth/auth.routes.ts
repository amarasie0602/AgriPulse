import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import { authController } from './auth.controller';
import { googleAuthSchema, loginSchema, registerSchema } from './auth.validation';

export const authRouter = Router();

// The frontend already handles 429 with a friendly message.
const registerLimiter = rateLimit({ windowMs: 60_000, limit: 5, standardHeaders: true, legacyHeaders: false });
const loginLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: true, legacyHeaders: false });
const googleLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: true, legacyHeaders: false });

authRouter.post('/register', registerLimiter, validateBody(registerSchema), authController.register);
authRouter.post('/login', loginLimiter, validateBody(loginSchema), authController.login);
authRouter.post('/google', googleLimiter, validateBody(googleAuthSchema), authController.google);
authRouter.get('/me', requireAuth, authController.me);

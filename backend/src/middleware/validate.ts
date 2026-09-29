import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

/**
 * Validates req.body against a Zod schema and replaces it with the parsed
 * (trimmed, defaulted) value. Sends a 400 with per-field messages on failure.
 */
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: 'Please check the details you entered and try again.',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    req.body = result.data;
    next();
  };
}

import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../common/errors/http-error';

interface MongoDuplicateKeyError extends Error {
  code: number;
}

function isDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
  return error instanceof Error && (error as MongoDuplicateKeyError).code === 11000;
}

/**
 * Centralised error -> JSON response mapping. Registered last, after all routes.
 * Never forwards a raw error message or stack trace to the client.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message });
    return;
  }

  if (isDuplicateKeyError(error)) {
    res.status(409).json({ message: 'An account with this email already exists.' });
    return;
  }

  console.error(error);
  res.status(500).json({ message: 'AgriPulse ran into a problem. Please try again shortly.' });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Not found.' });
}

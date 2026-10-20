import 'dotenv/config';
import { z } from 'zod';

/** Validates process.env once at startup so a missing/malformed value fails fast, not mid-request. */
const envSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters; use a strong random value'),
  JWT_EXPIRES_IN: z.string().trim().min(1, 'JWT_EXPIRES_IN is required'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  /** Optional: enables POST /auth/google. Must match the frontend's VITE_GOOGLE_CLIENT_ID. */
  GOOGLE_CLIENT_ID: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
  PORT: z.coerce.number().int().positive(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  console.error('\nFor local development, set these values in backend/.env.');
  console.error('For Docker Compose, set JWT_SECRET in the project-root .env; Compose supplies the container MongoDB URI.');
  process.exit(1);
}

export const env = parsed.data;

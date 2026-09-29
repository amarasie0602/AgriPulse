import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`AgriPulse API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((error: unknown) => {
  console.error('Failed to start AgriPulse API:', error);
  process.exit(1);
});

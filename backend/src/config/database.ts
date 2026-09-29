import mongoose from 'mongoose';
import { env } from './env';

/** Connects to the local MongoDB instance named by MONGODB_URI. */
export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
  console.log(`Connected to MongoDB at ${env.MONGODB_URI}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

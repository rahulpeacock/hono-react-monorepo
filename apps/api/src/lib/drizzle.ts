import { env } from '@/lib/env';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Create the neon http client
const sql = neon(env.DATABASE_URL);

// Create the drizzle database instance
export const db = drizzle({ client: sql });

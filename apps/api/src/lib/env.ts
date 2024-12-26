import { config } from 'dotenv';
import { type ZodError, z } from 'zod';

// Load environment variables from .env file
config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
  PORT: z.coerce.number().default(3000),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (err) {
  const error = err as ZodError;
  console.error('❌ Invalid env:');
  console.error(error.flatten().fieldErrors);
  process.exit(1);
}

export { env };

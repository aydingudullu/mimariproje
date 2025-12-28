import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  // Email configuration (optional in development)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().email().optional().default('noreply@mimariproje.com'),
  SMTP_FROM_NAME: z.string().optional().default('Mimariproje.com'),
});

export const env = envSchema.parse(process.env);

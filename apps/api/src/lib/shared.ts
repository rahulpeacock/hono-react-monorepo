import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }).max(32, { message: 'Name must not exceed 32 characters' }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .max(255, { message: 'Email must not exceed 255 characters' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(128, { message: 'Password must not exceed 100 characters' }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .max(255, { message: 'Email must not exceed 255 characters' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(128, { message: 'Password must not exceed 100 characters' }),
});

export const verifyEmailSchema = z.object({
  code: z.string().min(8, {
    message: 'Your code must be 8 digits.',
  }),
});

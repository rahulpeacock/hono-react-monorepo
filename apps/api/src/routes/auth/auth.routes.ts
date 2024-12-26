import { internalServerErrorSchema, unauthorizedSchema } from '@/lib/constants';
import { loginSchema, signupSchema, verifyEmailSchema } from '@/lib/shared';
import { authMiddleware } from '@/middlewares/auth';
import { sessionTable, userTable } from '@/schemas/db';
import { createRoute, z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

export const signup = createRoute({
  method: 'post',
  path: '/auth/signup',
  tags: ['Auth'],
  request: {
    body: jsonContentRequired(signupSchema, 'Signup request'),
  },
  responses: {
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(signupSchema), 'Validation error'),
    409: jsonContent(
      z.object({
        error: z.string(),
        message: z.string(),
      }),
      'Email already registered',
    ),
    200: jsonContent(
      z.object({
        redirect: z.string(),
      }),
      'Signup successful',
    ),
  },
});

export const login = createRoute({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  request: {
    body: jsonContentRequired(loginSchema, 'Login request'),
  },
  responses: {
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(signupSchema), 'Validation error'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        error: z.string(),
        message: z.string(),
      }),
      'User unauthroized',
    ),
    200: jsonContent(
      z.object({
        redirect: z.string(),
      }),
      'Login successful',
    ),
  },
});

export const verifyEmail = createRoute({
  method: 'post',
  path: '/auth/verify-email',
  tags: ['Auth'],
  request: {
    body: jsonContentRequired(verifyEmailSchema, 'Verify email request'),
  },
  responses: {
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(verifyEmailSchema), 'Validation error'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        error: z.string(),
        message: z.string(),
      }),
      'User unauthroized',
    ),
    [HttpStatusCodes.GONE]: jsonContent(
      z.object({
        error: z.string(),
        message: z.string(),
      }),
      'Verification code expired',
    ),
    200: jsonContent(
      z.object({
        message: z.string(),
      }),
      'Verify email successful',
    ),
  },
});

export const resendVerificationCode = createRoute({
  method: 'post',
  path: '/auth/resend-verification-code',
  tags: ['Auth'],
  request: {},
  responses: {
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        error: z.string(),
        message: z.string(),
      }),
      'User unauthroized',
    ),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(
      z.object({
        error: z.string(),
        message: z.string(),
      }),
      'Verification code expired',
    ),
    200: jsonContent(
      z.object({
        message: z.string(),
      }),
      'Verify email successful',
    ),
  },
});

export const getSession = createRoute({
  method: 'get',
  path: '/auth/get-session',
  tags: ['Auth'],
  request: {},
  responses: {
    200: jsonContent(
      z.union([
        z.object({
          session: createSelectSchema(sessionTable),
          user: createSelectSchema(userTable, {
            user_metadata: z.object({
              name: z.string(),
              avatar_url: z.string().nullable(),
            }),
          }),
        }),
        z.object({
          session: z.null(),
          user: z.null(),
        }),
      ]),
      'Auth session',
    ),
  },
});

export type SignupRoute = typeof signup;
export type LoginRoute = typeof login;
export type VerifyEmailRoute = typeof verifyEmail;
export type ResendVerificationCode = typeof resendVerificationCode;
export type GetSession = typeof getSession;

export const signOut = createRoute({
  method: 'post',
  path: '/auth/sign-out',
  tags: ['Auth'],
  middleware: authMiddleware,
  request: {},
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to sign out'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, 'Sign out successful'),
    [HttpStatusCodes.OK]: jsonContent(z.object({ message: z.string() }), 'Sign out successful'),
  },
});

export type SignoutRoute = typeof signOut;

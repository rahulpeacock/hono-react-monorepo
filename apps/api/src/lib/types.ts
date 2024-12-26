import type { Session, User } from '@/api/schemas/db';
import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';
import type { PinoLogger } from 'hono-pino';

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}

export interface AuthenticatedAppBindings {
  Variables: AppBindings['Variables'] & {
    auth: {
      session: Session;
      user: User;
    };
  };
}

export type AppOpenApi = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export type AuthenticatedAppRouteHandler<R extends RouteConfig> = RouteHandler<R, AuthenticatedAppBindings>;

// Auth types

export type ProviderType = 'credentials' | 'google' | 'github';
export interface EmailVerificationRequest {
  id: string;
  userId: number;
  code: string;
  email: string;
  expiresAt: Date;
}

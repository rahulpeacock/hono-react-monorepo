import type { Session, User } from '@/schemas/db';
import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';
import type { PinoLogger } from 'hono-pino';

/**
 * Represents the bindings available for Hono or OpenAPIHono instances within the application context.
 *
 * @property {Object} Variables - A collection of variables available within the application context.
 * @property {PinoLogger} Variables.logger - The logger instance for logging purposes.
 */
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

/**
 * Represents the OpenAPI configuration for the application.
 *
 * This type extends the OpenAPIHono type from '@hono/zod-openapi' and is bound to the AppBindings context.
 */
export type AppOpenApi = OpenAPIHono<AppBindings>;

/**
 * Represents a route handler specifically designed for the application context.
 *
 * This type extends the RouteHandler type from '@hono/zod-openapi' and is bound to the AppBindings context.
 *
 * @template R - The route configuration type.
 * @extends RouteHandler<R, AppBindings>
 */
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export type AuthenticatedAppRouteHandler<R extends RouteConfig> = RouteHandler<R, AuthenticatedAppBindings>;

export type ProviderType = 'credentials' | 'google' | 'github';
export interface EmailVerificationRequest {
  id: string;
  userId: number;
  code: string;
  email: string;
  expiresAt: Date;
}

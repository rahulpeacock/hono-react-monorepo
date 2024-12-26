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
      session: string;
      user: string;
    };
  };
}

export type AppOpenApi = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

export type AuthenticatedAppRouteHandler<R extends RouteConfig> = RouteHandler<R, AuthenticatedAppBindings>;

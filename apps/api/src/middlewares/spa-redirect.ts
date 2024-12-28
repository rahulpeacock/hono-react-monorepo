import { env } from '@/api/lib/env';
import { serveStatic } from '@hono/node-server/serve-static';
import { createMiddleware } from 'hono/factory';
import { BASE_PATH } from '../lib/constants';

export const spaFavicon = createMiddleware(serveStatic({ path: `${env.SPA_ROOT_DIR}/vite.svg` }));

export const spaRedirect = createMiddleware(async (c, next) => {
  if (c.req.path.startsWith(BASE_PATH)) {
    return next();
  }

  if (c.req.path.startsWith(env.SPA_ASSETS_PATH)) {
    return serveStatic({ root: env.SPA_ROOT_DIR })(c, next);
  }

  // SPA redirect to /index.html
  return serveStatic({ path: `${env.SPA_ROOT_DIR}/index.html` })(c, next);
});

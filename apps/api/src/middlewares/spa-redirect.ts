import { serveStatic } from '@hono/node-server/serve-static';
import { createMiddleware } from 'hono/factory';
import { BASE_PATH } from '../lib/constants';

export const spaFavicon = createMiddleware(serveStatic({ path: './public/vite.svg' }));

export const spaRedirect = createMiddleware(async (c, next) => {
  if (c.req.path.startsWith(BASE_PATH)) {
    return next();
  }

  if (c.req.path.startsWith('/static')) {
    return serveStatic({ root: './public' })(c, next);
  }

  // SPA redirect to /index.html
  return serveStatic({ path: './public/index.html' })(c, next);
});

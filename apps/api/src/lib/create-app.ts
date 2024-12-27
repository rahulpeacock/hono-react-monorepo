import { pinoLogger } from '@/api/middlewares/pino-logger';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';
import { createRouter } from './create-router';

export default function createApp() {
  const app = createRouter();

  // app.get('*', async (c, next) => {
  //   if (c.req.path.startsWith(BASE_PATH)) {
  //     return next();
  //   }
  //   // SPA redirect to /index.html
  //   return serveStatic({ path: './frontend/dist/index.html' })(c, next);
  // });

  // app.get('*', serveStatic({ root: './frontend/dist' }));
  // app.get('*', serveStatic({ path: './frontend/dist/index.html' }));

  app.use(serveEmojiFavicon('🍀'));
  app.use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);

  return app;
}

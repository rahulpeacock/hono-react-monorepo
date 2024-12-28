import { pinoLogger } from '@/api/middlewares/pino-logger';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';
import { spaFavicon, spaRedirect } from '../middlewares/spa-redirect';
import { createRouter } from './create-router';

export default function createApp() {
  const app = createRouter();

  // SPA redirect
  app.use('/vite.svg', spaFavicon);
  app.use(spaRedirect);

  app.use(serveEmojiFavicon('🍀'));
  app.use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);

  return app;
}

import { configureOpenApi } from '@/lib/configure-open-api';
import createApp from '@/lib/create-app';
import authRouter from '@/routes/auth/auth.base';
import chapterRouter from '@/routes/chapter/chapter.base';
import courseRouter from '@/routes/course/course.base';
import index from '@/routes/index';
import serverProxy from '@/routes/server-proxy';
import shellRouter from '@/routes/shell/shell.base';
import userRouter from '@/routes/user/user.base';
import { serveStatic } from '@hono/node-server/serve-static';

const app = createApp();

configureOpenApi(app);

app
  .route('/api', index)
  .route('/api', authRouter)
  .route('/api', shellRouter)
  .route('/api', courseRouter)
  .route('/api', chapterRouter)
  .route('/api', userRouter)
  .route('/api', serverProxy);

app.get('*', serveStatic({ root: './frontend/dist' }));
app.get('*', serveStatic({ path: './frontend/dist/index.html' }));

export default app;

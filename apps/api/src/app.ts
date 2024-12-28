import { configureOpenApi } from '@/api/lib/configure-open-api';
import createApp from '@/api/lib/create-app';
import index from '@/api/routes/index';
import tasks from '@/api/routes/tasks/tasks.base';

const app = createApp();

configureOpenApi(app);

app.route('/', index).route('/', tasks);

export default app;

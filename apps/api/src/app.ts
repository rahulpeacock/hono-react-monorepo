import { configureOpenApi } from '@/api/lib/configure-open-api';
import createApp from '@/api/lib/create-app';
import index from '@/api/routes/index';

const app = createApp();

configureOpenApi(app);

app.route('/api', index);

export default app;
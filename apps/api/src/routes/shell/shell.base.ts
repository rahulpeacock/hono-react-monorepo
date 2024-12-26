import { createRouter } from '@/lib/create-app';
import * as handlers from './shell.handlers';
import * as routes from './shell.routes';

const router = createRouter().openapi(routes.shellConnection, handlers.shellConnection);

export default router;
export type ShellRouterType = typeof router;

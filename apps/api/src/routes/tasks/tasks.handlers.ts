import type { AppMiddlewareVariables, AppRouteHandler } from '@/api/lib/types';
import type { CreateTasksRoute } from './tasks.routes';

export const createTasks: AppRouteHandler<
  CreateTasksRoute,
  AppMiddlewareVariables<{
    foo: string;
    bar: number;
  }>
> = (c) => {
  const foo = c.get('foo');
  const bar = c.get('bar');

  console.log({ foo, bar });

  return c.json({ created: 'created' }, 200);
};

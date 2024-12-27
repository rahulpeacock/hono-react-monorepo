import { createRoute, z } from '@hono/zod-openapi';
import { createMiddleware } from 'hono/factory';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

export const createTasks = createRoute({
  method: 'post',
  path: '/tasks',
  tags: ['Tasks'],
  middleware: [
    createMiddleware<{
      Variables: { foo: string };
    }>((c, next) => {
      console.log('foo middleware');
      c.set('foo', 'abc');
      return next();
    }),
    createMiddleware<{
      Variables: { bar: number };
    }>((c, next) => {
      console.log('bar middleware');
      c.set('bar', 321);
      return next();
    }),
  ] as const,
  request: {},
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.object({ created: z.string() }), 'Successful response'),
  },
});
export type CreateTasksRoute = typeof createTasks;

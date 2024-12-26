import { internalServerErrorSchema, notFoundSchema, unauthorizedSchema } from '@/lib/constants';
import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';
import { getShellRequestSchema } from './shell.schema';

export const shellConnection = createRoute({
  method: 'get',
  path: '/app/shell/{course_id}',
  tags: ['Shell'],
  request: {
    params: getShellRequestSchema.params,
  },
  responses: {
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(getShellRequestSchema.params), 'Validation error'),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to create course'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, 'User unauthroized'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Course not found'),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: jsonContent(z.object({ authToken: z.string() }), 'No connection available'),
    [HttpStatusCodes.OK]: jsonContent(z.object({ authToken: z.string(), identifier: z.number() }), 'Shell credentials success'),
  },
});

export type ShellConnectionRoute = typeof shellConnection;

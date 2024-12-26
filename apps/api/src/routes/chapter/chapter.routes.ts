import { forbiddenSchema, internalServerErrorSchema, notFoundSchema, unauthorizedSchema } from '@/lib/constants';
import { authMiddleware } from '@/middlewares/auth';
import { chapterTable } from '@/schemas/db';
import { createRoute, z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';
import {
  createChapterRequestSchema,
  deleteChapterRequestSchema,
  getChapterRequestSchema,
  getChaptersRequestSchema,
  updateChapterRequestSchema,
} from './chapter.schemas';

// TODO: middleware for course-creator role
export const createChapter = createRoute({
  method: 'post',
  path: '/courses/{course_id}/chapters',
  tags: ['Chapters'],
  middleware: authMiddleware,
  request: {
    params: createChapterRequestSchema.params,
    body: jsonContentRequired(createChapterRequestSchema.body, 'New chapter body'),
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to create chapter'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, 'User unauthroized'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createChapterRequestSchema.params).or(createErrorSchema(createChapterRequestSchema.body)),
      'Validation error',
    ),
    [HttpStatusCodes.CREATED]: jsonContent(createSelectSchema(chapterTable), 'The created chapter'),
  },
});

export const getChapter = createRoute({
  method: 'get',
  path: '/courses/{course_id}/chapters/{chapter_id}',
  tags: ['Chapters'],
  middleware: authMiddleware,
  request: {
    params: getChapterRequestSchema.params,
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to get chapter'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(getChapterRequestSchema.params), 'Validation error'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Chapter not found'),
    [HttpStatusCodes.OK]: jsonContent(createSelectSchema(chapterTable), 'The requested chapter'),
  },
});

export const updateChapter = createRoute({
  method: 'patch',
  path: '/courses/{course_id}/chapters/{chapter_id}',
  tags: ['Chapters'],
  middleware: authMiddleware,
  request: {
    params: updateChapterRequestSchema.params,
    body: jsonContentRequired(updateChapterRequestSchema.body, 'Update a chapter body'),
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to update chapter'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Chapter not found'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, 'User unauthroized'),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(forbiddenSchema, 'User forbidden'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(updateChapterRequestSchema.params).or(createErrorSchema(updateChapterRequestSchema.body)),
      'Validation error',
    ),
    [HttpStatusCodes.OK]: jsonContent(createSelectSchema(chapterTable), 'The updated chapter'),
  },
});

export const deleteChapter = createRoute({
  method: 'delete',
  path: '/courses/{course_id}/chapters/{chapter_id}',
  tags: ['Chapters'],
  middleware: authMiddleware,
  request: {
    params: deleteChapterRequestSchema.params,
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to delete chapter'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(deleteChapterRequestSchema.params), 'Validation error'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, 'User unauthroized'),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(forbiddenSchema, 'User forbidden'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Chapter not found'),
    [HttpStatusCodes.NO_CONTENT]: { description: 'Chapter deleted' },
  },
});

export type CreateChapterRoute = typeof createChapter;
export type GetChapterRoute = typeof getChapter;
export type UpdateChapterRoute = typeof updateChapter;
export type DeleteChapterRoute = typeof deleteChapter;

export const getChapters = createRoute({
  method: 'get',
  path: '/courses/{course_id}/chapters',
  tags: ['Chapters'],
  request: {
    params: getChaptersRequestSchema.params,
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to get chapters'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(getChaptersRequestSchema.params), 'Validation error'),
    [HttpStatusCodes.OK]: jsonContent(z.array(createSelectSchema(chapterTable)), 'The requested chapters'),
  },
});

export type GetChaptersRoute = typeof getChapters;

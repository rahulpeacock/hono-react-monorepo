import { internalServerErrorSchema, notFoundSchema, unauthorizedSchema } from '@/lib/constants';
import { authMiddleware } from '@/middlewares/auth';
import { courseTable } from '@/schemas/db';
import { createRoute, z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';
import { createCourseRequestSchema, deleteCourseRequestSchema, getCourseRequestSchema, updateCourseRequestSchema } from './course.schemas';

export const createCourse = createRoute({
  method: 'post',
  path: '/courses',
  tags: ['Courses'],
  middleware: authMiddleware,
  request: {
    body: jsonContentRequired(createCourseRequestSchema.body, 'New course body'),
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to create course'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, 'User unauthroized'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(createCourseRequestSchema.body), 'Validation errors'),
    [HttpStatusCodes.CREATED]: jsonContent(createSelectSchema(courseTable), 'Created course'),
  },
});

export const getCourse = createRoute({
  method: 'get',
  path: '/courses/{course_id}',
  tags: ['Courses'],
  request: {
    params: getCourseRequestSchema.params,
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to get course'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(getCourseRequestSchema.params), 'Validation error'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Course not found'),
    [HttpStatusCodes.OK]: jsonContent(createSelectSchema(courseTable), 'The requested course'),
  },
});

export const updateCourse = createRoute({
  method: 'post',
  path: '/courses/{course_id}',
  tags: ['Courses'],
  middleware: authMiddleware,
  request: {
    params: updateCourseRequestSchema.params,
    body: jsonContentRequired(updateCourseRequestSchema.body, 'Update a course body'),
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to delete course'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(updateCourseRequestSchema.params).or(createErrorSchema(updateCourseRequestSchema.body)),
      'Validation errors',
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, 'User unauthroized'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Course not found'),
    [HttpStatusCodes.OK]: jsonContent(createSelectSchema(courseTable), 'Updated course'),
  },
});

export const deleteCourse = createRoute({
  method: 'delete',
  path: '/courses/{course_id}',
  tags: ['Courses'],
  middleware: authMiddleware,
  request: {
    params: deleteCourseRequestSchema.params,
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to delete course'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(deleteCourseRequestSchema.params), 'Validation error'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, 'User unauthroized'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Course not found'),
    [HttpStatusCodes.NO_CONTENT]: { description: 'Course deleted' },
  },
});

export type CreateCourseRoute = typeof createCourse;
export type GetCourseRoute = typeof getCourse;
export type UpdateCourseRoute = typeof updateCourse;
export type DeleteCourseRoute = typeof deleteCourse;

export const getCourses = createRoute({
  method: 'get',
  path: '/courses',
  tags: ['Courses'],
  request: {},
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to get courses'),
    [HttpStatusCodes.OK]: jsonContent(z.array(createSelectSchema(courseTable)), 'Get all courses'),
  },
});

export type GetCoursesRoute = typeof getCourses;

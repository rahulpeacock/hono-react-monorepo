import { internalServerErrorSchema, notFoundSchema, unauthorizedSchema } from '@/lib/constants';
import { authMiddleware } from '@/middlewares/auth';
import { courseTable, enrolledCourseTable } from '@/schemas/db';
import { createRoute, z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';
import { enrollCourseRequestSchema, getEnrolledCourseRequestSchema } from './user.schemas';

// Created Courses

export const getUserCreatedCourses = createRoute({
  method: 'get',
  path: '/users/me/courses/created',
  tags: ['Users'],
  middleware: authMiddleware,
  request: {},
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to get course'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, 'User unauthroized'),
    [HttpStatusCodes.OK]: jsonContent(z.array(createSelectSchema(courseTable)), 'Get user created courses'),
  },
});

export type GetUserCreatedCoursesRoute = typeof getUserCreatedCourses;

// Enrolled Courses

export const getEnrolledCourse = createRoute({
  method: 'get',
  path: '/users/me/courses/{course_id}/enroll',
  tags: ['Users'],
  middleware: authMiddleware,
  request: {
    params: getEnrolledCourseRequestSchema.params,
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to get course'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(getEnrolledCourseRequestSchema.params), 'Validation error'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, 'User unauthroized'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Course not found'),
    [HttpStatusCodes.OK]: jsonContent(createSelectSchema(enrolledCourseTable), 'Get user enrolled course'),
  },
});

export const enrollCourse = createRoute({
  method: 'post',
  path: '/users/me/courses/{course_id}/enroll',
  tags: ['Users'],
  middleware: authMiddleware,
  request: {
    params: enrollCourseRequestSchema.params,
  },
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to get course'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(enrollCourseRequestSchema.params), 'Validation error'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, 'User unauthroized'),
    [HttpStatusCodes.OK]: jsonContent(createSelectSchema(enrolledCourseTable), 'Get user enrolled course'),
  },
});

export const getUserEnrolledCourses = createRoute({
  method: 'get',
  path: '/users/me/courses/enrolled',
  tags: ['Users'],
  middleware: authMiddleware,
  request: {},
  responses: {
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(internalServerErrorSchema, 'Failed to get course'),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, 'User unauthroized'),
    [HttpStatusCodes.OK]: jsonContent(
      z.array(
        z.object({
          course: createSelectSchema(courseTable),
          enrolled_course: createSelectSchema(enrolledCourseTable),
        }),
      ),
      'Get user enrolled courses',
    ),
  },
});

export type GetEnrolledCourse = typeof getEnrolledCourse;
export type EnrollCourseRoute = typeof enrollCourse;
export type GetUserEnrolledCoursesRoute = typeof getUserEnrolledCourses;

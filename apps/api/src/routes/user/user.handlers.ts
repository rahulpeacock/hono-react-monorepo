import type { AuthenticatedAppRouteHandler } from '@/lib/types';
import { enrollCourseInDB, getUserCreatedCoursesFromDB, getUserEnrolledCourseFromDB, getUserEnrolledCoursesFromDB } from '@/services/db/user';
import * as HttpStatusCode from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import type { EnrollCourseRoute, GetEnrolledCourse, GetUserCreatedCoursesRoute, GetUserEnrolledCoursesRoute } from './user.routes';

// Created Course
export const getUserCreatedCourses: AuthenticatedAppRouteHandler<GetUserCreatedCoursesRoute> = async (c) => {
  const auth = c.get('auth');

  const userCourses = await getUserCreatedCoursesFromDB(auth.session.userId);

  return c.json(userCourses, HttpStatusCode.OK);
};

// Created Course

export const getEnrolledCourse: AuthenticatedAppRouteHandler<GetEnrolledCourse> = async (c) => {
  const { course_id } = c.req.valid('param');
  const auth = c.get('auth');

  const enrolledCourse = await getUserEnrolledCourseFromDB(auth.session.userId, course_id);

  if (!enrolledCourse) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCode.NOT_FOUND);
  }

  return c.json(enrolledCourse, HttpStatusCode.OK);
};

export const enrolledCourse: AuthenticatedAppRouteHandler<EnrollCourseRoute> = async (c) => {
  const { course_id } = c.req.valid('param');
  const auth = c.get('auth');

  const enrolledCourse = await enrollCourseInDB(auth.session.userId, course_id);

  if (!enrolledCourse) {
    return c.json({ message: HttpStatusPhrases.INTERNAL_SERVER_ERROR }, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }

  return c.json(enrolledCourse, HttpStatusCode.OK);
};

export const getUserEnrolledCourses: AuthenticatedAppRouteHandler<GetUserEnrolledCoursesRoute> = async (c) => {
  const auth = c.get('auth');

  const enrolledCourses = await getUserEnrolledCoursesFromDB(auth.session.userId);

  return c.json(enrolledCourses, HttpStatusCode.OK);
};

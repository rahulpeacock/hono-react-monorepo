import type { AppRouteHandler, AuthenticatedAppRouteHandler } from '@/lib/types';
import { getCoursesFromDB } from '@/services/db/course';
import { createCourseInDB, deleteCourseFromDB, getCourseFromDB, updateCourseInDB } from '@/services/db/course';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import type { CreateCourseRoute, DeleteCourseRoute, GetCourseRoute, GetCoursesRoute, UpdateCourseRoute } from './course.routes';

export const createCourse: AuthenticatedAppRouteHandler<CreateCourseRoute> = async (c) => {
  const payload = c.req.valid('json');
  const userId = c.get('auth').session.userId;

  const createdCourse = await createCourseInDB({ ...payload, userId });

  if (!createdCourse) {
    return c.json({ message: HttpStatusPhrases.INTERNAL_SERVER_ERROR }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }

  return c.json(createdCourse, HttpStatusCodes.CREATED);
};

export const getCourse: AppRouteHandler<GetCourseRoute> = async (c) => {
  const { course_id } = c.req.valid('param');

  const userCourse = await getCourseFromDB(course_id);
  if (!userCourse) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(userCourse, HttpStatusCodes.OK);
};

export const updateCourse: AuthenticatedAppRouteHandler<UpdateCourseRoute> = async (c) => {
  const { course_id } = c.req.valid('param');
  const payload = c.req.valid('json');
  const userId = c.get('auth').session.userId;

  const updatedCourse = await updateCourseInDB(userId, course_id, payload);
  if (!updatedCourse) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(updatedCourse, HttpStatusCodes.OK);
};

export const deleteCourse: AuthenticatedAppRouteHandler<DeleteCourseRoute> = async (c) => {
  const { course_id } = c.req.valid('param');
  const userId = c.get('auth').session.userId;

  const deletedCourse = await deleteCourseFromDB(userId, course_id);
  if (!deletedCourse) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(null, HttpStatusCodes.NO_CONTENT);
};

export const getCourses: AppRouteHandler<GetCoursesRoute> = async (c) => {
  const courses = await getCoursesFromDB();

  return c.json(courses, 200);
};

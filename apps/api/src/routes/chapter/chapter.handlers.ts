import type { AppRouteHandler, AuthenticatedAppRouteHandler } from '@/lib/types';
import {
  createChapterInDB,
  deleteChapterFromDB,
  getChapterFromDB,
  getChaptersFromDB,
  getNewChapterIndex,
  updateChapterInDB,
} from '@/services/db/chapter';
import { getCourseFromDB } from '@/services/db/course';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import type { CreateChapterRoute, DeleteChapterRoute, GetChapterRoute, GetChaptersRoute, UpdateChapterRoute } from './chapter.routes';

// create-chapter
export const createChapter: AuthenticatedAppRouteHandler<CreateChapterRoute> = async (c) => {
  const { course_id } = c.req.valid('param');
  const payload = c.req.valid('json');

  const newChapterIndex = await getNewChapterIndex(course_id);

  const createdChapter = await createChapterInDB({ ...payload, courseId: course_id, index: newChapterIndex });
  if (!createdChapter) {
    return c.json({ message: HttpStatusPhrases.INTERNAL_SERVER_ERROR }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }

  return c.json(createdChapter, HttpStatusCodes.CREATED);
};

// get-chapter
export const getChapter: AuthenticatedAppRouteHandler<GetChapterRoute> = async (c) => {
  const { course_id, chapter_id } = c.req.valid('param');

  const userCourse = await getCourseFromDB(course_id);
  if (!userCourse) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  const chapter = await getChapterFromDB(course_id, chapter_id);
  if (!chapter) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(chapter, HttpStatusCodes.OK);
};

// update-chapter
export const updateChapter: AuthenticatedAppRouteHandler<UpdateChapterRoute> = async (c) => {
  const { course_id, chapter_id } = c.req.valid('param');
  const payload = c.req.valid('json');
  const { userId } = c.get('auth').session;

  const userCourse = await getCourseFromDB(course_id);
  if (!userCourse) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  if (userCourse.userId !== userId) {
    return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN);
  }

  const updatedChapter = await updateChapterInDB(course_id, chapter_id, payload);
  if (!updatedChapter) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(updatedChapter, HttpStatusCodes.OK);
};

// delete-chapter
export const deleteChapter: AuthenticatedAppRouteHandler<DeleteChapterRoute> = async (c) => {
  const { course_id, chapter_id } = c.req.valid('param');
  const { userId } = c.get('auth').session;

  const userCourse = await getCourseFromDB(course_id);
  if (!userCourse) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  if (userCourse.userId !== userId) {
    return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN);
  }

  const deletedChapter = await deleteChapterFromDB(course_id, chapter_id);
  if (!deletedChapter) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(null, HttpStatusCodes.NO_CONTENT);
};

// get-chapters
export const getChapters: AppRouteHandler<GetChaptersRoute> = async (c) => {
  const { course_id } = c.req.valid('param');

  const chapters = await getChaptersFromDB(course_id);

  return c.json(chapters, HttpStatusCodes.OK);
};

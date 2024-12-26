import { chapterTable } from '@/schemas/db';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const createChapterRequestSchema = {
  params: z.object({
    course_id: z.coerce.number().openapi({
      param: {
        name: 'course_id',
        in: 'path',
      },
      example: 1212121,
    }),
  }),
  body: createInsertSchema(chapterTable).pick({
    title: true,
    slug: true,
    description: true,
    content: true,
  }),
};

export const getChapterRequestSchema = {
  params: z.object({
    course_id: z.coerce.number().openapi({
      param: {
        name: 'course_id',
        in: 'path',
      },
      example: 1212121,
    }),
    chapter_id: z.coerce.number().openapi({
      param: {
        name: 'chapter_id',
        in: 'path',
      },
      example: 3434343,
    }),
  }),
};

export const updateChapterRequestSchema = {
  params: z.object({
    course_id: z.coerce.number().openapi({
      param: {
        name: 'course_id',
        in: 'path',
      },
      example: 1212121,
    }),
    chapter_id: z.coerce.number().openapi({
      param: {
        name: 'chapter_id',
        in: 'path',
      },
      example: 3434343,
    }),
  }),
  body: createInsertSchema(chapterTable)
    .pick({
      title: true,
      slug: true,
      description: true,
      content: true,
      isPublished: true,
      index: true,
    })
    .partial(),
};

export const deleteChapterRequestSchema = {
  params: z.object({
    course_id: z.coerce.number().openapi({
      param: {
        name: 'course_id',
        in: 'path',
      },
      example: 1212121,
    }),
    chapter_id: z.coerce.number().openapi({
      param: {
        name: 'chapter_id',
        in: 'path',
      },
      example: 3434343,
    }),
  }),
};

export const getChaptersRequestSchema = {
  params: z.object({
    course_id: z.coerce.number().openapi({
      param: {
        name: 'course_id',
        in: 'path',
      },
      example: 1212121,
    }),
  }),
};

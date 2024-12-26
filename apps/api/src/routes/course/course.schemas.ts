import { courseTable } from '@/schemas/db';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const createCourseRequestSchema = {
  body: createInsertSchema(courseTable).pick({
    name: true,
    slug: true,
    description: true,
    thumbnail: true,
    categories: true,
  }),
};

export const getCourseRequestSchema = {
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

export const updateCourseRequestSchema = {
  params: z.object({
    course_id: z.coerce.number().openapi({
      param: {
        name: 'course_id',
        in: 'path',
      },
      example: 1212121,
    }),
  }),
  body: createInsertSchema(courseTable)
    .pick({
      name: true,
      slug: true,
      description: true,
      thumbnail: true,
      categories: true,
      isPublished: true,
    })
    .partial(),
};

export const deleteCourseRequestSchema = {
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

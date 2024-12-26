import { z } from 'zod';

export const getEnrolledCourseRequestSchema = {
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

export const enrollCourseRequestSchema = {
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

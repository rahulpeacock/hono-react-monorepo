import { db } from '@/api/lib/drizzle';
import { courseTable } from '@/api/schemas/db';
import { and, eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import type { z } from 'zod';

// Course db functions

const createCourseSchema = createInsertSchema(courseTable).pick({
  name: true,
  slug: true,
  description: true,
  thumbnail: true,
  userId: true,
  categories: true,
});
export async function createCourseInDB(data: z.infer<typeof createCourseSchema>) {
  const res = await db.insert(courseTable).values(data).returning();
  if (res.length === 0) return null;
  return res[0];
}

export async function getCourseFromDB(course_id: number) {
  const res = await db.select().from(courseTable).where(eq(courseTable.id, course_id));
  if (res.length === 0) return null;
  return res[0];
}

const updateCourseSchema = createInsertSchema(courseTable)
  .pick({
    name: true,
    slug: true,
    description: true,
    thumbnail: true,
    isPublished: true,
  })
  .partial();
export async function updateCourseInDB(userId: number, course_id: number, data: z.infer<typeof updateCourseSchema>) {
  const res = await db
    .update(courseTable)
    .set(data)
    .where(and(eq(courseTable.userId, userId), eq(courseTable.id, course_id)))
    .returning();

  if (res.length === 0) return null;
  return res[0];
}

export async function deleteCourseFromDB(userId: number, course_id: number) {
  const res = await db
    .delete(courseTable)
    .where(and(eq(courseTable.userId, userId), eq(courseTable.id, course_id)))
    .returning();
  if (res.length === 0) return null;
  return res[0];
}

export async function getCoursesFromDB() {
  const res = await db.select().from(courseTable).where(eq(courseTable.isPublished, true));
  return res;
}

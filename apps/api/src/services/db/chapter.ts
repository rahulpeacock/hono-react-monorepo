import { db } from '@/api/lib/drizzle';
import { chapterTable } from '@/api/schemas/db';
import { and, desc, eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Chapter db functions

const createChapterSchema = createInsertSchema(chapterTable)
  .extend({
    courseId: z.number(),
  })
  .pick({
    title: true,
    slug: true,
    description: true,
    content: true,
    index: true,
    courseId: true,
  });
export async function createChapterInDB(data: z.infer<typeof createChapterSchema>) {
  const res = await db.insert(chapterTable).values(data).returning();
  if (res.length === 0) return null;
  return res[0];
}

export async function getChapterFromDB(course_id: number, chapter_id: number) {
  const res = await db
    .select()
    .from(chapterTable)
    .where(and(eq(chapterTable.courseId, course_id), eq(chapterTable.id, chapter_id)));
  if (res.length === 0) return null;
  return res[0];
}

const updateChapterSchema = createInsertSchema(chapterTable)
  .pick({
    title: true,
    slug: true,
    description: true,
    content: true,
    isPublished: true,
    index: true,
  })
  .partial();
export async function updateChapterInDB(course_id: number, chapter_id: number, data: z.infer<typeof updateChapterSchema>) {
  const res = await db
    .update(chapterTable)
    .set(data)
    .where(and(eq(chapterTable.courseId, course_id), eq(chapterTable.id, chapter_id)))
    .returning();

  if (res.length === 0) return null;
  return res[0];
}

export async function deleteChapterFromDB(course_id: number, chapter_id: number) {
  const res = await db
    .delete(chapterTable)
    .where(and(eq(chapterTable.courseId, course_id), eq(chapterTable.id, chapter_id)))
    .returning();
  if (res.length === 0) return null;
  return res[0];
}

export async function getNewChapterIndex(courseId: number): Promise<number> {
  const chapters = await db.select().from(chapterTable).where(eq(chapterTable.courseId, courseId)).orderBy(desc(chapterTable.index)).limit(1);
  if (chapters.length === 0) return 0;
  return chapters[0].index + 1;
}

export async function getChaptersFromDB(courseId: number) {
  const res = await db.select().from(chapterTable).where(eq(chapterTable.courseId, courseId)).orderBy(chapterTable.index);
  return res;
}

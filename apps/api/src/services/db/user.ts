import { db } from '@/lib/drizzle';
import { courseTable, enrolledCourseTable } from '@/schemas/db';
import { and, eq } from 'drizzle-orm';

// Created Courses

export async function getUserCreatedCoursesFromDB(userId: number) {
  const res = await db.select().from(courseTable).where(eq(courseTable.userId, userId));
  return res;
}

// Enrolled Courses

export async function getUserEnrolledCourseFromDB(userId: number, courseId: number) {
  const res = await db
    .select()
    .from(enrolledCourseTable)
    .where(and(eq(enrolledCourseTable.userId, userId), eq(enrolledCourseTable.courseId, courseId)));
  if (res.length === 0) return null;
  return res[0];
}

export async function enrollCourseInDB(userId: number, courseId: number) {
  const res = await db.insert(enrolledCourseTable).values({ userId, courseId }).returning();
  if (res.length === 0) return null;
  return res[0];
}

export async function getUserEnrolledCoursesFromDB(userId: number) {
  const res = await db
    .select()
    .from(courseTable)
    .innerJoin(enrolledCourseTable, eq(courseTable.id, enrolledCourseTable.courseId))
    .where(and(eq(enrolledCourseTable.enrolled, true), eq(enrolledCourseTable.userId, userId)));
  return res;
}

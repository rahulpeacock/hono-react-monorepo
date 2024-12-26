import { db } from '@/lib/drizzle';
import { gConnectionTable, gUserTable } from '@/schemas/db';
import { and, eq, isNull } from 'drizzle-orm';

export async function updateGUserWithId(userId: number) {
  const res = await db.select().from(gUserTable).where(isNull(gUserTable.userId)).limit(1);
  if (res.length === 0) {
    console.log('No users to update');
    return;
  }
  await db.update(gUserTable).set({ userId }).where(eq(gUserTable.id, res[0].id));
}

export async function getIdentifierBasedOnCourse(course: string, gUserId: number) {
  // check if a connection is present for the gUserid
  const currentUserConnection = await db
    .select()
    .from(gConnectionTable)
    .where(and(eq(gConnectionTable.podType, course), eq(gConnectionTable.gUserId, gUserId)))
    .limit(1);

  if (currentUserConnection.length > 0) {
    return currentUserConnection[0];
  }

  const connection = await db
    .select()
    .from(gConnectionTable)
    .where(and(eq(gConnectionTable.podType, course), isNull(gConnectionTable.gUserId)))
    .limit(1);

  if (connection.length === 0) {
    console.log('No connection on course: ', course);
    return null;
  }

  const res = await db.update(gConnectionTable).set({ gUserId }).where(eq(gConnectionTable.id, connection[0].id)).returning();

  return res[0];
}

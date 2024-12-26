import { db } from '@/api/lib/drizzle';
import type { ProviderType } from '@/api/lib/types';
import { accountTable, userTable, verificationTokenTable } from '@/api/schemas/db';
import type { NewAccount, NewUser } from '@/api/schemas/db';
import { and, count, eq } from 'drizzle-orm';

/**
 * Creates a new user in the database.
 * @param user - The user object containing email and user metadata.
 * @returns The created user object.
 * @throws If the user creation fails.
 */
export async function createUser(user: Pick<NewUser, 'email' | 'user_metadata'>) {
  const res = await db.insert(userTable).values(user).returning();
  if (res.length === 0) throw new Error('Failed to create user');
  return res[0];
}

/**
 * Retrieves a user from the database by their email address.
 * @param email - The email address of the user to retrieve.
 * @returns The user object if found, otherwise null.
 */
export async function getUserByEmail(email: string) {
  const res = await db.select().from(userTable).where(eq(userTable.email, email));
  if (res.length === 0) return null;
  return res[0];
}
1;

export async function checkEmailAvailability(email: string) {
  const res = await db.select({ count: count() }).from(userTable).where(eq(userTable.email, email));
  return res[0].count === 0;
}

// Accounts
export async function createAccount(account: NewAccount) {
  const res = await db.insert(accountTable).values(account).returning();
  if (res.length === 0) throw new Error('Failed to create account');
  return res[0];
}

export async function getAccountByProvider(userId: number, provider: ProviderType) {
  const res = await db
    .select()
    .from(accountTable)
    .where(and(eq(accountTable.provider, provider), eq(accountTable.userId, userId)));
  if (res.length === 0) return null;
  return res[0];
}

export async function deleteRefreshToken(id: number) {
  await db.update(accountTable).set({ refresh_token: null }).where(eq(accountTable.userId, id));
}

export async function updateRefreshTokenInAccount(userId: number, refreshToken: string) {
  await db.update(accountTable).set({ refresh_token: refreshToken }).where(eq(accountTable.userId, userId));
}

// Verification Tokens
export async function deleteUserEmailVerificationRequest(userId: number) {
  await db.delete(verificationTokenTable).where(eq(verificationTokenTable.userId, userId));
}

export async function createEmailVerification(id: string, userId: number, email: string, code: string, expiresAt: Date) {
  await db.insert(verificationTokenTable).values({ id, userId, email, code, expiresAt });
}

export async function updateUserEmailAndSetEmailAsVerified(userId: number, email: string): Promise<void> {
  await db.update(userTable).set({ email, emailVerified: new Date() }).where(eq(userTable.id, userId));
}

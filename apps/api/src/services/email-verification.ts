import { db } from '@/api/lib/drizzle';
import { encodeBase32 } from '@oslojs/encoding';
import { and, eq } from 'drizzle-orm';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { resend } from '../lib/email';
import type { EmailVerificationRequest } from '../lib/types';
import { verificationTokenTable } from '../schemas/db';
import { createEmailVerification, deleteUserEmailVerificationRequest } from './db';
import { generateRandomOTP } from './utils';

export async function getUserEmailVerificationRequest(userId: number, id: string): Promise<EmailVerificationRequest | null> {
  const res = await db
    .select()
    .from(verificationTokenTable)
    .where(and(eq(verificationTokenTable.id, id), eq(verificationTokenTable.userId, userId)));
  if (res.length === 0) return null;
  return res[0];
}

export function createEmailVerificationRequest(userId: number, email: string): EmailVerificationRequest {
  deleteUserEmailVerificationRequest(userId);
  const idBytes = new Uint8Array(20);
  crypto.getRandomValues(idBytes);
  const id = encodeBase32(idBytes).toLowerCase();

  const code = generateRandomOTP();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
  createEmailVerification(id, userId, email, code, expiresAt);

  const request: EmailVerificationRequest = {
    id,
    userId,
    code,
    email,
    expiresAt,
  };
  return request;
}

export async function sendVerificationEmail(email: string, code: string) {
  const { data, error } = await resend.emails.send({
    from: 'Lidoku <onboarding@mail.lidoku.com>',
    to: [email],
    subject: 'Hello World',
    html: `To ${email}: Your verification code is ${code}`,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function deleteEmailVerificationRequestCookie(c: Context): void {
  setCookie(c, 'email_verification', '', {
    httpOnly: true,
    path: '/',
    // secure: process.env.NODE_ENV === 'production',
    secure: false,
    sameSite: 'lax',
    maxAge: 0,
  });
}

export async function getUserEmailVerificationRequestFromRequest(c: Context, userId: number): Promise<EmailVerificationRequest | null> {
  const id = getCookie(c, 'email_verification') ?? null;
  if (id === null) {
    return null;
  }
  const res = getUserEmailVerificationRequest(userId, id);
  if (res === null) {
    deleteEmailVerificationRequestCookie(c);
  }
  return res;
}

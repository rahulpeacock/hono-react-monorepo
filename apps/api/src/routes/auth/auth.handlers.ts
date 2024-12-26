import type { AppRouteHandler, AuthenticatedAppRouteHandler } from '@/lib/types';
import {
  checkEmailAvailability,
  createAccount,
  createUser,
  deleteUserEmailVerificationRequest,
  getAccountByProvider,
  getUserByEmail,
  updateUserEmailAndSetEmailAsVerified,
} from '@/services/db';
import { updateGUserWithId } from '@/services/db/g_user';
import {
  createEmailVerificationRequest,
  deleteEmailVerificationRequestCookie,
  getUserEmailVerificationRequestFromRequest,
  sendVerificationEmail,
} from '@/services/email-verification';
import {} from '@/services/jwt-token';
import { hashPassword, verifyPasswordHash } from '@/services/password';
import { createSession, generateSessionToken, getCurrentSession, invalidateSession } from '@/services/session';
import { setCookie } from 'hono/cookie';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import type { GetSession, LoginRoute, ResendVerificationCode, SignoutRoute, SignupRoute, VerifyEmailRoute } from './auth.routes';

export const signup: AppRouteHandler<SignupRoute> = async (c) => {
  // Validate the request body
  const { name, email, password } = c.req.valid('json');

  // Check if the user already exists
  const emailAvailable = await checkEmailAvailability(email);
  if (!emailAvailable) {
    return c.json(
      {
        error: 'Email already registered',
        message: 'This email address is already associated with an account',
      },
      409,
    );
  }

  // Create a new user in user-table
  const user = await createUser({ email, user_metadata: { name, avatar_url: null } });

  // Create a new account in account-table
  await createAccount({
    userId: user.id,
    provider: 'credentials',
    accountId: user.id.toString(),
    refresh_token: null,
    access_token: null,
    expires_at: null,
    token_type: null,
    scope: null,
    id_token: null,
    account_metadata: {
      avatar_url: null,
      hashedPassword: await hashPassword(password),
    },
  });

  // update the user_id with guacamole g_user
  updateGUserWithId(user.id);

  // Generate email verification token
  const emailVerificationRequest = createEmailVerificationRequest(user.id, email);

  // Send email verification link to user
  sendVerificationEmail(email, emailVerificationRequest.code);

  // Set email verification request cookie
  setCookie(c, 'email_verification', emailVerificationRequest.id, {
    path: '/',
    httpOnly: true,
    // secure: env.NODE_ENV === 'production',
    secure: false,
    sameSite: 'lax',
    expires: emailVerificationRequest.expiresAt,
  });

  // Generate session token and create session
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);

  setCookie(c, 'session', sessionToken, {
    path: '/',
    httpOnly: true,
    // secure: env.NODE_ENV === 'production',
    secure: false,
    sameSite: 'lax',
    expires: session.expiresAt,
  });

  // Redirect to verify-email
  return c.json({ redirect: '/auth/verify-email' }, 200);
};

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  // Validate the request body
  const { email, password } = c.req.valid('json');

  // Check if the user exists in db
  const user = await getUserByEmail(email);
  if (user === null) {
    return c.json(
      {
        error: 'User does not exist',
        message: 'User does not exist',
      },
      401,
    );
  }

  // Check if the user has an account
  const account = await getAccountByProvider(user.id, 'credentials');
  if (account === null) {
    return c.json(
      {
        error: 'Prompt for reset password',
        message: 'Prompt for reset password',
      },
      401,
    );
  }

  // Check if the password is correct
  const validPassword = await verifyPasswordHash(account.account_metadata.hashedPassword as string, password);
  if (!validPassword) {
    return c.json(
      {
        error: 'Incorrect password',
        message: 'Incorrect password',
      },
      401,
    );
  }

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);

  setCookie(c, 'session', sessionToken, {
    httpOnly: true,
    path: '/',
    // secure: process.env.NODE_ENV === 'production',
    secure: false,
    sameSite: 'lax',
    expires: session.expiresAt,
  });

  if (!user.emailVerified) {
    return c.json({ redirect: '/verify-email' }, 200);
  }

  return c.json({ redirect: '/dashboard/courses/created' }, 200);
};

export const verifyEmail: AppRouteHandler<VerifyEmailRoute> = async (c) => {
  // Validate the request body
  const { code } = c.req.valid('json');

  // Check if the session and user is valid
  const { session, user } = await getCurrentSession(c);
  if (session === null || user === null) {
    return c.json(
      {
        message: 'Not authenticated',
        error: 'Not authenticated',
      },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  // Check if the email_verification cookie is valid
  let verificationRequest = await getUserEmailVerificationRequestFromRequest(c, user.id);
  if (verificationRequest === null) {
    return c.json(
      {
        message: 'Verify email session expired',
        error: 'Verify email session expired',
      },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  console.log('verifyRequest', verificationRequest);

  if (Date.now() >= verificationRequest.expiresAt.getTime()) {
    verificationRequest = createEmailVerificationRequest(verificationRequest.userId, verificationRequest.email);
    sendVerificationEmail(verificationRequest.email, verificationRequest.code);
    return c.json(
      {
        message: 'The verification code was expired. We sent another code to your inbox.',
        error: 'The verification code was expired. We sent another code to your inbox.',
      },
      HttpStatusCodes.GONE,
    );
  }
  if (verificationRequest.code !== code) {
    return c.json(
      {
        message: 'Not authenticated',
        error: 'Not authenticated',
      },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  deleteUserEmailVerificationRequest(user.id);
  // TODO: Write a function based on the project
  // invalidateUserPasswordResetSessions(user.id);
  updateUserEmailAndSetEmailAsVerified(user.id, verificationRequest.email);
  deleteEmailVerificationRequestCookie(c);

  return c.json(
    {
      message: 'Verify successful',
    },
    200,
  );
};

export const resendVerificationCode: AppRouteHandler<ResendVerificationCode> = async (c) => {
  const { session, user } = await getCurrentSession(c);
  if (session === null) {
    return c.json(
      {
        message: 'Not authenticated',
        error: 'Not authenticated',
      },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  let verificationRequest = await getUserEmailVerificationRequestFromRequest(c, user.id);
  if (verificationRequest === null) {
    if (user.emailVerified) {
      return c.json(
        {
          message: 'FORBIDDEN',
          error: 'FORBIDDEN',
        },
        HttpStatusCodes.FORBIDDEN,
      );
    }
    verificationRequest = createEmailVerificationRequest(user.id, user.email);
  } else {
    verificationRequest = createEmailVerificationRequest(user.id, verificationRequest.email);
  }
  sendVerificationEmail(verificationRequest.email, verificationRequest.code);

  // Set email verification request cookie
  setCookie(c, 'email_verification', verificationRequest.id, {
    path: '/',
    httpOnly: true,
    // secure: env.NODE_ENV === 'production',
    secure: false,
    sameSite: 'lax',
    expires: verificationRequest.expiresAt,
  });

  return c.json({ message: 'Resend verification code' }, 200);
};

export const getSession: AppRouteHandler<GetSession> = async (c) => {
  const data = await getCurrentSession(c);
  return c.json(data, 200);
};

export const signOut: AuthenticatedAppRouteHandler<SignoutRoute> = async (c) => {
  const auth = c.get('auth');

  if (auth.session === null) {
    return c.json({ message: HttpStatusPhrases.UNAUTHORIZED }, HttpStatusCodes.UNAUTHORIZED);
  }
  invalidateSession(auth.session.id);

  setCookie(c, 'session', '', {
    httpOnly: true,
    path: '/',
    // secure: process.env.NODE_ENV === 'production',
    secure: false,
    sameSite: 'lax',
    maxAge: 0,
  });

  return c.json({ message: 'Signout successful' }, 200);
};

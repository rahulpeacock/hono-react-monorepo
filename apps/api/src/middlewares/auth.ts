import type { AuthenticatedAppBindings } from '@/api/lib/types';
import { getCurrentSession } from '@/api/services/session';
import { createMiddleware } from 'hono/factory';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';

export const authMiddleware = createMiddleware<AuthenticatedAppBindings>(async (c, next) => {
  const auth = await getCurrentSession(c);
  if (!auth.session) {
    return c.json({ message: HttpStatusPhrases.UNAUTHORIZED }, HttpStatusCodes.UNAUTHORIZED);
  }

  c.set('auth', auth);
  await next();
});

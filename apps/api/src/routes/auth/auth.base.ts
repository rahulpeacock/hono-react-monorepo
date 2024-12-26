import { createRouter } from '@/lib/create-app';
import * as handlers from './auth.handlers';
import * as routes from './auth.routes';

const router = createRouter()
  .openapi(routes.signup, handlers.signup)
  .openapi(routes.login, handlers.login)
  .openapi(routes.verifyEmail, handlers.verifyEmail)
  .openapi(routes.resendVerificationCode, handlers.resendVerificationCode)
  .openapi(routes.getSession, handlers.getSession)
  .openapi(routes.signOut, handlers.signOut);

export default router;
export type AuthRouterType = typeof router;

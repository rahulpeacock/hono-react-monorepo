import { createRouter } from '@/lib/create-app';
import * as handlers from './user.handlers';
import * as routes from './user.routes';

const router = createRouter()
  .openapi(routes.getUserCreatedCourses, handlers.getUserCreatedCourses)
  .openapi(routes.getEnrolledCourse, handlers.getEnrolledCourse)
  .openapi(routes.enrollCourse, handlers.enrolledCourse)
  .openapi(routes.getUserEnrolledCourses, handlers.getUserEnrolledCourses);

export default router;
export type UserRouterType = typeof router;

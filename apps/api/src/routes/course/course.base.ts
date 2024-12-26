import { createRouter } from '@/lib/create-app';
import * as handlers from './course.handlers';
import * as routes from './course.routes';

const router = createRouter()
  .openapi(routes.createCourse, handlers.createCourse)
  .openapi(routes.getCourse, handlers.getCourse)
  .openapi(routes.updateCourse, handlers.updateCourse)
  .openapi(routes.deleteCourse, handlers.deleteCourse)
  .openapi(routes.getCourses, handlers.getCourses);

export default router;
export type CourseRouterType = typeof router;

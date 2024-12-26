import { createRouter } from '@/lib/create-app';
import * as handlers from './chapter.handlers';
import * as routes from './chapter.routes';

const router = createRouter()
  .openapi(routes.createChapter, handlers.createChapter)
  .openapi(routes.getChapter, handlers.getChapter)
  .openapi(routes.updateChapter, handlers.updateChapter)
  .openapi(routes.deleteChapter, handlers.deleteChapter)
  .openapi(routes.getChapters, handlers.getChapters);

export default router;
export type ChapterRouterType = typeof router;

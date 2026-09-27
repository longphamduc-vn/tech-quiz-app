import { Router } from 'express';
import { topicRouter } from './topic.routes.js';
import { questionRouter } from './question.routes.js';
import { mediaRouter } from './media.routes.js';
import { dbRouter } from './db.routes.js';

export const apiRouter = Router();

apiRouter.use('/topics', topicRouter);
apiRouter.use('/questions', questionRouter);
apiRouter.use('/media', mediaRouter);
apiRouter.use('/db', dbRouter);

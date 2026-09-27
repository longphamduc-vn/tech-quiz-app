import { Router } from 'express';
import { topicController } from '../controllers/topic.controller.js';

export const topicRouter = Router();

topicRouter.get('/', (req, res, next) => topicController.getTopics(req, res, next));
topicRouter.post('/', (req, res, next) => topicController.createTopic(req, res, next));

import { Router } from 'express';
import { questionController } from '../controllers/question.controller.js';

export const questionRouter = Router();

questionRouter.get('/', (req, res, next) => questionController.getQuestions(req, res, next));
questionRouter.get('/:id', (req, res, next) => questionController.getQuestionById(req, res, next));
questionRouter.post('/', (req, res, next) => questionController.createQuestion(req, res, next));
questionRouter.delete('/:id', (req, res, next) => questionController.deleteQuestion(req, res, next));

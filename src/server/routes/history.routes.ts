import { Router } from 'express';
import { historyController } from '../controllers/history.controller.js';

export const historyRouter = Router();

historyRouter.post('/', historyController.createAttempt.bind(historyController));
historyRouter.get('/', historyController.getAttempts.bind(historyController));
historyRouter.get('/stats/:userId', historyController.getUserStats.bind(historyController));
historyRouter.get('/:id', historyController.getAttemptById.bind(historyController));
historyRouter.delete('/:id', historyController.deleteAttempt.bind(historyController));
historyRouter.delete('/user/:userId', historyController.clearUserHistory.bind(historyController));

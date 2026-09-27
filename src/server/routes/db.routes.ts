import { Router } from 'express';
import { dbController } from '../controllers/db.controller.js';

export const dbRouter = Router();

dbRouter.get('/schema', (req, res, next) => dbController.getDbSchema(req, res, next));
dbRouter.get('/table/:tableName', (req, res, next) => dbController.getTableData(req, res, next));
dbRouter.post('/seed', (req, res, next) => dbController.seedDatabase(req, res, next));

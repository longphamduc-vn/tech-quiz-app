import { Request, Response, NextFunction } from 'express';
import { topicService } from '../services/topic.service.js';

export class TopicController {
  public async getTopics(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const { tree, level } = req.query;

      if (tree === 'true' || tree === '1') {
        const topicTree = topicService.getTopicTree();
        res.json({ success: true, data: topicTree });
        return;
      }

      const parsedLevel = level ? parseInt(level as string, 10) : undefined;
      const topics = topicService.getAllTopics(parsedLevel);
      res.json({ success: true, data: topics });
    } catch (err: any) {
      Next(err);
    }
  }

  public async createTopic(req: Request, res: Response, Next: NextFunction): Promise<void> {
    try {
      const { name, parent_id, level, path } = req.body;
      if (!name || !level) {
        res.status(400).json({ success: false, message: 'Name and level are required' });
        return;
      }

      const newTopic = topicService.createTopic({
        name,
        parent_id: parent_id ? Number(parent_id) : null,
        level: Number(level) as 1 | 2 | 3,
        path
      });

      res.status(201).json({ success: true, data: newTopic });
    } catch (err: any) {
      Next(err);
    }
  }
}

export const topicController = new TopicController();

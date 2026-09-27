import { topicRepository } from '../repositories/topic.repository.js';
import { Topic } from '../types/index.js';

export class TopicService {
  public getAllTopics(level?: number): Topic[] {
    if (level !== undefined && !isNaN(level)) {
      return topicRepository.getByLevel(level);
    }
    return topicRepository.getAll();
  }

  public getTopicTree(): Topic[] {
    const allTopics = topicRepository.getAll();
    const topicMap = new Map<number, Topic & { children: Topic[] }>();

    allTopics.forEach((t) => {
      topicMap.set(t.id, { ...t, children: [] });
    });

    const roots: Topic[] = [];

    allTopics.forEach((t) => {
      const node = topicMap.get(t.id)!;
      if (t.parent_id === null || !topicMap.has(t.parent_id)) {
        roots.push(node);
      } else {
        const parent = topicMap.get(t.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return roots;
  }

  public getTopicById(id: number): Topic | null {
    return topicRepository.getById(id);
  }

  public createTopic(data: { name: string; parent_id?: number | null; level: 1 | 2 | 3; path?: string }): Topic {
    let path = data.path;
    if (!path) {
      const slug = data.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      if (data.parent_id) {
        const parent = topicRepository.getById(data.parent_id);
        path = parent ? `${parent.path}/${slug}` : slug;
      } else {
        path = slug;
      }
    }

    const id = topicRepository.create({
      name: data.name,
      parent_id: data.parent_id ?? null,
      level: data.level,
      path
    });

    return {
      id,
      name: data.name,
      parent_id: data.parent_id ?? null,
      level: data.level,
      path
    };
  }
}

export const topicService = new TopicService();

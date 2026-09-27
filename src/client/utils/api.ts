import { Topic, Question, CreateQuestionPayload, MediaAsset } from '../types/index.js';

const API_BASE = '/api';

export async function fetchTopics(tree = false, level?: number): Promise<Topic[]> {
  const params = new URLSearchParams();
  if (tree) params.set('tree', 'true');
  if (level) params.set('level', level.toString());

  const res = await fetch(`${API_BASE}/topics?${params.toString()}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch topics');
  return json.data;
}

export async function fetchQuestions(
  topicId?: number,
  difficulty?: number,
  random?: boolean,
  limit?: number
): Promise<Question[]> {
  const params = new URLSearchParams();
  if (topicId) params.set('topic_id', topicId.toString());
  if (difficulty) params.set('difficulty', difficulty.toString());
  if (random) params.set('random', 'true');
  if (limit) params.set('limit', limit.toString());

  const res = await fetch(`${API_BASE}/questions?${params.toString()}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch questions');
  return json.data;
}

export async function fetchQuestionById(id: number): Promise<Question> {
  const res = await fetch(`${API_BASE}/questions/${id}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch question');
  return json.data;
}

export async function createQuestion(payload: CreateQuestionPayload): Promise<Question> {
  const res = await fetch(`${API_BASE}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to create question');
  return json.data;
}

export async function deleteQuestion(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/questions/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to delete question');
}

export async function uploadMediaFile(
  file: File,
  meta?: { media_key?: string; alt_text?: string; caption?: string }
): Promise<MediaAsset> {
  const formData = new FormData();
  formData.append('file', file);
  if (meta?.media_key) formData.append('media_key', meta.media_key);
  if (meta?.alt_text) formData.append('alt_text', meta.alt_text);
  if (meta?.caption) formData.append('caption', meta.caption);

  const res = await fetch(`${API_BASE}/media/upload`, {
    method: 'POST',
    body: formData
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to upload media');
  return json.data;
}

export async function fetchMediaAssets(): Promise<MediaAsset[]> {
  const res = await fetch(`${API_BASE}/media`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch media assets');
  return json.data;
}

export async function fetchDbSchema(): Promise<any> {
  const res = await fetch(`${API_BASE}/db/schema`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch DB schema');
  return json.data;
}

export async function fetchDbTable(tableName: string): Promise<any> {
  const res = await fetch(`${API_BASE}/db/table/${tableName}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch DB table');
  return json.data;
}

export async function seedDb(): Promise<any> {
  const res = await fetch(`${API_BASE}/db/seed`, {
    method: 'POST'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to seed database');
  return json.data;
}

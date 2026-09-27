export interface Topic {
  id: number;
  name: string;
  parent_id: number | null;
  level: 1 | 2 | 3;
  path: string;
  children?: Topic[];
}

export interface MediaAsset {
  media_key: string;
  url: string;
  alt_text?: string | null;
  caption?: string | null;
}

export interface QuestionOption {
  id?: number;
  question_id?: number;
  content: string;
  is_correct: boolean | number;
  has_image?: boolean | number;
  image_url?: string | null;
  order_index?: number;
}

export interface Question {
  id: number;
  topic_id: number;
  difficulty_level: number;
  question_type: string;
  tags: string[];
  context_text: string | null;
  has_context_image: number;
  content: string;
  has_media: number;
  media_keys: string[];
  explanation: string | null;
  created_at: string;
  options: QuestionOption[];
  media_map: Record<string, MediaAsset>;
  topic?: Topic;
}

export interface CreateQuestionPayload {
  topic_id: number;
  difficulty_level: number;
  question_type: string;
  tags: string[];
  context_text: string | null;
  content: string;
  explanation: string | null;
  options: Array<{
    content: string;
    is_correct: boolean;
    has_image?: boolean;
    image_url?: string | null;
    order_index?: number;
  }>;
}

export type ActiveTab = 'quiz' | 'admin' | 'db';

export interface LightboxState {
  isOpen: boolean;
  url: string;
  altText: string;
  caption: string;
}

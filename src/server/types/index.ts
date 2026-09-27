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
  id: number;
  question_id: number;
  content: string;
  is_correct: number | boolean;
  has_image: number | boolean;
  image_url?: string | null;
  order_index: number;
}

export interface QuestionRow {
  id: number;
  topic_id: number;
  difficulty_level: number;
  question_type: string;
  tags: string | null;
  context_text: string | null;
  has_context_image: number;
  content: string;
  has_media: number;
  media_keys: string | null;
  explanation: string | null;
  created_at: string;
}

export interface QuestionWithOptionsAndMedia extends Omit<QuestionRow, 'tags' | 'media_keys'> {
  tags: string[];
  media_keys: string[];
  options: QuestionOption[];
  media_map: Record<string, MediaAsset>;
  topic?: Topic;
}

export interface CreateOptionDTO {
  content: string;
  is_correct: boolean;
  has_image?: boolean;
  image_url?: string | null;
  order_index?: number;
}

export interface CreateQuestionDTO {
  topic_id: number;
  difficulty_level?: number;
  question_type?: string;
  tags?: string[];
  context_text?: string | null;
  content: string;
  explanation?: string | null;
  options: CreateOptionDTO[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

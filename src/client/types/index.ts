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

export type ActiveTab = 'quiz' | 'history' | 'admin' | 'db';

export interface LightboxState {
  isOpen: boolean;
  url: string;
  altText: string;
  caption: string;
}

export interface User {
  id: number;
  username: string;
  display_name: string;
  email?: string | null;
  avatar_url?: string | null;
  role: 'student' | 'engineer' | 'admin';
  color: string;
  created_at: string;
  last_active_at: string;
  total_attempts?: number;
  avg_score?: number;
}

export interface CreateUserPayload {
  username: string;
  display_name: string;
  email?: string;
  avatar_url?: string;
  role?: 'student' | 'engineer' | 'admin';
  color?: string;
}

export interface UpdateUserPayload {
  display_name?: string;
  email?: string;
  avatar_url?: string;
  role?: 'student' | 'engineer' | 'admin';
  color?: string;
}

export interface QuizAttemptDetail {
  question_id: number;
  question_content: string;
  context_text?: string | null;
  difficulty_level: number;
  topic_name?: string;
  selected_option_index?: number;
  correct_option_index: number;
  is_correct: boolean;
  options: Array<{
    content: string;
    is_correct: boolean;
    image_url?: string | null;
  }>;
  explanation?: string | null;
}

export interface QuizAttempt {
  id: number;
  user_id: number;
  topic_id: number | null;
  topic_name: string | null;
  mode: 'exam' | 'practice';
  view_mode: 'list' | 'single';
  total_questions: number;
  answered_count: number;
  correct_count: number;
  score_percentage: number;
  time_spent_seconds: number;
  answers_detail: QuizAttemptDetail[];
  created_at: string;
  user?: User;
}

export interface CreateQuizAttemptPayload {
  user_id: number;
  topic_id?: number | null;
  topic_name?: string | null;
  mode: 'exam' | 'practice';
  view_mode?: 'list' | 'single';
  total_questions: number;
  answered_count: number;
  correct_count: number;
  score_percentage: number;
  time_spent_seconds: number;
  answers_detail: QuizAttemptDetail[];
}

export interface UserStats {
  user_id: number;
  total_attempts: number;
  exam_attempts: number;
  practice_attempts: number;
  avg_score: number;
  highest_score: number;
  total_time_spent_seconds: number;
  total_questions_answered: number;
  total_correct_answers: number;
  overall_accuracy: number;
  recent_attempts: Array<{
    id: number;
    mode: 'exam' | 'practice';
    score_percentage: number;
    created_at: string;
    topic_name: string | null;
    total_questions: number;
    correct_count: number;
  }>;
}

import React from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  ArrowRight,
  History,
  Sparkles,
  User as UserIcon,
  Check
} from 'lucide-react';
import { User, QuizAttempt } from '../types/index.js';

interface ExamResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempt: QuizAttempt | null;
  currentUser: User | null;
  onReviewQuiz: () => void;
  onRetakeQuiz: () => void;
  onNavigateHistory: () => void;
}

export const ExamResultModal: React.FC<ExamResultModalProps> = ({
  isOpen,
  onClose,
  attempt,
  currentUser,
  onReviewQuiz,
  onRetakeQuiz,
  onNavigateHistory
}) => {
  if (!isOpen || !attempt) return null;

  const score = attempt.score_percentage;
  const isPass = score >= 50;

  const getGradeInfo = (val: number) => {
    if (val >= 90) {
      return {
        label: 'Xuất Sắc',
        color: 'text-amber-400',
        bg: 'bg-amber-950/40 border-amber-500/40 text-amber-300',
        icon: '🏆',
        msg: 'Kiến thức kỹ thuật chuyên sâu và rất vững vàng!'
      };
    }
    if (val >= 80) {
      return {
        label: 'Giỏi',
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300',
        icon: '🌟',
        msg: 'Kết quả rất tốt, nắm bắt chính xác các nguyên lý kỹ thuật.'
      };
    }
    if (val >= 65) {
      return {
        label: 'Khá',
        color: 'text-cyan-400',
        bg: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300',
        icon: '👍',
        msg: 'Đạt yêu cầu khá, có thể củng cố thêm một số câu hỏi khó.'
      };
    }
    if (val >= 50) {
      return {
        label: 'Đạt Yêu Cầu',
        color: 'text-blue-400',
        bg: 'bg-blue-950/40 border-blue-500/40 text-blue-300',
        icon: '📝',
        msg: 'Đã hoàn thành đạt chuẩn, nên ôn luyện thêm để nâng cao điểm số.'
      };
    }
    return {
      label: 'Cần Cố Gắng Thêm',
      color: 'text-rose-400',
      bg: 'bg-rose-950/40 border-rose-500/40 text-rose-300',
      icon: '💡',
      msg: 'Hãy xem lại lời giải chi tiết của các câu sai để nắm vững kiến thức.'
    };
  };

  const grade = getGradeInfo(score);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} giây`;
    return `${mins} phút ${secs} giây`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-6">
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* User Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-300">
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ backgroundColor: currentUser?.color || '#06b6d4' }}
          >
            {(currentUser?.display_name || 'U').charAt(0).toUpperCase()}
          </div>
          <span>Thí sinh: <strong className="text-white">{currentUser?.display_name || 'Học viên'}</strong></span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400">{attempt.mode === 'exam' ? 'Thi Thử' : 'Luyện Tập'}</span>
        </div>

        {/* Score Ring Display */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center relative shadow-inner">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {score}%
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {attempt.correct_count} / {attempt.total_questions} Đúng
            </span>
          </div>

          {/* Grade Badge */}
          <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${grade.bg}`}>
            <span>{grade.icon}</span>
            <span>{grade.label}</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 max-w-xs mx-auto">
            {grade.msg}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-center">
          <div className="p-2">
            <div className="text-[10px] text-slate-400 font-mono">Đã Trả Lời</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {attempt.answered_count} / {attempt.total_questions}
            </div>
          </div>
          <div className="p-2 border-x border-slate-800/60">
            <div className="text-[10px] text-slate-400 font-mono">Thời Gian</div>
            <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
              {formatDuration(attempt.time_spent_seconds)}
            </div>
          </div>
          <div className="p-2">
            <div className="text-[10px] text-slate-400 font-mono">Chủ Đề</div>
            <div className="text-xs font-semibold text-slate-300 mt-0.5 truncate">
              {attempt.topic_name || 'Tất Cả Môn'}
            </div>
          </div>
        </div>

        {/* Save confirmation toast */}
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 py-2 px-3 rounded-xl">
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Đã tự động lưu kết quả vào lịch sử làm bài</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onReviewQuiz();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Xem Lại Bài Thi</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigateHistory();
              }}
              className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-600/30 flex items-center justify-center gap-1.5"
            >
              <History className="w-4 h-4" />
              <span>Xem Lịch Sử</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onRetakeQuiz();
            }}
            className="w-full py-2 px-3 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm Lại Đề Này</span>
          </button>
        </div>
      </div>
    </div>
  );
};

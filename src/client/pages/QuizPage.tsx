import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  Shuffle,
  LayoutList,
  Layers,
  Minimize2,
  Maximize2,
  CheckCheck,
  Settings
} from 'lucide-react';
import { Question, Topic } from '../types/index.js';
import { TopicSelector } from '../components/TopicSelector.js';
import { MathMarkdownRenderer } from '../components/MathMarkdownRenderer.js';
import {
  QuizSettings,
  QuizSettingsModal,
  loadStoredSettings,
  saveStoredSettings
} from '../components/QuizSettingsModal.js';

interface QuizPageProps {
  questions: Question[];
  topics: Topic[];
  selectedTopicId: number | null;
  onSelectTopic: (id: number | null) => void;
  selectedDifficulty: number | null;
  onSelectDifficulty: (diff: number | null) => void;
  loading: boolean;
  onRefresh: () => void;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const QuizPage: React.FC<QuizPageProps> = ({
  questions,
  topics,
  selectedTopicId,
  onSelectTopic,
  selectedDifficulty,
  onSelectDifficulty,
  loading,
  onRefresh
}) => {
  // 0. User Settings (Loaded from LocalStorage & Configurable - NOT hardcoded)
  const [quizSettings, setQuizSettings] = useState<QuizSettings>(loadStoredSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 1. View & Display Modes
  // 'list' = Làm nhiều câu cùng lúc (Multi-question list view)
  // 'single' = Làm từng câu một (Single-question card view)
  const [viewMode, setViewMode] = useState<'list' | 'single'>(quizSettings.defaultViewMode);
  const [isCompact, setIsCompact] = useState(quizSettings.isCompact); // "Kích thước câu hỏi bé lại"

  // 2. Exam vs Practice Mode
  const [isExamMode, setIsExamMode] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);

  // 3. Random & Pool Size for Practice Mode ("Chế độ luyện tập thì random")
  const [isRandom, setIsRandom] = useState(quizSettings.isRandom);
  const [questionPoolLimit, setQuestionPoolLimit] = useState<number | 'all'>(quizSettings.questionLimit);
  const [shuffleKey, setShuffleKey] = useState(0);

  // 4. Current index for Single-question mode
  const [currentIndex, setCurrentIndex] = useState(0);

  // 5. User Answers & Submissions State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({}); // qId -> optIndex
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<number, boolean>>({}); // qId -> isChecked
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set());

  // 6. Navigation Matrix Filter: 'all' | 'unanswered' | 'bookmarked'
  const [matrixFilter, setMatrixFilter] = useState<'all' | 'unanswered' | 'bookmarked'>('all');

  // 7. Timer Countdown: Configurable duration (default 30 mins)
  const [timeLeft, setTimeLeft] = useState(quizSettings.examDurationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Active Displayed Questions (shuffled if isRandom and limited if pool limit is set)
  const displayedQuestions = useMemo(() => {
    let list = [...questions];
    if (isRandom && !isExamMode) {
      list = shuffleArray(list);
    }
    if (questionPoolLimit !== 'all' && typeof questionPoolLimit === 'number') {
      list = list.slice(0, questionPoolLimit);
    }
    if (quizSettings.shuffleOptions) {
      list = list.map((q) => ({
        ...q,
        options: shuffleArray(q.options)
      }));
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, isRandom, isExamMode, shuffleKey, questionPoolLimit, quizSettings.shuffleOptions]);

  // Reset single-question index if out of bounds
  useEffect(() => {
    if (currentIndex >= displayedQuestions.length && displayedQuestions.length > 0) {
      setCurrentIndex(0);
    }
  }, [displayedQuestions.length, currentIndex]);

  // Countdown timer effect
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle bookmark for a question
  const toggleBookmark = (qId: number) => {
    setBookmarkedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Select an option for a question
  const handleSelectOption = (qId: number, optIndex: number) => {
    if (submittedQuestions[qId] && !isExamMode) return; // locked after check in practice mode

    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optIndex
    }));
  };

  // Check answer for a single question (in practice mode)
  const handleCheckQuestion = (qId: number) => {
    if (selectedAnswers[qId] === undefined) return;
    setSubmittedQuestions((prev) => ({
      ...prev,
      [qId]: true
    }));
  };

  // Check all answered questions at once (in practice mode)
  const handleCheckAllAnswered = () => {
    const nextSubmitted = { ...submittedQuestions };
    displayedQuestions.forEach((q) => {
      if (selectedAnswers[q.id] !== undefined) {
        nextSubmitted[q.id] = true;
      }
    });
    setSubmittedQuestions(nextSubmitted);
  };

  // Submit entire exam (in exam mode)
  const handleExamSubmit = () => {
    const nextSubmitted: Record<number, boolean> = { ...submittedQuestions };
    displayedQuestions.forEach((q) => {
      nextSubmitted[q.id] = true;
    });
    setSubmittedQuestions(nextSubmitted);
    setExamSubmitted(true);
    setIsTimerRunning(false);
  };

  // Clear answer for a single question
  const handleClearAnswer = (qId: number) => {
    if (submittedQuestions[qId] && !isExamMode) return;
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  // Reset quiz answers
  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuestions({});
    setExamSubmitted(false);
    setTimeLeft(quizSettings.examDurationMinutes * 60);
    setIsTimerRunning(true);
  };

  // Update question limit and persist to localStorage
  const updatePoolLimit = (newLimit: number | 'all') => {
    setQuestionPoolLimit(newLimit);
    setQuizSettings((prev) => {
      const updated: QuizSettings = { ...prev, questionLimit: newLimit };
      saveStoredSettings(updated);
      return updated;
    });
    handleResetQuiz();
  };

  // Save settings from modal
  const handleSaveSettings = (newSettings: QuizSettings) => {
    setQuizSettings(newSettings);
    setQuestionPoolLimit(newSettings.questionLimit);
    setIsCompact(newSettings.isCompact);
    setViewMode(newSettings.defaultViewMode);
    setIsRandom(newSettings.isRandom);
    setTimeLeft(newSettings.examDurationMinutes * 60);
    handleResetQuiz();
    setShuffleKey((k) => k + 1);
  };

  // Draw fresh random questions for practice
  const handleShuffleNewSet = () => {
    handleResetQuiz();
    setShuffleKey((k) => k + 1);
  };

  // Scroll smoothly to a question item in list view
  const scrollToQuestion = (idx: number, qId: number) => {
    if (viewMode === 'single') {
      setCurrentIndex(idx);
    } else {
      const el = document.getElementById(`q-item-${qId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Keyboard shortcut listener for Single View mode
  useEffect(() => {
    if (viewMode !== 'single') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const currentQ = displayedQuestions[currentIndex];
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((i) => Math.min(displayedQuestions.length - 1, i + 1));
      } else if (currentQ) {
        if (['1', 'a', 'A'].includes(e.key)) handleSelectOption(currentQ.id, 0);
        else if (['2', 'b', 'B'].includes(e.key)) handleSelectOption(currentQ.id, 1);
        else if (['3', 'c', 'C'].includes(e.key)) handleSelectOption(currentQ.id, 2);
        else if (['4', 'd', 'D'].includes(e.key)) handleSelectOption(currentQ.id, 3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentIndex, displayedQuestions, submittedQuestions, isExamMode]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = displayedQuestions.length;
    const answeredCount = Object.keys(selectedAnswers).filter((qId) =>
      displayedQuestions.some((q) => q.id === Number(qId))
    ).length;
    let correctCount = 0;

    displayedQuestions.forEach((q) => {
      const selectedOptIdx = selectedAnswers[q.id];
      if (selectedOptIdx !== undefined && q.options[selectedOptIdx]?.is_correct) {
        correctCount++;
      }
    });

    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    return { total, answeredCount, correctCount, accuracy };
  }, [displayedQuestions, selectedAnswers]);

  // Filtered Matrix Questions
  const filteredIndices = useMemo(() => {
    return displayedQuestions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => {
        if (matrixFilter === 'unanswered') {
          return selectedAnswers[q.id] === undefined;
        }
        if (matrixFilter === 'bookmarked') {
          return bookmarkedQuestions.has(q.id);
        }
        return true;
      });
  }, [displayedQuestions, matrixFilter, selectedAnswers, bookmarkedQuestions]);

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const getDifficultyBadge = (level: number) => {
    switch (level) {
      case 1:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            Dễ (L1)
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800">
            Trung bình (L2)
          </span>
        );
      case 3:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-800">
            Khó (L3)
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-mono text-slate-400">Đang tải danh sách câu hỏi kỹ thuật từ CSDL...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-md">
          <HelpCircle className="w-12 h-12 text-cyan-400 mx-auto mb-3 stroke-[1.5]" />
          <h2 className="text-lg font-bold text-white mb-2">Chưa có câu hỏi nào phù hợp với bộ lọc</h2>
          <p className="text-xs text-slate-400 mb-5 max-w-md mx-auto">
            Không tìm thấy câu hỏi nào cho môn học hoặc độ khó đã chọn. Bạn có thể chọn lại bộ lọc chủ đề.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                onSelectTopic(null);
                onSelectDifficulty(null);
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
            >
              Xóa tất cả bộ lọc
            </button>
            <button
              onClick={onRefresh}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-cyan-600/30"
            >
              Làm mới dữ liệu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSingleQuestion = displayedQuestions[currentIndex] || null;

  return (
    <div className={`max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5 ${isCompact ? 'compact-mode' : ''}`}>
      {/* ==================================================
          TOOLBAR: TOPIC, DENSITY, MULTI-MODE, RANDOM, TIMER
      ================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Topic Cascading Dropdowns */}
          <div className="flex-1 min-w-[260px]">
            <TopicSelector
              topics={topics}
              selectedTopicId={selectedTopicId}
              onSelectTopic={onSelectTopic}
            />
          </div>

          {/* Controls Bar: View Mode, Compact Size, Random, Exam vs Practice */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle: Multi-Question List vs Single-Question Card */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                  viewMode === 'list'
                    ? 'bg-cyan-600 text-white font-semibold shadow-sm shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Làm nhiều câu cùng một lúc (Cuộn danh sách toàn bộ đề)"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Nhiều Câu (Đề thi)</span>
              </button>
              <button
                onClick={() => setViewMode('single')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                  viewMode === 'single'
                    ? 'bg-cyan-600 text-white font-semibold shadow-sm shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Làm từng câu một (Thẻ chuyển trang)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Từng Câu</span>
              </button>
            </div>

            {/* Compact Size Toggle ("Kích thước câu hỏi bé lại") */}
            <button
              onClick={() => {
                const nextCompact = !isCompact;
                setIsCompact(nextCompact);
                setQuizSettings((prev) => {
                  const updated = { ...prev, isCompact: nextCompact };
                  saveStoredSettings(updated);
                  return updated;
                });
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                isCompact
                  ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Chuyển đổi kích thước câu hỏi (Thu gọn / Tiêu chuẩn)"
            >
              {isCompact ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isCompact ? 'Gọn nhẹ' : 'Tiêu chuẩn'}</span>
            </button>

            {/* Random Mode Toggle & Pool Size ("Chế độ luyện tập thì random") */}
            {!isExamMode && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const nextRandom = !isRandom;
                    setIsRandom(nextRandom);
                    setQuizSettings((prev) => {
                      const updated = { ...prev, isRandom: nextRandom };
                      saveStoredSettings(updated);
                      return updated;
                    });
                    handleShuffleNewSet();
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    isRandom
                      ? 'bg-purple-950/70 border-purple-500/60 text-purple-300 shadow-sm shadow-purple-500/10'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Bật/Tắt chế độ xáo trộn ngẫu nhiên câu hỏi"
                >
                  <Shuffle className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isRandom ? 'Random Bật' : 'Theo thứ tự'}</span>
                </button>

                {/* Pool Limit Selector (Configurable - NOT hardcoded) */}
                <select
                  value={
                    questionPoolLimit === 'all'
                      ? 'all'
                      : [5, 10, 15, 20, 25, 30, 40, 50, 100].includes(questionPoolLimit)
                      ? String(questionPoolLimit)
                      : 'custom'
                  }
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsSettingsOpen(true);
                    } else if (e.target.value === 'all') {
                      updatePoolLimit('all');
                    } else {
                      updatePoolLimit(Number(e.target.value));
                    }
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
                  title="Số lượng câu hỏi trong một lượt làm bài (Đã lưu cài đặt)"
                >
                  <option value="5">5 câu</option>
                  <option value="10">10 câu</option>
                  <option value="15">15 câu</option>
                  <option value="20">20 câu</option>
                  <option value="25">25 câu</option>
                  <option value="30">30 câu</option>
                  <option value="40">40 câu</option>
                  <option value="50">50 câu</option>
                  <option value="100">100 câu</option>
                  <option value="all">Tất cả ({questions.length})</option>
                  {typeof questionPoolLimit === 'number' &&
                    ![5, 10, 15, 20, 25, 30, 40, 50, 100].includes(questionPoolLimit) && (
                      <option value="custom">Tùy chỉnh: {questionPoolLimit} câu</option>
                    )}
                  <option value="custom">⚙️ Số khác...</option>
                </select>

                {/* Reshuffle Button */}
                <button
                  onClick={handleShuffleNewSet}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-400 hover:text-purple-300 transition"
                  title="Đổi đề ngẫu nhiên mới (Xáo trộn lại)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Settings Dialog Trigger Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 text-xs font-medium transition"
              title="Cài đặt số câu hỏi, thời gian và tùy chọn làm bài (Không hardcode)"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Cài đặt</span>
            </button>

            {/* Mode Toggle: Practice vs Exam */}
            <button
              onClick={() => {
                setIsExamMode(!isExamMode);
                handleResetQuiz();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isExamMode
                  ? 'bg-amber-950/60 border-amber-600/60 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
              title="Chuyển chế độ Luyện tập / Thi thử"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{isExamMode ? 'Thi Thử' : 'Luyện Tập'}</span>
            </button>

            {/* Timer Badge */}
            <div
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold cursor-pointer transition select-none ${
                timeLeft < 300
                  ? 'bg-rose-950/70 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-cyan-400'
              }`}
              title="Nhấn để tạm dừng / tiếp tục đếm ngược"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          MAIN CONTENT AREA: 8 COLS (LEFT) + 4 COLS (RIGHT)
      ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* ==================================================
            LEFT COLUMN (8 COLS): QUESTIONS
        ================================================== */}
        <div className="lg:col-span-8 space-y-4">
          {/* HEADER SUMMARY BAR FOR MULTI-QUESTION MODE */}
          {viewMode === 'list' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">Đề bài:</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {displayedQuestions.length} câu hỏi
                </span>
                {isRandom && !isExamMode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                    🎲 Random
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isExamMode ? (
                  <button
                    onClick={handleCheckAllAnswered}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition shadow-sm shadow-cyan-600/30"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Kiểm tra tất cả câu đã làm</span>
                  </button>
                ) : (
                  <button
                    onClick={handleExamSubmit}
                    disabled={examSubmitted}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition shadow-sm shadow-amber-600/30 disabled:opacity-50"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{examSubmitted ? 'Đã Nộp Bài' : 'Nộp Bài Thi'}</span>
                  </button>
                )}

                <button
                  onClick={handleResetQuiz}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition"
                  title="Xóa kết quả đã làm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================
              A. MULTI-QUESTION LIST VIEW ("Làm nhiều câu cùng 1 lúc")
          ================================================== */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {displayedQuestions.map((q, idx) => {
                const isSelected = selectedAnswers[q.id] !== undefined;
                const selectedOptIdx = selectedAnswers[q.id];
                const isSubmitted = Boolean(submittedQuestions[q.id]) || (isExamMode && examSubmitted);
                const isBookmarked = bookmarkedQuestions.has(q.id);

                return (
                  <div
                    key={q.id}
                    id={`q-item-${q.id}`}
                    className={`bg-slate-900/90 border border-slate-800 rounded-xl shadow-md backdrop-blur-md transition-all duration-150 ${
                      isCompact ? 'p-3.5 sm:p-4' : 'p-5 sm:p-6'
                    }`}
                  >
                    {/* Header Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-white">Câu {idx + 1}</span>
                        {q.topic && (
                          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                            • {q.topic.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {getDifficultyBadge(q.difficulty_level)}
                        <button
                          onClick={() => toggleBookmark(q.id)}
                          className={`p-1 rounded-md border text-xs transition ${
                            isBookmarked
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-amber-400'
                          }`}
                          title="Đánh dấu câu hỏi này"
                        >
                          <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Context Text & Diagram (if present) */}
                    {q.context_text && (
                      <div className="mb-3 p-2.5 sm:p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs sm:text-sm text-slate-300">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 mb-1.5 uppercase tracking-wider">
                          <BookOpen className="w-3 h-3" />
                          <span>Sơ đồ / Bối cảnh kỹ thuật</span>
                        </div>
                        <MathMarkdownRenderer content={q.context_text} mediaMap={q.media_map} />
                      </div>
                    )}

                    {/* Question Content */}
                    <div className={`font-medium text-slate-100 ${isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
                      <MathMarkdownRenderer content={q.content} mediaMap={q.media_map} />
                    </div>

                    {/* Options (A, B, C, D) */}
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {q.options.map((option, optIdx) => {
                        const isOptSelected = selectedOptIdx === optIdx;
                        const isCorrect = Boolean(option.is_correct);

                        let optStyle =
                          'border-slate-800 bg-slate-950/40 text-slate-200 hover:border-slate-700 hover:bg-slate-900/60';
                        let badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';

                        if (isSubmitted) {
                          if (isCorrect) {
                            optStyle =
                              'border-emerald-500 bg-emerald-950/30 text-emerald-100 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500';
                            badgeStyle = 'bg-emerald-500 text-slate-950 font-bold border-emerald-400';
                          } else if (isOptSelected && !isCorrect) {
                            optStyle =
                              'border-rose-500 bg-rose-950/30 text-rose-100 shadow-sm shadow-rose-500/10 ring-1 ring-rose-500';
                            badgeStyle = 'bg-rose-500 text-white font-bold border-rose-400';
                          }
                        } else if (isOptSelected) {
                          optStyle =
                            'border-cyan-500 bg-cyan-950/30 text-cyan-100 shadow-sm shadow-cyan-500/15 ring-1 ring-cyan-500';
                          badgeStyle = 'bg-cyan-500 text-slate-950 font-bold border-cyan-400';
                        }

                        return (
                          <div
                            key={option.id || optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`group flex items-start gap-2.5 rounded-lg border transition-all duration-150 cursor-pointer select-none ${
                              isCompact ? 'p-2 sm:p-2.5' : 'p-3'
                            } ${optStyle}`}
                          >
                            <span
                              className={`flex-shrink-0 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded border text-[11px] font-mono font-bold transition-all ${badgeStyle}`}
                            >
                              {optionLetters[optIdx] || optIdx + 1}
                            </span>
                            <div className={`flex-1 pt-0.5 ${isCompact ? 'text-xs sm:text-[13px]' : 'text-sm'}`}>
                              <MathMarkdownRenderer content={option.content} mediaMap={q.media_map} />
                            </div>
                            {isSubmitted && (
                              <div className="flex-shrink-0 pt-0.5">
                                {isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : isOptSelected ? (
                                  <XCircle className="w-4 h-4 text-rose-400" />
                                ) : null}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Question Action Footer (Kiểm tra / Bỏ chọn) */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        {isSelected && !isSubmitted && (
                          <button
                            onClick={() => handleClearAnswer(q.id)}
                            className="text-[11px] font-medium text-slate-400 hover:text-slate-200"
                          >
                            Bỏ chọn
                          </button>
                        )}
                      </div>

                      {!isExamMode && (
                        <div>
                          <button
                            onClick={() => handleCheckQuestion(q.id)}
                            disabled={!isSelected || isSubmitted}
                            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition ${
                              isSubmitted
                                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                : isSelected
                                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                                : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isSubmitted ? 'Đã kiểm tra' : 'Kiểm tra câu này'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Explanation Box (Revealed when checked) */}
                    {isSubmitted && q.explanation && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-cyan-500/30 text-xs sm:text-[13px] animate-in fade-in">
                        <div className="flex items-center gap-1.5 font-bold text-cyan-400 mb-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Giải Thích Kỹ Thuật:</span>
                        </div>
                        <MathMarkdownRenderer content={q.explanation} mediaMap={q.media_map} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ==================================================
              B. SINGLE-QUESTION CARD VIEW ("Làm từng câu")
          ================================================== */}
          {viewMode === 'single' && currentSingleQuestion && (
            <div className={`bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md ${isCompact ? 'p-4 sm:p-5' : 'p-6 sm:p-8'}`}>
              {/* Question Header Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs">
                    {currentIndex + 1}
                  </span>
                  <div>
                    <h2 className="text-xs sm:text-sm font-semibold text-white">
                      Câu hỏi {currentIndex + 1} / {displayedQuestions.length}
                    </h2>
                    {currentSingleQuestion.topic && (
                      <p className="text-[11px] text-slate-400 font-mono">
                        {currentSingleQuestion.topic.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {getDifficultyBadge(currentSingleQuestion.difficulty_level)}
                  <button
                    onClick={() => toggleBookmark(currentSingleQuestion.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                      bookmarkedQuestions.has(currentSingleQuestion.id)
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-amber-400'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${bookmarkedQuestions.has(currentSingleQuestion.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span className="hidden sm:inline">
                      {bookmarkedQuestions.has(currentSingleQuestion.id) ? 'Đã Lưu' : 'Lưu'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Context Text & Diagram */}
              {currentSingleQuestion.context_text && (
                <div className="mb-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 mb-1.5 uppercase tracking-wider">
                    <BookOpen className="w-3 h-3" />
                    <span>Bối cảnh &amp; Sơ đồ kỹ thuật</span>
                  </div>
                  <MathMarkdownRenderer
                    content={currentSingleQuestion.context_text}
                    mediaMap={currentSingleQuestion.media_map}
                  />
                </div>
              )}

              {/* Question Content */}
              <div className={`font-medium text-slate-100 ${isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}>
                <MathMarkdownRenderer
                  content={currentSingleQuestion.content}
                  mediaMap={currentSingleQuestion.media_map}
                />
              </div>

              {/* Options */}
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Chọn phương án (Phím tắt A, B, C, D):
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {currentSingleQuestion.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentSingleQuestion.id] === optIdx;
                    const isSubmitted =
                      Boolean(submittedQuestions[currentSingleQuestion.id]) ||
                      (isExamMode && examSubmitted);
                    const isCorrect = Boolean(option.is_correct);

                    let optStyle =
                      'border-slate-800 bg-slate-950/40 text-slate-200 hover:border-slate-700 hover:bg-slate-900/60';
                    let badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';

                    if (isSubmitted) {
                      if (isCorrect) {
                        optStyle =
                          'border-emerald-500 bg-emerald-950/30 text-emerald-100 ring-1 ring-emerald-500';
                        badgeStyle = 'bg-emerald-500 text-slate-950 font-bold border-emerald-400';
                      } else if (isSelected && !isCorrect) {
                        optStyle =
                          'border-rose-500 bg-rose-950/30 text-rose-100 ring-1 ring-rose-500';
                        badgeStyle = 'bg-rose-500 text-white font-bold border-rose-400';
                      }
                    } else if (isSelected) {
                      optStyle =
                        'border-cyan-500 bg-cyan-950/30 text-cyan-100 ring-1 ring-cyan-500';
                      badgeStyle = 'bg-cyan-500 text-slate-950 font-bold border-cyan-400';
                    }

                    return (
                      <div
                        key={option.id || optIdx}
                        onClick={() => handleSelectOption(currentSingleQuestion.id, optIdx)}
                        className={`group flex items-start gap-3 rounded-lg border transition-all cursor-pointer select-none ${
                          isCompact ? 'p-2.5 sm:p-3' : 'p-3.5 sm:p-4'
                        } ${optStyle}`}
                      >
                        <span
                          className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded border text-xs font-mono font-bold ${badgeStyle}`}
                        >
                          {optionLetters[optIdx] || optIdx + 1}
                        </span>
                        <div className={`flex-1 pt-0.5 ${isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
                          <MathMarkdownRenderer
                            content={option.content}
                            mediaMap={currentSingleQuestion.media_map}
                          />
                        </div>
                        {isSubmitted && (
                          <div className="flex-shrink-0 pt-0.5">
                            {isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : isSelected ? (
                              <XCircle className="w-4 h-4 text-rose-400" />
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 transition text-xs font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Câu Trước</span>
                  </button>

                  <button
                    onClick={() => setCurrentIndex((i) => Math.min(displayedQuestions.length - 1, i + 1))}
                    disabled={currentIndex === displayedQuestions.length - 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-40 transition text-xs font-semibold"
                  >
                    <span>Câu Sau</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedAnswers[currentSingleQuestion.id] !== undefined &&
                    !submittedQuestions[currentSingleQuestion.id] && (
                      <button
                        onClick={() => handleClearAnswer(currentSingleQuestion.id)}
                        className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                      >
                        Bỏ Chọn
                      </button>
                    )}

                  {!isExamMode && (
                    <button
                      onClick={() => handleCheckQuestion(currentSingleQuestion.id)}
                      disabled={
                        selectedAnswers[currentSingleQuestion.id] === undefined ||
                        submittedQuestions[currentSingleQuestion.id]
                      }
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md disabled:opacity-40 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {submittedQuestions[currentSingleQuestion.id]
                          ? 'Đã Kiểm Tra'
                          : 'Kiểm Tra'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Explanation Box */}
              {(submittedQuestions[currentSingleQuestion.id] || (isExamMode && examSubmitted)) &&
                currentSingleQuestion.explanation && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs sm:text-sm animate-in fade-in">
                    <div className="flex items-center gap-1.5 font-bold text-cyan-400 mb-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Hướng Dẫn &amp; Phân Tích Kỹ Thuật</span>
                    </div>
                    <MathMarkdownRenderer
                      content={currentSingleQuestion.explanation}
                      mediaMap={currentSingleQuestion.media_map}
                    />
                  </div>
                )}
            </div>
          )}
        </div>

        {/* ==================================================
            RIGHT COLUMN (4 COLS): STICKY QUESTION MATRIX
        ================================================== */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-md space-y-4">
            {/* Header Matrix & Filter Tabs */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>Ma Trận Đề Thi</span>
                <span className="text-[11px] font-mono font-normal text-slate-400">
                  ({stats.answeredCount}/{stats.total})
                </span>
              </h3>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-[10px]">
                <button
                  onClick={() => setMatrixFilter('all')}
                  className={`px-1.5 py-0.5 rounded ${
                    matrixFilter === 'all'
                      ? 'bg-cyan-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setMatrixFilter('unanswered')}
                  className={`px-1.5 py-0.5 rounded ${
                    matrixFilter === 'unanswered'
                      ? 'bg-cyan-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Chưa làm
                </button>
                <button
                  onClick={() => setMatrixFilter('bookmarked')}
                  className={`px-1.5 py-0.5 rounded ${
                    matrixFilter === 'bookmarked'
                      ? 'bg-cyan-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Đã Lưu
                </button>
              </div>
            </div>

            {/* Matrix Grid (1, 2, 3... N) */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-5 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
              {filteredIndices.map(({ q, idx }) => {
                const isCurrent = viewMode === 'single' && idx === currentIndex;
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isBookmarked = bookmarkedQuestions.has(q.id);
                const isSubmitted = Boolean(submittedQuestions[q.id]) || (isExamMode && examSubmitted);
                const selectedOptIdx = selectedAnswers[q.id];
                const isCorrect =
                  selectedOptIdx !== undefined && q.options[selectedOptIdx]?.is_correct;

                let btnStyle = 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700';

                if (isCurrent) {
                  btnStyle =
                    'border-cyan-400 bg-cyan-950 text-cyan-200 font-bold ring-2 ring-cyan-500/50';
                } else if (isSubmitted) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-950/70 text-emerald-300 font-semibold';
                  } else {
                    btnStyle = 'border-rose-500 bg-rose-950/70 text-rose-300 font-semibold';
                  }
                } else if (isAnswered) {
                  btnStyle = 'border-blue-600 bg-blue-950/70 text-blue-200 font-medium';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => scrollToQuestion(idx, q.id)}
                    className={`relative flex items-center justify-center h-8 rounded-lg border text-xs font-mono transition-all duration-150 ${btnStyle}`}
                    title={`Chuyển đến Câu ${idx + 1}`}
                  >
                    <span>{idx + 1}</span>

                    {isBookmarked && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend Indicators */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded border border-blue-600 bg-blue-950"></span>
                <span>Đã chọn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded border border-slate-800 bg-slate-950"></span>
                <span>Chưa làm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded border border-emerald-500 bg-emerald-950"></span>
                <span>Đúng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded border border-rose-500 bg-rose-950"></span>
                <span>Sai</span>
              </div>
            </div>

            {/* Summary Progress Card */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Tiến độ bài làm:</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {stats.total > 0 ? Math.round((stats.answeredCount / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${stats.total > 0 ? (stats.answeredCount / stats.total) * 100 : 0}%`
                  }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
                <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-mono">Đã làm</div>
                  <div className="text-xs font-bold text-white font-mono">{stats.answeredCount}</div>
                </div>
                <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-mono">Đúng</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">{stats.correctCount}</div>
                </div>
                <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800">
                  <div className="text-[9px] text-slate-400 font-mono">Chính xác</div>
                  <div className="text-xs font-bold text-cyan-400 font-mono">{stats.accuracy}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Settings Modal (Configurable question limit, timer, etc. - NOT hardcoded) */}
      <QuizSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={quizSettings}
        onSaveSettings={handleSaveSettings}
        totalAvailableQuestions={questions.length}
      />
    </div>
  );
};

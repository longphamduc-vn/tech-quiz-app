import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  History,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trash2,
  Eye,
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Calendar,
  User as UserIcon,
  X
} from 'lucide-react';
import { User, QuizAttempt, UserStats } from '../types/index.js';
import {
  fetchQuizHistory,
  fetchQuizAttemptDetail,
  fetchUserStats,
  deleteQuizAttempt,
  clearUserHistory
} from '../utils/api.js';
import { MathMarkdownRenderer } from '../components/MathMarkdownRenderer.js';

interface HistoryPageProps {
  currentUser: User | null;
  users: User[];
  onOpenUserModal: () => void;
  onNavigateToQuiz: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  currentUser,
  users,
  onOpenUserModal,
  onNavigateToQuiz
}) => {
  const [historyList, setHistoryList] = useState<QuizAttempt[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState<number | 'all'>(
    currentUser?.id || 'all'
  );
  const [selectedMode, setSelectedMode] = useState<'all' | 'exam' | 'practice'>('all');
  const [searchTopic, setSearchTopic] = useState('');

  const [reviewAttempt, setReviewAttempt] = useState<QuizAttempt | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');

  useEffect(() => {
    if (currentUser) setSelectedUserId(currentUser.id);
  }, [currentUser]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const uid = selectedUserId === 'all' ? undefined : selectedUserId;
      const [list, stats] = await Promise.all([
        fetchQuizHistory(uid, selectedMode === 'all' ? undefined : selectedMode),
        selectedUserId !== 'all' ? fetchUserStats(selectedUserId).catch(() => null) : null
      ]);
      setHistoryList(list);
      setUserStats(stats);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, selectedMode]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDeleteAttempt = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa bản ghi lịch sử làm bài này?')) return;
    try {
      await deleteQuizAttempt(id);
      setHistoryList((prev) => prev.filter((a) => a.id !== id));
      if (selectedUserId !== 'all') {
        const stats = await fetchUserStats(selectedUserId).catch(() => null);
        setUserStats(stats);
      }
    } catch (err: any) { alert(err.message || 'Lỗi khi xóa bản ghi'); }
  };

  const handleClearAll = async () => {
    if (selectedUserId === 'all') {
      alert('Vui lòng chọn một người dùng cụ thể để xóa lịch sử');
      return;
    }
    if (!confirm('Bạn có chắc muốn xóa TOÀN BỘ lịch sử làm bài của người dùng này?')) return;
    try {
      await clearUserHistory(selectedUserId);
      setHistoryList([]);
      setUserStats(null);
    } catch (err: any) { alert(err.message || 'Lỗi khi xóa lịch sử'); }
  };

  const handleOpenReview = async (id: number) => {
    try {
      const detail = await fetchQuizAttemptDetail(id);
      setReviewAttempt(detail);
      setReviewFilter('all');
    } catch (err: any) { alert(err.message || 'Không thể tải chi tiết bài làm'); }
  };

  const filteredHistory = useMemo(() => {
    if (!searchTopic.trim()) return historyList;
    const term = searchTopic.toLowerCase();
    return historyList.filter(
      (a) =>
        (a.topic_name && a.topic_name.toLowerCase().includes(term)) ||
        (a.user && a.user.display_name.toLowerCase().includes(term))
    );
  }, [historyList, searchTopic]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString.replace(' ', 'T') + (isoString.includes('Z') ? '' : 'Z'));
      return d.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return isoString; }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-950/80 text-amber-300 border border-amber-800">🏆 {score}% (Xuất sắc)</span>;
    if (score >= 80) return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800">🌟 {score}% (Giỏi)</span>;
    if (score >= 65) return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800">👍 {score}% (Khá)</span>;
    if (score >= 50) return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-950/80 text-blue-300 border border-blue-800">📝 {score}% (Đạt)</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-950/80 text-rose-300 border border-rose-800">💡 {score}% (Cần cố gắng)</span>;
  };

  const filteredReviewQuestions = useMemo(() => {
    if (!reviewAttempt || !Array.isArray(reviewAttempt.answers_detail)) return [];
    return reviewAttempt.answers_detail.filter((item) => {
      if (reviewFilter === 'correct') return item.is_correct;
      if (reviewFilter === 'incorrect') return !item.is_correct && item.selected_option_index !== undefined;
      if (reviewFilter === 'unanswered') return item.selected_option_index === undefined;
      return true;
    });
  }, [reviewAttempt, reviewFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: User Profile Info & Switcher */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-cyan-500/10"
            style={{ backgroundColor: currentUser?.color || '#06b6d4' }}
          >
            {(currentUser?.display_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {currentUser?.display_name || 'Học Viên'}
              </h1>
              <span className="text-xs font-mono text-slate-400">@{currentUser?.username}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                {currentUser?.role === 'engineer' ? 'Kỹ Sư' : currentUser?.role === 'admin' ? 'Quản Trị' : 'Học Viên'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Bảng theo dõi tiến độ và lịch sử làm bài thi trắc nghiệm kỹ thuật
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
          >
            <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Đổi Tài Khoản</span>
          </button>

          <button
            onClick={onNavigateToQuiz}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-600/30"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Vào Làm Đề Mới</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Tổng lượt làm</span>
            <History className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {userStats ? userStats.total_attempts : historyList.length}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {userStats ? `${userStats.exam_attempts} thi • ${userStats.practice_attempts} luyện tập` : 'Tất cả bài'}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Điểm trung bình</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {userStats?.avg_score !== undefined && userStats?.avg_score !== null ? `${userStats.avg_score}%` : '--'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Theo tất cả lần nộp</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Điểm cao nhất</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {userStats?.highest_score !== undefined && userStats?.highest_score !== null ? `${userStats.highest_score}%` : '--'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Kỷ lục bài thi</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Thời gian ôn luyện</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono">
            {userStats ? formatDuration(userStats.total_time_spent_seconds) : '--'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Tổng thời lượng</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Độ chính xác</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-blue-400 font-mono">
            {userStats?.overall_accuracy !== undefined && userStats?.overall_accuracy !== null ? `${userStats.overall_accuracy}%` : '--'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {userStats ? `${userStats.total_correct_answers}/${userStats.total_questions_answered} câu đúng` : 'Tỉ lệ câu đúng'}
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Hồ sơ:</span>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
            >
              <option value="all">Tất cả người dùng</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.display_name} (@{u.username})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setSelectedMode('all')}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedMode === 'all' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setSelectedMode('exam')}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedMode === 'exam' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Thi Thử
            </button>
            <button
              onClick={() => setSelectedMode('practice')}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedMode === 'practice' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Luyện Tập
            </button>
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              placeholder="Tìm kiếm chủ đề, môn học..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>

        {selectedUserId !== 'all' && historyList.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 text-xs font-medium transition"
            title="Xóa toàn bộ lịch sử của người dùng này"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xóa Lịch Sử</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs font-mono text-slate-400">Đang tải lịch sử làm bài...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Chưa có lịch sử làm bài nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Khi bạn nộp bài thi hoặc hoàn thành luyện tập, kết quả và đáp án chi tiết sẽ được tự động lưu trữ tại đây.
          </p>
          <button
            onClick={onNavigateToQuiz}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-600/30"
          >
            <span>Bắt Đầu Làm Bài Ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isExam = item.mode === 'exam';

            return (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 sm:p-5 transition-all shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1">
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl font-mono font-bold text-sm ${
                      isExam
                        ? 'bg-amber-950/80 border border-amber-600/50 text-amber-400'
                        : 'bg-purple-950/80 border border-purple-600/50 text-purple-300'
                    }`}
                  >
                    {isExam ? <Award className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {item.topic_name || 'Đề Thi Tổng Hợp'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          isExam
                            ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                            : 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                        }`}
                      >
                        {isExam ? 'Thi Thử' : 'Luyện Tập'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(item.created_at)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatDuration(item.time_spent_seconds)}
                      </span>
                      <span>•</span>
                      <span>
                        Đúng: <strong className="text-white">{item.correct_count}/{item.total_questions}</strong> câu
                      </span>
                      {item.user && selectedUserId === 'all' && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-400">@{item.user.display_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div>{getScoreBadge(item.score_percentage)}</div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenReview(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition"
                      title="Xem lại chi tiết từng câu hỏi và lời giải"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem Lại</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAttempt(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 transition"
                      title="Xóa bản ghi này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attempt Review Modal */}
      {reviewAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                    reviewAttempt.mode === 'exam'
                      ? 'bg-amber-950/80 border border-amber-600/50 text-amber-400'
                      : 'bg-purple-950/80 border border-purple-600/50 text-purple-300'
                  }`}
                >
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">
                      Xem Lại Bài Làm: {reviewAttempt.topic_name || 'Đề Tổng Hợp'}
                    </h2>
                    {getScoreBadge(reviewAttempt.score_percentage)}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Thí sinh: {reviewAttempt.user?.display_name || 'Học viên'} • Nộp lúc: {formatDate(reviewAttempt.created_at)} • Thời gian: {formatDuration(reviewAttempt.time_spent_seconds)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setReviewAttempt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-2.5 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    reviewFilter === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tất cả ({reviewAttempt.answers_detail.length})
                </button>
                <button
                  onClick={() => setReviewFilter('correct')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    reviewFilter === 'correct' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Đúng ({reviewAttempt.correct_count})
                </button>
                <button
                  onClick={() => setReviewFilter('incorrect')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    reviewFilter === 'incorrect' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sai ({reviewAttempt.answers_detail.filter((q) => !q.is_correct && q.selected_option_index !== undefined).length})
                </button>
                <button
                  onClick={() => setReviewFilter('unanswered')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    reviewFilter === 'unanswered' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Chưa làm ({reviewAttempt.answers_detail.filter((q) => q.selected_option_index === undefined).length})
                </button>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Hiển thị: <strong className="text-white">{filteredReviewQuestions.length}</strong> câu hỏi
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {filteredReviewQuestions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không có câu hỏi nào trong mục lọc này.
                </div>
              ) : (
                filteredReviewQuestions.map((q, idx) => {
                  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

                  return (
                    <div
                      key={q.question_id || idx}
                      className={`rounded-xl border p-4 sm:p-5 space-y-3 ${
                        q.is_correct
                          ? 'bg-slate-950/60 border-emerald-900/50'
                          : q.selected_option_index === undefined
                          ? 'bg-slate-950/60 border-slate-800'
                          : 'bg-slate-950/60 border-rose-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-xs ${
                              q.is_correct
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : q.selected_option_index === undefined
                                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">Câu {idx + 1}</span>
                          {q.topic_name && (
                            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                              • {q.topic_name}
                            </span>
                          )}
                        </div>

                        <div>
                          {q.is_correct ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Chính xác
                            </span>
                          ) : q.selected_option_index === undefined ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                              <HelpCircle className="w-3 h-3" />
                              Chưa làm
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950 text-rose-400 border border-rose-800">
                              <XCircle className="w-3 h-3" />
                              Chưa đúng
                            </span>
                          )}
                        </div>
                      </div>

                      {q.context_text && (
                        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-300">
                          <MathMarkdownRenderer content={q.context_text} mediaMap={{}} />
                        </div>
                      )}

                      <div className="text-sm sm:text-base font-medium text-slate-100">
                        <MathMarkdownRenderer content={q.question_content} mediaMap={{}} />
                      </div>

                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelectedByUser = q.selected_option_index === optIdx;
                          const isTheCorrectOption = opt.is_correct;

                          let style = 'bg-slate-900/60 border-slate-800/80 text-slate-300';
                          let badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';

                          if (isTheCorrectOption) {
                            style = 'bg-emerald-950/40 border-emerald-500/80 text-emerald-100 ring-1 ring-emerald-500/30';
                            badgeStyle = 'bg-emerald-500 text-slate-950 font-bold border-emerald-400';
                          } else if (isSelectedByUser && !isTheCorrectOption) {
                            style = 'bg-rose-950/40 border-rose-500/80 text-rose-100 ring-1 ring-rose-500/30';
                            badgeStyle = 'bg-rose-500 text-white font-bold border-rose-400';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm ${style}`}
                            >
                              <span
                                className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded border text-xs font-mono font-bold ${badgeStyle}`}
                              >
                                {optionLetters[optIdx] || optIdx + 1}
                              </span>
                              <div className="flex-1 pt-0.5">
                                <MathMarkdownRenderer content={opt.content} mediaMap={{}} />
                              </div>
                              {isSelectedByUser && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
                                  Bạn đã chọn
                                </span>
                              )}
                              {isTheCorrectOption && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-semibold">
                                  Đáp án đúng
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-xs sm:text-sm text-cyan-200 space-y-1 mt-2">
                          <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-xs uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Lời giải chi tiết:</span>
                          </div>
                          <div>
                            <MathMarkdownRenderer content={q.explanation} mediaMap={{}} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Số câu đúng: <strong className="text-emerald-400">{reviewAttempt.correct_count}</strong> / {reviewAttempt.total_questions} câu
              </span>
              <button
                onClick={() => setReviewAttempt(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

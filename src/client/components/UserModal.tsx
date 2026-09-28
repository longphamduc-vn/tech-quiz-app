import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  UserPlus,
  Check,
  Trash2,
  Sparkles,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  ShieldAlert
} from 'lucide-react';
import { User, CreateUserPayload } from '../types/index.js';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User | null;
  onSelectUser: (user: User) => void;
  onCreateUser: (payload: CreateUserPayload) => Promise<User>;
  onDeleteUser: (userId: number) => Promise<void>;
}

const PRESET_COLORS = [
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#14b8a6'  // Teal
];

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
  onCreateUser,
  onDeleteUser
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'create'>('switch');

  // Form State
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'engineer' | 'admin'>('student');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên tài khoản (username)');
      return;
    }

    try {
      setIsSubmitting(true);
      const newUser = await onCreateUser({
        username: username.trim(),
        display_name: displayName.trim() || username.trim(),
        email: email.trim() || undefined,
        role,
        color
      });

      // Reset form & switch to new user
      setUsername('');
      setDisplayName('');
      setEmail('');
      setRole('student');
      onSelectUser(newUser);
      setActiveTab('switch');
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi tạo người dùng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'engineer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950/80 text-blue-400 border border-blue-800">
            <Briefcase className="w-2.5 h-2.5" />
            Kỹ Sư
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950/80 text-purple-400 border border-purple-800">
            <Award className="w-2.5 h-2.5" />
            Quản Trị
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <GraduationCap className="w-2.5 h-2.5" />
            Học Viên
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Quản Lý Người Dùng & Hồ Sơ</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Chọn tài khoản làm bài để lưu trữ &amp; theo dõi lịch sử kết quả
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-800/80 bg-slate-900/60">
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'switch'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Chọn Người Dùng ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'create'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Người Dùng Mới</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'switch' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Lịch sử làm bài và điểm số sẽ được ghi nhận tương ứng theo hồ sơ người dùng đang hoạt động:
              </p>

              <div className="space-y-2.5">
                {users.map((u) => {
                  const isSelected = currentUser?.id === u.id;
                  const initial = (u.display_name || u.username).charAt(0).toUpperCase();

                  return (
                    <div
                      key={u.id}
                      onClick={() => onSelectUser(u)}
                      className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-500/60 ring-1 ring-cyan-500/30'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className="flex items-center justify-center w-11 h-11 rounded-xl text-white font-bold text-base shadow-md"
                          style={{ backgroundColor: u.color || '#06b6d4' }}
                        >
                          {initial}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{u.display_name}</span>
                            <span className="text-xs font-mono text-slate-400">@{u.username}</span>
                            {getRoleBadge(u.role)}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-slate-400">
                            <span>Đã làm: <strong className="text-cyan-400 font-semibold">{u.total_attempts || 0}</strong> bài</span>
                            {u.avg_score !== undefined && u.avg_score !== null && (
                              <span>• Điểm TB: <strong className="text-emerald-400 font-semibold">{u.avg_score}%</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold">
                            <Check className="w-3.5 h-3.5" />
                            Đang chọn
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectUser(u);
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                          >
                            Chọn
                          </button>
                        )}

                        {users.length > 1 && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm(`Bạn có chắc muốn xóa người dùng "${u.display_name}" cùng toàn bộ lịch sử làm bài?`)) {
                                try {
                                  await onDeleteUser(u.id);
                                } catch (err: any) {
                                  setErrorMsg(err.message);
                                }
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition opacity-0 group-hover:opacity-100"
                            title="Xóa người dùng này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tên tài khoản (Username) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g. kisu_nam, sinhvien_bk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-500">Chỉ gồm chữ thường không dấu, số và dấu gạch dưới.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Họ và tên hiển thị (Display Name)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Nguyễn Văn Nam, Kỹ Sư Thiết Kế IC"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Vai trò / Chức danh
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
                  >
                    <option value="student">🎓 Học Viên / Sinh Viên</option>
                    <option value="engineer">💼 Kỹ Sư Kỹ Thuật</option>
                    <option value="admin">⭐ Quản Trị Viên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email liên hệ (Tùy chọn)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Màu đại diện (Avatar Color)
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                        color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-105 opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang tạo hồ sơ...' : 'Tạo Hồ Sơ Người Dùng'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

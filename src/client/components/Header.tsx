import React from 'react';
import { Cpu, BookOpen, PenTool, Database, History, User as UserIcon } from 'lucide-react';
import { ActiveTab, User } from '../types/index.js';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  questionCount: number;
  currentUser: User | null;
  onOpenUserModal: () => void;
  historyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  questionCount,
  currentUser,
  onOpenUserModal,
  historyCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-lg shadow-cyan-500/20 text-white">
              <Cpu className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  TechQuiz<span className="text-cyan-400">Pro</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Hệ Thống Trắc Nghiệm Kỹ Thuật Điện & Vi Mạch
              </p>
            </div>
          </div>

          {/* Navigation View Tabs */}
          <nav className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
            <button
              onClick={() => onTabChange('quiz')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'quiz'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Thi & Luyện Tập</span>
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'quiz' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {questionCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('history')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'history'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Lịch Sử</span>
              {historyCount !== undefined && historyCount > 0 && (
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === 'history' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'admin'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span className="hidden md:inline">Studio Soạn Thảo</span>
              <span className="md:hidden">Studio</span>
            </button>

            <button
              onClick={() => onTabChange('db')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'db'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span className="hidden md:inline">SQLite Inspector</span>
              <span className="md:hidden">SQLite</span>
            </button>
          </nav>

          {/* User Profile Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenUserModal}
              className="flex items-center gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition group"
              title="Nhấp để đổi hoặc quản lý người dùng"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm transition-transform group-hover:scale-105"
                style={{ backgroundColor: currentUser?.color || '#06b6d4' }}
              >
                {(currentUser?.display_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors leading-tight">
                  {currentUser?.display_name || 'Học Viên'}
                </div>
                <div className="text-[10px] font-mono text-slate-400 leading-tight">
                  {currentUser?.role === 'engineer' ? 'Kỹ Sư' : currentUser?.role === 'admin' ? 'Quản Trị' : 'Học Viên'}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

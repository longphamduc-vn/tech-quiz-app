import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Save,
  RotateCcw,
  Check,
  Shuffle,
  Clock,
  Layers,
  LayoutList,
  Minimize2,
  Maximize2,
  Sliders
} from 'lucide-react';

export interface QuizSettings {
  questionLimit: number | 'all';
  examDurationMinutes: number;
  isRandom: boolean;
  shuffleOptions: boolean;
  defaultViewMode: 'list' | 'single';
  isCompact: boolean;
}

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  questionLimit: 20,
  examDurationMinutes: 30,
  isRandom: true,
  shuffleOptions: false,
  defaultViewMode: 'list',
  isCompact: true
};

export const SETTINGS_STORAGE_KEY = 'tech_quiz_app_settings';

export function loadStoredSettings(): QuizSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_QUIZ_SETTINGS,
        ...parsed,
        questionLimit:
          parsed.questionLimit === 'all'
            ? 'all'
            : typeof parsed.questionLimit === 'number' && parsed.questionLimit > 0
            ? parsed.questionLimit
            : DEFAULT_QUIZ_SETTINGS.questionLimit
      };
    }
  } catch (err) {
    console.warn('Failed to load quiz settings from localStorage', err);
  }
  return DEFAULT_QUIZ_SETTINGS;
}

export function saveStoredSettings(settings: QuizSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save quiz settings to localStorage', err);
  }
}

interface QuizSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: QuizSettings;
  onSaveSettings: (newSettings: QuizSettings) => void;
  totalAvailableQuestions: number;
}

export const QuizSettingsModal: React.FC<QuizSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaveSettings,
  totalAvailableQuestions
}) => {
  const [settings, setSettings] = useState<QuizSettings>(currentSettings);
  const [customLimitInput, setCustomLimitInput] = useState<string>(
    typeof currentSettings.questionLimit === 'number' ? String(currentSettings.questionLimit) : '20'
  );
  const [isCustomLimit, setIsCustomLimit] = useState<boolean>(
    typeof currentSettings.questionLimit === 'number' &&
      ![5, 10, 15, 20, 30, 40, 50, 100].includes(currentSettings.questionLimit)
  );

  useEffect(() => {
    setSettings(currentSettings);
    if (typeof currentSettings.questionLimit === 'number') {
      setCustomLimitInput(String(currentSettings.questionLimit));
      setIsCustomLimit(![5, 10, 15, 20, 30, 40, 50, 100].includes(currentSettings.questionLimit));
    } else {
      setIsCustomLimit(false);
    }
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const presetLimits = [5, 10, 15, 20, 30, 40, 50, 100];
  const presetTimes = [15, 20, 30, 45, 60, 90];

  const handleSelectPresetLimit = (limit: number | 'all') => {
    setIsCustomLimit(false);
    setSettings((prev) => ({ ...prev, questionLimit: limit }));
    if (typeof limit === 'number') {
      setCustomLimitInput(String(limit));
    }
  };

  const handleCustomLimitChange = (valStr: string) => {
    setCustomLimitInput(valStr);
    setIsCustomLimit(true);
    const num = parseInt(valStr, 10);
    if (!isNaN(num) && num > 0) {
      setSettings((prev) => ({ ...prev, questionLimit: num }));
    }
  };

  const handleSave = () => {
    let finalLimit = settings.questionLimit;
    if (isCustomLimit) {
      const num = parseInt(customLimitInput, 10);
      finalLimit = !isNaN(num) && num > 0 ? num : 20;
    }
    const finalSettings: QuizSettings = {
      ...settings,
      questionLimit: finalLimit
    };
    saveStoredSettings(finalSettings);
    onSaveSettings(finalSettings);
    onClose();
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_QUIZ_SETTINGS);
    setCustomLimitInput('20');
    setIsCustomLimit(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Cài Đặt Bài Thi &amp; Luyện Tập
              </h3>
              <p className="text-[11px] text-slate-400">
                Tùy chỉnh số lượng câu hỏi, thời gian làm bài và chế độ hiển thị
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs sm:text-[13px]">
          {/* SECTION 1: QUESTION LIMIT (GIỚI HẠN SỐ CÂU HỎI - KHÔNG HARDCODE) */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Số lượng câu hỏi mỗi lượt thi / luyện tập:</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-cyan-400">
                {settings.questionLimit === 'all'
                  ? `Tất cả (${totalAvailableQuestions} câu)`
                  : `${settings.questionLimit} câu`}
              </span>
            </div>

            {/* Preset chips */}
            <div className="flex flex-wrap gap-1.5">
              {presetLimits.map((preset) => {
                const isSelected = !isCustomLimit && settings.questionLimit === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPresetLimit(preset)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition ${
                      isSelected
                        ? 'bg-cyan-600 border-cyan-500 text-white font-bold shadow-sm shadow-cyan-600/30'
                        : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    {preset} câu
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handleSelectPresetLimit('all')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition ${
                  !isCustomLimit && settings.questionLimit === 'all'
                    ? 'bg-cyan-600 border-cyan-500 text-white font-bold shadow-sm shadow-cyan-600/30'
                    : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                Tất cả ({totalAvailableQuestions})
              </button>
            </div>

            {/* Custom Limit Input */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
              <label className="text-[11px] text-slate-400 whitespace-nowrap">
                Hoặc nhập số câu tùy ý:
              </label>
              <div className="relative flex-1 max-w-[140px]">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={customLimitInput}
                  onChange={(e) => handleCustomLimitChange(e.target.value)}
                  placeholder="Ví dụ: 25"
                  className={`w-full bg-slate-900 border rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none transition ${
                    isCustomLimit
                      ? 'border-cyan-500 ring-1 ring-cyan-500/30 font-bold'
                      : 'border-slate-700'
                  }`}
                />
              </div>
              <span className="text-[11px] text-slate-400">câu hỏi</span>
            </div>
          </div>

          {/* SECTION 2: EXAM TIME LIMIT */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Thời gian thi thử (Đếm ngược):</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-amber-400">
                {settings.examDurationMinutes} phút
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {presetTimes.map((mins) => {
                const isSelected = settings.examDurationMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, examDurationMinutes: mins }))}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition ${
                      isSelected
                        ? 'bg-amber-600 border-amber-500 text-white font-bold shadow-sm'
                        : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    {mins} phút
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: RANDOMIZATION OPTIONS */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5 text-purple-400" />
              <span>Chế độ xáo trộn ngẫu nhiên (Random):</span>
            </h4>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900">
                <div>
                  <div className="font-medium text-slate-200">Xáo trộn câu hỏi ngẫu nhiên</div>
                  <div className="text-[11px] text-slate-400">
                    Tự động xáo trộn ngẫu nhiên thứ tự câu hỏi khi làm bài
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.isRandom}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, isRandom: e.target.checked }))
                  }
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900">
                <div>
                  <div className="font-medium text-slate-200">Xáo trộn thứ tự đáp án (A, B, C, D)</div>
                  <div className="text-[11px] text-slate-400">
                    Thay đổi vị trí ngẫu nhiên các phương án lựa chọn trong câu hỏi
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.shuffleOptions}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, shuffleOptions: e.target.checked }))
                  }
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* SECTION 4: DISPLAY & DENSITY */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <LayoutList className="w-3.5 h-3.5 text-blue-400" />
              <span>Hiển thị &amp; Giao diện mặc định:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, defaultViewMode: 'list' }))}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition ${
                  settings.defaultViewMode === 'list'
                    ? 'border-cyan-500 bg-cyan-950/30 text-cyan-200 font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                <LayoutList className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <div className="font-medium">Nhiều câu cùng lúc</div>
                  <div className="text-[10px] text-slate-400">Cuộn danh sách toàn đề</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, defaultViewMode: 'single' }))}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition ${
                  settings.defaultViewMode === 'single'
                    ? 'border-cyan-500 bg-cyan-950/30 text-cyan-200 font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <div className="font-medium">Từng câu một</div>
                  <div className="text-[10px] text-slate-400">Thẻ câu hỏi riêng biệt</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, isCompact: true }))}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition ${
                  settings.isCompact
                    ? 'border-cyan-500 bg-cyan-950/30 text-cyan-200 font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Minimize2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <div className="font-medium">Cỡ nhỏ gọn (Compact)</div>
                  <div className="text-[10px] text-slate-400">Mật độ cao, vừa màn hình</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, isCompact: false }))}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition ${
                  !settings.isCompact
                    ? 'border-cyan-500 bg-cyan-950/30 text-cyan-200 font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Maximize2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <div className="font-medium">Cỡ tiêu chuẩn</div>
                  <div className="text-[10px] text-slate-400">Khoảng cách thoáng</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 text-xs">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition font-medium"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-600/30 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Cài Đặt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

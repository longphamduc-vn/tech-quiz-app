import React, { useState, useMemo, useRef } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  Save,
  Sparkles,
  Eye,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { Topic, MediaAsset, CreateQuestionPayload } from '../types/index.js';
import { MathMarkdownRenderer } from '../components/MathMarkdownRenderer.js';
import { createQuestion, uploadMediaFile } from '../utils/api.js';

interface AdminEditorProps {
  topics: Topic[];
  mediaAssets: MediaAsset[];
  onQuestionCreated: () => void;
  onRefreshMedia: () => void;
}

export const AdminEditor: React.FC<AdminEditorProps> = ({
  topics,
  mediaAssets,
  onQuestionCreated,
  onRefreshMedia
}) => {
  // Form State
  const [topicId, setTopicId] = useState<number>(topics[0]?.id || 1);
  const [difficulty, setDifficulty] = useState<number>(2);
  const [questionType, setQuestionType] = useState<string>('SINGLE_CHOICE');
  const [tagsInput, setTagsInput] = useState<string>('Điện tử, Mạch RLC');
  const [contextText, setContextText] = useState<string>(
    `Xem xét sơ đồ khối mạch kỹ thuật dưới đây:\n\n<!-- media:fig_circuit_001 -->\n\nNguồn phát xung có biên độ điện áp đỉnh $V_p = 10\\,\\text{V}$.`
  );
  const [content, setContent] = useState<string>(
    `Xác định điện áp ra tức thời $v_{out}(t)$ khi tần số đạt giá trị cộng hưởng $f_0 = \\frac{1}{2\\pi\\sqrt{LC}}$?`
  );
  const [explanation, setExplanation] = useState<string>(
    `**Giải thích chi tiết:**\nTại tần số cộng hưởng, dung kháng triệt tiêu cảm kháng $Z_L = Z_C$, mạch chỉ còn trở thuần $R$. Do đó dòng điện đạt cực đại: $$I = \\frac{V}{R}$$`
  );

  const [options, setOptions] = useState<
    Array<{ content: string; is_correct: boolean; has_image: boolean; image_url?: string }>
  >([
    { content: '$v_{out}(t) = 10\\cos(\\omega_0 t)\\,\\text{V}$', is_correct: true, has_image: false },
    { content: '$v_{out}(t) = 0\\,\\text{V}$', is_correct: false, has_image: false },
    { content: '$v_{out}(t) = 5\\sqrt{2}\\sin(\\omega_0 t)\\,\\text{V}$', is_correct: false, has_image: false },
    { content: '$v_{out}(t) = 20\\cos(2\\omega_0 t)\\,\\text{V}$', is_correct: false, has_image: false }
  ]);

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadKey, setUploadKey] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Save State
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Active input ref for toolbar insertion
  const [activeTarget, setActiveTarget] = useState<'context' | 'content' | 'explanation'>('content');
  const contextRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const explanationRef = useRef<HTMLTextAreaElement>(null);

  // Build current mediaMap for live preview
  const mediaMap = useMemo(() => {
    const map: Record<string, MediaAsset> = {};
    mediaAssets.forEach((asset) => {
      map[asset.media_key] = asset;
    });
    return map;
  }, [mediaAssets]);

  // Live regex extraction to show admin what keys are detected
  const detectedKeys = useMemo(() => {
    const keys: string[] = [];
    const regex = /<!--\s*media:([\w-]+)\s*-->/g;
    const combined = `${contextText}\n${content}`;
    let m;
    while ((m = regex.exec(combined)) !== null) {
      if (m[1] && !keys.includes(m[1])) keys.push(m[1]);
    }
    return keys;
  }, [contextText, content]);

  // Quick insert snippet into the active textarea
  const insertSnippet = (snippet: string) => {
    let ref = contentRef;
    let setter = setContent;
    let val = content;

    if (activeTarget === 'context') {
      ref = contextRef;
      setter = setContextText;
      val = contextText;
    } else if (activeTarget === 'explanation') {
      ref = explanationRef;
      setter = setExplanation;
      val = explanation;
    }

    const textarea = ref.current;
    if (!textarea) {
      setter((prev) => prev + snippet);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextText = val.substring(0, start) + snippet + val.substring(end);
    setter(nextText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  // Handle Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadSuccessMsg('');
      const uploaded = await uploadMediaFile(file, {
        media_key: uploadKey || undefined,
        alt_text: uploadAlt || undefined,
        caption: uploadCaption || undefined
      });

      onRefreshMedia();
      const tag = `<!-- media:${uploaded.media_key} -->`;
      insertSnippet(`\n${tag}\n`);
      setUploadSuccessMsg(`Đã tải lên: ${uploaded.media_key}`);
      setUploadKey('');
      setUploadAlt('');
      setUploadCaption('');
    } catch (err: any) {
      alert(`Upload thất bại: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Option management
  const addOption = () => {
    setOptions((prev) => [...prev, { content: '', is_correct: false, has_image: false }]);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) {
      alert('Một câu hỏi phải có tối thiểu 2 lựa chọn.');
      return;
    }
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateOptionContent = (idx: number, text: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], content: text };
      return next;
    });
  };

  const setCorrectOption = (idx: number) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({
        ...opt,
        is_correct: i === idx
      }))
    );
  };

  // Save Question (Triggers regex parser and atomic transaction)
  const handleSaveQuestion = async () => {
    if (!content.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi.');
      return;
    }
    if (options.length < 2) {
      alert('Vui lòng cung cấp ít nhất 2 đáp án.');
      return;
    }
    const hasCorrect = options.some((o) => o.is_correct);
    if (!hasCorrect) {
      alert('Vui lòng đánh dấu ít nhất một đáp án đúng.');
      return;
    }

    try {
      setSaving(true);
      setSaveStatus(null);

      const payload: CreateQuestionPayload = {
        topic_id: Number(topicId),
        difficulty_level: Number(difficulty),
        question_type: questionType,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        context_text: contextText.trim() || null,
        content: content.trim(),
        explanation: explanation.trim() || null,
        options: options.map((opt, idx) => ({
          content: opt.content,
          is_correct: opt.is_correct,
          has_image: opt.has_image,
          image_url: opt.image_url || null,
          order_index: idx + 1
        }))
      };

      await createQuestion(payload);
      setSaveStatus({
        success: true,
        message: 'Câu hỏi đã được tạo thành công! Media Regex Parser đã tự động xử lý.'
      });
      onQuestionCreated();
    } catch (err: any) {
      setSaveStatus({
        success: false,
        message: err.message || 'Lỗi lưu câu hỏi'
      });
    } finally {
      setSaving(false);
    }
  };

  // Templates loader
  const loadTemplate = (type: 'rlc' | 'opamp' | 'logic') => {
    if (type === 'rlc') {
      setContextText(`Cho mạch điện xoay chiều RLC nối tiếp có sơ đồ:\n\n<!-- media:fig_circuit_001 -->\n\nCác thông số: $R = 100\\,\\Omega$, $L = 0.5\\,\\text{H}$, $C = 20\\,\\mu\\text{F}$.`);
      setContent(`Tính hệ số công suất $\\cos\\varphi$ của mạch tại tần số góc $\\omega = 100\\pi\\,\\text{rad/s}$?`);
      setExplanation(`Hệ số công suất được xác định theo công thức: $$\\cos\\varphi = \\frac{R}{Z} = \\frac{R}{\\sqrt{R^2 + (Z_L - Z_C)^2}}$$`);
      setOptions([
        { content: '$\\cos\\varphi = 0.85$', is_correct: true, has_image: false },
        { content: '$\\cos\\varphi = 0.50$', is_correct: false, has_image: false },
        { content: '$\\cos\\varphi = 1.00$', is_correct: false, has_image: false },
        { content: '$\\cos\\varphi = 0.707$', is_correct: false, has_image: false }
      ]);
    } else if (type === 'opamp') {
      setContextText(`Mạch khuếch đại thuật toán Op-Amp không đảo với sơ đồ cấu hình:\n\n<!-- media:fig_opamp_002 -->`);
      setContent(`Xác định điện áp ngõ ra $V_{out}$ khi điện trở $R_1 = 5\\,\\text{k}\\Omega$, $R_f = 45\\,\\text{k}\\Omega$ và $V_{in} = 0.2\\,\\text{V}$?`);
      setExplanation(`Độ lợi điện áp mạch không đảo: $$A_v = 1 + \\frac{R_f}{R_1} = 1 + 9 = 10$$ $$V_{out} = 10 \\times 0.2\\,\\text{V} = 2.0\\,\\text{V}$$`);
      setOptions([
        { content: '$V_{out} = 2.0\\,\\text{V}$', is_correct: true, has_image: false },
        { content: '$V_{out} = -1.8\\,\\text{V}$', is_correct: false, has_image: false },
        { content: '$V_{out} = 1.8\\,\\text{V}$', is_correct: false, has_image: false },
        { content: '$V_{out} = 0.2\\,\\text{V}$', is_correct: false, has_image: false }
      ]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Studio Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white">Studio Soạn Thảo &amp; Quản Lý Câu Hỏi Kỹ Thuật</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
              Split-Screen Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hỗ trợ công thức toán KaTeX ($inline$ và $$block$$), cú pháp Markdown, và thẻ media tự động <code className="text-cyan-400">&lt;!-- media:KEY --&gt;</code>.
          </p>
        </div>

        {/* Quick Templates */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">Mẫu có sẵn:</span>
          <button
            onClick={() => loadTemplate('rlc')}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 transition"
          >
            Mạch RLC
          </button>
          <button
            onClick={() => loadTemplate('opamp')}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 transition"
          >
            Op-Amp
          </button>
          <button
            onClick={handleSaveQuestion}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Lưu Câu Hỏi</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-medium ${
            saveStatus.success
              ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-200'
              : 'bg-rose-950/60 border-rose-600/60 text-rose-200'
          }`}
        >
          {saveStatus.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* ==================================================
          SPLIT-SCREEN LAYOUT: LEFT (INPUT) & RIGHT (PREVIEW)
      ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (6 COLS): FORM & TEXTAREAS */}
        <div className="lg:col-span-6 space-y-5">
          {/* Metadata Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Phân Loại &amp; Độ Khó</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Chủ Đề (Topic):</label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{'L' + t.level}] {t.name} ({t.path})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Độ Khó (Difficulty):</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                >
                  <option value="1">Level 1 - Cơ bản / Dễ</option>
                  <option value="2">Level 2 - Tiêu chuẩn / Trung bình</option>
                  <option value="3">Level 3 - Nâng cao / Khó</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                Thẻ Phân Loại (Tags, cách nhau bởi dấu phẩy):
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="RLC, Op-Amp, Kỹ thuật số"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* TOOLBARS FOR QUICK FORMULAS & MEDIA TAGS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Thanh Chèn Nhanh Công Thức KaTeX &amp; Media</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <span>Chèn vào:</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 uppercase font-bold">
                  {activeTarget}
                </span>
              </div>
            </div>

            {/* LaTeX Formula Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '$V_{in}$', snippet: '$V_{in}$' },
                { label: '$V_{out}$', snippet: '$V_{out}$' },
                { label: '$Z = \\sqrt{R^2 + X_L^2}$', snippet: '$$Z = \\sqrt{R^2 + (\\omega L - \\frac{1}{\\omega C})^2}$$' },
                { label: '$f_0 = \\frac{1}{2\\pi\\sqrt{LC}}$', snippet: '$$f_0 = \\frac{1}{2\\pi\\sqrt{LC}}$$' },
                { label: '$\\frac{a}{b}$', snippet: '$\\frac{a}{b}$' },
                { label: '$\\beta$', snippet: '$\\beta$' },
                { label: '$\\omega$', snippet: '$\\omega$' },
                { label: '$\\Omega$', snippet: '$\\Omega$' },
                { label: '$\\mu\\text{F}$', snippet: '$\\mu\\text{F}$' },
                { label: '$\\text{k}\\Omega$', snippet: '$\\text{k}\\Omega$' },
                { label: '$\\int_0^\\infty$', snippet: '$$\\int_0^\\infty f(t) dt$$' },
                { label: 'Ma trận', snippet: '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$' }
              ].map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => insertSnippet(item.snippet)}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 hover:text-cyan-300 text-slate-300 font-mono text-xs transition"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Media Snippets & Uploader */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Chèn Media có sẵn:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      insertSnippet(`\n<!-- media:${e.target.value} -->\n`);
                      e.target.value = '';
                    }
                  }}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="">Chọn thẻ ảnh...</option>
                  {mediaAssets.map((m) => (
                    <option key={m.media_key} value={m.media_key}>
                      {m.media_key} ({m.alt_text || 'Asset'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload New Image Button */}
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 rounded-lg text-xs font-semibold cursor-pointer transition border border-slate-700">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Đang tải lên...' : 'Tải Lên Ảnh Mới'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {uploadSuccessMsg && (
              <p className="text-[11px] font-mono text-emerald-400">{uploadSuccessMsg}</p>
            )}
          </div>

          {/* CONTEXT TEXT TEXTAREA */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
                1. Bối Cảnh / Đề Bài Chung (Context Text - Tuỳ chọn):
              </label>
              <span className="text-[10px] font-mono text-cyan-400">
                {contextText.includes('<!-- media:') ? '✓ Chứa Media' : ''}
              </span>
            </div>
            <textarea
              ref={contextRef}
              rows={4}
              value={contextText}
              onFocus={() => setActiveTarget('context')}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Nhập phần dẫn truyện, bảng số liệu, hoặc chèn <!-- media:KEY -->"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none leading-relaxed transition"
            />
          </div>

          {/* CONTENT TEXTAREA */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
                2. Nội Dung Câu Hỏi (Content - Bắt buộc):
              </label>
              <span className="text-[10px] font-mono text-cyan-400">
                {content.includes('<!-- media:') ? '✓ Chứa Media' : ''}
              </span>
            </div>
            <textarea
              ref={contentRef}
              rows={4}
              value={content}
              onFocus={() => setActiveTarget('content')}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung câu hỏi chính (hỗ trợ LaTeX $...$ và $$...$$)"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none leading-relaxed transition"
            />
          </div>

          {/* OPTIONS BUILDER */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
                3. Các Phương Án Lựa Chọn (Options):
              </label>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Lựa Chọn</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border transition ${
                    opt.is_correct
                      ? 'border-emerald-500/60 bg-emerald-950/20'
                      : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  {/* Correct Selector (Radio) */}
                  <button
                    type="button"
                    onClick={() => setCorrectOption(idx)}
                    title={opt.is_correct ? 'Đáp án đúng' : 'Đánh dấu là đáp án đúng'}
                    className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold font-mono transition ${
                      opt.is_correct
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm shadow-emerald-500/50'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </button>

                  {/* Option Content Input */}
                  <input
                    type="text"
                    value={opt.content}
                    onChange={(e) => updateOptionContent(idx, e.target.value)}
                    placeholder={`Nội dung lựa chọn ${String.fromCharCode(65 + idx)} (hỗ trợ LaTeX $...)`}
                    className="flex-1 bg-transparent border-0 text-xs text-slate-200 font-mono focus:outline-none"
                  />

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    title="Xóa lựa chọn"
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* EXPLANATION TEXTAREA */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
              4. Lời Giải &amp; Hướng Dẫn Chi Tiết (Explanation):
            </label>
            <textarea
              ref={explanationRef}
              rows={4}
              value={explanation}
              onFocus={() => setActiveTarget('explanation')}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Nhập lời giải, công thức trọng tâm hoặc hướng dẫn giải"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none leading-relaxed transition"
            />
          </div>
        </div>

        {/* RIGHT COLUMN (6 COLS): REAL-TIME RENDERED PREVIEW */}
        <div className="lg:col-span-6 space-y-5 sticky top-24">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
            {/* Preview Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Xem Trước Trực Tiếp (Live Preview)</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                <span>Thẻ media phát hiện:</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {detectedKeys.length > 0 ? detectedKeys.join(', ') : '0'}
                </span>
              </div>
            </div>

            {/* Context Card Preview */}
            {contextText && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
                <div className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                  Bối Cảnh / Sơ Đồ Kỹ Thuật
                </div>
                <MathMarkdownRenderer content={contextText} mediaMap={mediaMap} />
              </div>
            )}

            {/* Content Preview */}
            <div className="text-base text-slate-100 font-medium">
              <MathMarkdownRenderer content={content} mediaMap={mediaMap} />
            </div>

            {/* Options Preview */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Các Phương Án:
              </div>
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm transition ${
                    opt.is_correct
                      ? 'border-emerald-500/70 bg-emerald-950/30 text-emerald-200'
                      : 'border-slate-800 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg border text-xs font-mono font-bold ${
                      opt.is_correct
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-1 pt-0.5">
                    <MathMarkdownRenderer content={opt.content} mediaMap={mediaMap} />
                  </div>
                  {opt.is_correct && (
                    <span className="text-[11px] font-mono font-semibold text-emerald-400 self-center">
                      (Đáp án đúng)
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Explanation Preview */}
            {explanation && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-slate-300 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Lời Giải Chi Tiết</span>
                </div>
                <MathMarkdownRenderer content={explanation} mediaMap={mediaMap} />
              </div>
            )}

            {/* Media Regex Inspector Alert */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="text-slate-300 font-semibold">Tự Động Nhận Diện Bởi Media Parser:</div>
              <div>has_context_image: <span className="text-cyan-400">{contextText.includes('<!-- media:') ? '1 (TRUE)' : '0'}</span></div>
              <div>has_media: <span className="text-cyan-400">{content.includes('<!-- media:') ? '1 (TRUE)' : '0'}</span></div>
              <div>media_keys: <span className="text-cyan-400">{JSON.stringify(detectedKeys)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

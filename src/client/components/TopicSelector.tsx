import React, { useState, useEffect, useMemo } from 'react';
import { Layers, ChevronRight, Check } from 'lucide-react';
import { Topic } from '../types/index.js';

interface TopicSelectorProps {
  topics: Topic[];
  selectedTopicId: number | null;
  onSelectTopic: (topicId: number | null) => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  selectedTopicId,
  onSelectTopic
}) => {
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [subtopicId, setSubtopicId] = useState<number | null>(null);

  // Filter topics by level
  const subjects = useMemo(() => topics.filter((t) => t.level === 1), [topics]);

  const chapters = useMemo(() => {
    if (!subjectId) return [];
    return topics.filter((t) => t.level === 2 && t.parent_id === subjectId);
  }, [topics, subjectId]);

  const subtopics = useMemo(() => {
    if (!chapterId) return [];
    return topics.filter((t) => t.level === 3 && t.parent_id === chapterId);
  }, [topics, chapterId]);

  // Synchronize with external selectedTopicId
  useEffect(() => {
    if (!selectedTopicId) {
      setSubjectId(null);
      setChapterId(null);
      setSubtopicId(null);
      return;
    }

    const current = topics.find((t) => t.id === selectedTopicId);
    if (!current) return;

    if (current.level === 1) {
      setSubjectId(current.id);
      setChapterId(null);
      setSubtopicId(null);
    } else if (current.level === 2) {
      setChapterId(current.id);
      setSubjectId(current.parent_id);
      setSubtopicId(null);
    } else if (current.level === 3) {
      setSubtopicId(current.id);
      const parentChapter = topics.find((t) => t.id === current.parent_id);
      if (parentChapter) {
        setChapterId(parentChapter.id);
        setSubjectId(parentChapter.parent_id);
      }
    }
  }, [selectedTopicId, topics]);

  const handleSubjectChange = (val: string) => {
    const id = val ? parseInt(val, 10) : null;
    setSubjectId(id);
    setChapterId(null);
    setSubtopicId(null);
    onSelectTopic(id);
  };

  const handleChapterChange = (val: string) => {
    const id = val ? parseInt(val, 10) : null;
    setChapterId(id);
    setSubtopicId(null);
    onSelectTopic(id || subjectId);
  };

  const handleSubtopicChange = (val: string) => {
    const id = val ? parseInt(val, 10) : null;
    setSubtopicId(id);
    onSelectTopic(id || chapterId || subjectId);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 text-slate-400 font-medium px-2 py-1 bg-slate-900/60 rounded-lg border border-slate-800">
        <Layers className="w-3.5 h-3.5 text-cyan-400" />
        <span>Phân Loại 3 Cấp:</span>
      </div>

      {/* Level 1: Subject */}
      <select
        value={subjectId || ''}
        onChange={(e) => handleSubjectChange(e.target.value)}
        className="bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none transition cursor-pointer text-xs font-medium"
      >
        <option value="">Tất cả môn học (Cấp 1)</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            📚 {s.name}
          </option>
        ))}
      </select>

      {/* Level 2: Chapter */}
      {chapters.length > 0 && (
        <>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <select
            value={chapterId || ''}
            onChange={(e) => handleChapterChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none transition cursor-pointer text-xs font-medium"
          >
            <option value="">Tất cả chương (Cấp 2)</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                📖 {c.name}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Level 3: Subtopic */}
      {subtopics.length > 0 && (
        <>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <select
            value={subtopicId || ''}
            onChange={(e) => handleSubtopicChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none transition cursor-pointer text-xs font-medium"
          >
            <option value="">Tất cả chủ đề con (Cấp 3)</option>
            {subtopics.map((st) => (
              <option key={st.id} value={st.id}>
                ⚡ {st.name}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

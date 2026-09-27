import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, Question, Topic, MediaAsset, LightboxState } from './types/index.js';
import { Header } from './components/Header.js';
import { LightboxModal } from './components/LightboxModal.js';
import { QuizPage } from './pages/QuizPage.js';
import { AdminEditor } from './pages/AdminEditor.js';
import { DbInspector } from './pages/DbInspector.js';
import { fetchQuestions, fetchTopics, fetchMediaAssets } from './utils/api.js';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('quiz');

  // Core Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);

  // Filters
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Global Lightbox State
  const [lightboxState, setLightboxState] = useState<LightboxState>({
    isOpen: false,
    url: '',
    altText: '',
    caption: ''
  });

  // Load Topics & Media Assets
  const loadInitialData = useCallback(async () => {
    try {
      const [topicsData, mediaData] = await Promise.all([
        fetchTopics(),
        fetchMediaAssets()
      ]);
      setTopics(topicsData);
      setMediaAssets(mediaData);
    } catch (err) {
      console.error('Failed to load topics or media:', err);
    }
  }, []);

  // Load Questions filtered by topic and difficulty
  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchQuestions(
        selectedTopicId || undefined,
        selectedDifficulty || undefined
      );
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTopicId, selectedDifficulty]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Global Lightbox Click Handler for all .media-trigger elements
  useEffect(() => {
    const handleTriggerClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('.media-trigger') as HTMLImageElement | null;
      if (target) {
        e.preventDefault();
        const url = target.getAttribute('data-url') || target.src;
        const caption = target.getAttribute('data-caption') || '';
        const altText = target.alt || '';
        setLightboxState({
          isOpen: true,
          url,
          altText,
          caption
        });
      }
    };

    document.body.addEventListener('click', handleTriggerClick);
    return () => document.body.removeEventListener('click', handleTriggerClick);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        questionCount={questions.length}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'quiz' && (
          <QuizPage
            questions={questions}
            topics={topics}
            selectedTopicId={selectedTopicId}
            onSelectTopic={setSelectedTopicId}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            loading={loading}
            onRefresh={loadQuestions}
          />
        )}

        {activeTab === 'admin' && (
          <AdminEditor
            topics={topics}
            mediaAssets={mediaAssets}
            onQuestionCreated={() => {
              loadQuestions();
              setActiveTab('quiz');
            }}
            onRefreshMedia={async () => {
              const assets = await fetchMediaAssets();
              setMediaAssets(assets);
            }}
          />
        )}

        {activeTab === 'db' && (
          <DbInspector
            onDbUpdated={() => {
              loadInitialData();
              loadQuestions();
            }}
          />
        )}
      </main>

      {/* Global Lightbox Modal for Image Zoom */}
      <LightboxModal
        state={lightboxState}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default App;

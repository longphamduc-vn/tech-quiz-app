import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, Question, Topic, MediaAsset, LightboxState, User, CreateUserPayload } from './types/index.js';
import { Header } from './components/Header.js';
import { LightboxModal } from './components/LightboxModal.js';
import { UserModal } from './components/UserModal.js';
import { QuizPage } from './pages/QuizPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { AdminEditor } from './pages/AdminEditor.js';
import { DbInspector } from './pages/DbInspector.js';
import {
  fetchQuestions,
  fetchTopics,
  fetchMediaAssets,
  fetchUsers,
  createUser,
  deleteUser,
  fetchQuizHistory
} from './utils/api.js';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('quiz');

  // Core Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);

  // User Profile State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState<number>(0);

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

  // Load Users
  const loadUsersData = useCallback(async () => {
    try {
      const userList = await fetchUsers();
      setUsers(userList);
      const savedId = localStorage.getItem('tech_quiz_active_user_id');
      if (savedId) {
        const found = userList.find((u) => u.id === Number(savedId));
        if (found) {
          setCurrentUser(found);
          return;
        }
      }
      if (userList.length > 0) {
        setCurrentUser(userList[0]);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }, []);

  // Load History count
  const refreshHistoryCount = useCallback(async () => {
    try {
      const list = await fetchQuizHistory();
      setHistoryCount(list.length);
    } catch {
      // ignore
    }
  }, []);

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
    loadUsersData();
    loadInitialData();
  }, [loadUsersData, loadInitialData]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    refreshHistoryCount();
  }, [refreshHistoryCount, activeTab]);

  // User Actions
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('tech_quiz_active_user_id', String(user.id));
    setIsUserModalOpen(false);
  };

  const handleCreateUser = async (payload: CreateUserPayload) => {
    const newUser = await createUser(payload);
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    localStorage.setItem('tech_quiz_active_user_id', String(newUser.id));
    return newUser;
  };

  const handleDeleteUser = async (userId: number) => {
    await deleteUser(userId);
    const remaining = users.filter((u) => u.id !== userId);
    setUsers(remaining);
    if (currentUser?.id === userId && remaining.length > 0) {
      setCurrentUser(remaining[0]);
      localStorage.setItem('tech_quiz_active_user_id', String(remaining[0].id));
    }
  };

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
        currentUser={currentUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        historyCount={historyCount}
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
            currentUser={currentUser}
            onNavigateHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            currentUser={currentUser}
            users={users}
            onOpenUserModal={() => setIsUserModalOpen(true)}
            onNavigateToQuiz={() => setActiveTab('quiz')}
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

      {/* User Management & Switcher Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onCreateUser={handleCreateUser}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}

export default App;

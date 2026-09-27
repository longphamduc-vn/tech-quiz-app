import { createApp } from './src/server/app.js';
import { questionService } from './src/server/services/question.service.js';
import { mediaRepository } from './src/server/repositories/media.repository.js';
import { topicService } from './src/server/services/topic.service.js';

async function runTests() {
  console.log('--- Testing Backend Services & Regex Parser ---');

  // Test 1: Regex Extraction
  const sampleContext = 'Mạch điện được cho bởi sơ đồ <!-- media:fig_test_01 --> bên dưới.';
  const sampleContent = 'Tính dòng điện qua tải <!-- media:fig_test_02 --> và <!-- media:fig_test_01 -->?';

  const contextKeys = questionService.extractMediaKeys(sampleContext);
  const contentKeys = questionService.extractMediaKeys(sampleContent);

  console.log('Context Keys:', contextKeys);
  console.log('Content Keys:', contentKeys);
  if (!contextKeys.includes('fig_test_01')) throw new Error('Failed to extract fig_test_01');
  if (!contentKeys.includes('fig_test_02')) throw new Error('Failed to extract fig_test_02');

  // Register test media
  mediaRepository.create({
    media_key: 'fig_test_01',
    url: '/media/fig_test_01.png',
    alt_text: 'Test Asset 1',
    caption: 'Test Caption 1'
  });

  // Test 2: Create Question with QuestionService
  const topics = topicService.getAllTopics();
  if (topics.length === 0) throw new Error('No topics found');

  const created = questionService.createQuestion({
    topic_id: topics[0].id,
    difficulty_level: 2,
    question_type: 'SINGLE_CHOICE',
    tags: ['AutomatedTest', 'Electronics'],
    context_text: sampleContext,
    content: sampleContent,
    explanation: 'Giải thích chi tiết cho test question',
    options: [
      { content: 'Đáp án A: $10\\,\\text{mA}$', is_correct: true },
      { content: 'Đáp án B: $20\\,\\text{mA}$', is_correct: false }
    ]
  });

  console.log('Created Question ID:', created.id);
  console.log('has_context_image:', created.has_context_image);
  console.log('has_media:', created.has_media);
  console.log('media_keys:', created.media_keys);
  console.log('media_map:', Object.keys(created.media_map));

  if (created.has_context_image !== 1) throw new Error('has_context_image must be 1');
  if (created.has_media !== 1) throw new Error('has_media must be 1');
  if (!created.media_keys.includes('fig_test_01')) throw new Error('media_keys must include fig_test_01');
  if (!created.media_map['fig_test_01']) throw new Error('media_map must contain fig_test_01');

  // Test 3: Hierarchy Tree
  const tree = topicService.getTopicTree();
  console.log('Topic Tree Roots count:', tree.length);
  if (tree.length === 0) throw new Error('Topic tree is empty');

  // Test 4: Fetch Filtered Questions
  const filtered = questionService.getQuestions(tree[0].id);
  console.log(`Questions under topic #${tree[0].id}:`, filtered.length);

  // Clean up test question
  questionService.deleteQuestion(created.id);
  console.log('--- All Backend Logic Tests Passed Successfully! ---');
}

runTests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});

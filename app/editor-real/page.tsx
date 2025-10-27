'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaMagic, FaRobot, FaBlog, FaCompressAlt, FaSearch, FaShareAlt, FaImage, FaHeading, FaLanguage, FaTags, FaBold, FaItalic, FaUnderline, FaListOl, FaListUl, FaLink, FaUndo, FaRedo, FaSlidersH, FaSave, FaRocket, FaClock, FaList, FaChartBar, FaCheckCircle, FaTimes, FaSpinner, FaNewspaper, FaEye, FaFileAlt, FaPlus, FaCheck, FaCopy, FaExternalLinkAlt, FaInfoCircle, FaFolder, FaHashtag, FaKey, FaLightbulb, FaCheckSquare, FaAlignLeft, FaGlobe, FaFileUpload, FaCalendar, FaCog, FaPaperPlane, FaCommentDots } from 'react-icons/fa';
import { FaGoogle, FaBrain, FaFaceSmile, FaFire, FaWind, FaSearchengin } from 'react-icons/fa6';

// ==================== TYPES ====================
interface AIModel {
  value: string;
  name: string;
  provider: string;
}

interface NewsItem {
  title: string;
  source: string;
  summary?: string;
  description?: string;
  link?: string;
  published?: string;
  published_at?: string;
  content?: string;
  summary_original?: string;
}

interface BlogPost {
  title: string;
  content: string;
  source: string;
  model: string;
  newsLink?: string;
  loading?: boolean;
  error?: boolean;
  keywords?: string[];
  meta_description?: string;
}

interface ModelResults {
  [key: string]: BlogPost;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  message: string;
}

interface BlogAccount {
  id: string;
  name: string;
  platform: string;
  config?: any;
}

const EditorRealPage: React.FC = () => {
  // ==================== STATE ====================
  const [editorContent, setEditorContent] = useState<string>('<h2>제목을 입력하세요</h2><p>여기에 내용을 작성하세요. AI가 실시간으로 도와드립니다.</p>');
  const [selectedModels, setSelectedModels] = useState<string[]>(['llama', 'qwen', 'gemma', 'mistral', 'gemini-flash', 'gemini-pro', 'deepseek-v3', 'kimi', 'glm', 'gpt-oss', 'gemini-2.5-flash', 'gemini-2.5-exp']);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [topicInput, setTopicInput] = useState<string>('');
  const [newsSource, setNewsSource] = useState<string>('');
  const [topicCategory, setTopicCategory] = useState<string>('');
  const [newsPreview, setNewsPreview] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [charCount, setCharCount] = useState<number>(0);
  const [wordCount, setWordCount] = useState<number>(0);
  const [blogAccounts, setBlogAccounts] = useState<BlogAccount[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<string>('');

  // Modal States
  const [showToneManager, setShowToneManager] = useState<boolean>(false);
  const [toneResult, setToneResult] = useState<string>('');
  const [showSummarizeModal, setShowSummarizeModal] = useState<boolean>(false);
  const [summaryTab, setSummaryTab] = useState<string>('youtube');
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [imageTab, setImageTab] = useState<string>('search');
  const [showTagModal, setShowTagModal] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFloatingModal, setShowFloatingModal] = useState<boolean>(false);
  const [floatingResults, setFloatingResults] = useState<ModelResults>({});
  const [activeFloatingTab, setActiveFloatingTab] = useState<string>('');

  // Chat Assistant
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [showChat, setShowChat] = useState<boolean>(true);

  const editorRef = useRef<HTMLDivElement>(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadAIModels();
    loadBlogAccounts();
    initializeChatHistory();
  }, []);

  useEffect(() => {
    updateWordCount();
  }, [editorContent]);

  // ==================== FUNCTIONS ====================
  const loadAIModels = async () => {
    try {
      const defaultModels: AIModel[] = [
        { value: 'llama', name: 'DeepSeek Coder V2 16B', provider: 'ollama' },
        { value: 'qwen', name: 'Qwen3 Coder 30B', provider: 'ollama' },
        { value: 'gemma', name: 'Qwen3 Coder 480B', provider: 'ollama' },
        { value: 'mistral', name: 'GPT-OSS 120B', provider: 'ollama' },
        { value: 'deepseek-v3', name: 'DeepSeek V3.1', provider: 'ollama' },
        { value: 'kimi', name: 'Kimi K2-0905 1T', provider: 'ollama' },
        { value: 'glm', name: 'GLM-4.6 357B', provider: 'ollama' },
        { value: 'gpt-oss', name: 'GPT-OSS 120B', provider: 'ollama' },
        { value: 'gemini-flash', name: 'Gemini 1.5 Flash', provider: 'google' },
        { value: 'gemini-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
        { value: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
        { value: 'gemini-2.5-exp', name: 'Gemini 2.5 Pro', provider: 'google' }
      ];
      setAiModels(defaultModels);
    } catch (error) {
      console.error('AI 모델 로딩 오류:', error);
    }
  };

  const loadBlogAccounts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/blogs');
      if (response.ok) {
        const blogs = await response.json();
        setBlogAccounts(blogs);
      }
    } catch (error) {
      console.log('블로그 계정 불러오기 실패:', error);
    }
  };

  const initializeChatHistory = () => {
    setChatMessages([
      {
        sender: 'ai',
        message: '안녕하세요! 작성 중인 콘텐츠를 실시간으로 분석하며 도움을 드릴게요. 질문을 입력하거나 빠른 액션 버튼을 사용해보세요.'
      }
    ]);
  };

  const updateWordCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      setCharCount(text.length);
      setWordCount(text.trim().split(/\s+/).filter(w => w).length);
    }
  };

  const handleModelSelection = (modelValue: string) => {
    setSelectedModels(prev =>
      prev.includes(modelValue)
        ? prev.filter(m => m !== modelValue)
        : [...prev, modelValue]
    );
  };

  const toggleAllModels = () => {
    if (selectedModels.length === aiModels.length) {
      setSelectedModels([]);
    } else {
      setSelectedModels(aiModels.map(m => m.value));
    }
  };

  const fetchNewsPreview = async () => {
    if (!newsSource) return;

    try {
      const requestBody: any = {
        source: newsSource,
        limit: 10
      };

      const response = await fetch('http://localhost:5001/api/news/latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error('뉴스를 가져오는데 실패했습니다');

      const data = await response.json();
      setNewsPreview(data.items || []);
    } catch (error) {
      console.error('뉴스 미리보기 오류:', error);
      alert('뉴스를 가져오는 중 오류가 발생했습니다.');
    }
  };

  const generateFromTopic = async () => {
    if (!topicInput.trim()) {
      alert('주제를 입력해주세요');
      return;
    }

    if (selectedModels.length === 0) {
      alert('최소 하나의 AI 모델을 선택해주세요');
      return;
    }

    setIsGenerating(true);

    const topicAsNews: NewsItem = {
      title: topicInput,
      source: '사용자 입력',
      summary: `"${topicInput}"에 대한 블로그 포스트를 작성합니다.`,
      link: undefined
    };

    setSelectedNews(topicAsNews);

    try {
      await generateFromNews(topicAsNews);
    } catch (error) {
      console.error('주제 생성 오류:', error);
      alert(`오류가 발생했습니다: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFromNews = async (news: NewsItem) => {
    const newsPrompt = `다음 뉴스 기사를 바탕으로 SEO 최적화된 블로그 포스트를 작성해주세요.

뉴스 제목: ${news.title}
출처: ${news.source}
링크: ${news.link || '없음'}
요약: ${news.summary || news.description || ''}

다음 형식으로 작성해주세요:

## 제목
[클릭을 유도하는 매력적인 한글 제목, 50-60자]

## 본문
[1000-1500자의 상세한 블로그 포스트]
- 도입부: 뉴스의 핵심을 흥미롭게 소개
- 본문: 뉴스 내용을 상세히 설명하고 분석
- 의견: 전문가 관점에서의 인사이트 제공
- 결론: 독자에게 생각할 거리 제공

## 키워드
[SEO를 위한 5-7개의 핵심 키워드, 콤마로 구분]

## 메타 설명
[150-160자의 메타 디스크립션]

당신은 전문 블로그 작가이자 SEO 전문가입니다. 한국어로 고품질의 블로그 포스트를 작성합니다.`;

    const results: ModelResults = {};

    // Initialize loading states
    for (const model of selectedModels) {
      results[model] = {
        title: news.title,
        content: '<div class="flex items-center gap-3 p-10 justify-center"><i class="fas fa-spinner fa-spin text-2xl text-purple-600"></i><span class="text-base text-gray-600">AI가 블로그 포스트를 생성하고 있습니다...</span></div>',
        source: news.source,
        model: model,
        newsLink: news.link,
        loading: true
      };
    }

    setFloatingResults(results);
    setShowFloatingModal(true);
    setActiveFloatingTab(selectedModels[0] || '');

    // Generate content for each model
    const promises = selectedModels.map(async (model) => {
      try {
        const response = await fetch('http://localhost:5001/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: newsPrompt,
            model: model
          })
        });

        const data = await response.json();
        const content = data.generated_text || data.content || '';

        results[model] = {
          title: news.title,
          content: content,
          source: news.source,
          model: model,
          newsLink: news.link,
          loading: false
        };

        setFloatingResults({ ...results });
      } catch (error) {
        console.error(`${model} 생성 오류:`, error);
        results[model] = {
          title: news.title,
          content: `<div class="text-red-500 p-5 text-center"><i class="fas fa-exclamation-circle"></i> 생성 실패: ${error}</div>`,
          source: news.source,
          model: model,
          newsLink: news.link,
          loading: false,
          error: true
        };
        setFloatingResults({ ...results });
      }
    });

    await Promise.all(promises);
  };

  const formatText = (command: string) => {
    document.execCommand(command, false);
  };

  const insertLink = () => {
    const url = prompt('링크 URL을 입력하세요:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  const insertImageToEditor = () => {
    const url = prompt('이미지 URL을 입력하세요:');
    if (url) {
      document.execCommand('insertImage', false, url);
    }
  };

  const saveContent = () => {
    localStorage.setItem('smartEditorContent', editorContent);
    showNotification('저장되었습니다!', 'success');
  };

  const previewContent = () => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
        <head>
          <title>미리보기</title>
          <style>
            body {
              font-family: 'Pretendard', -apple-system, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>${editorContent}</body>
        </html>
      `);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', message: chatInput }]);
    const userMessage = chatInput;
    setChatInput('');

    try {
      const response = await fetch('http://localhost:5001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: editorRef.current?.innerText || ''
        })
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'ai', message: data.response }]);
    } catch (error) {
      console.error('AI 응답 오류:', error);
      setChatMessages(prev => [...prev, { sender: 'ai', message: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.' }]);
    }
  };

  const changeTone = async (tone: string) => {
    if (!editorRef.current?.innerText || editorRef.current.innerText.length < 20) {
      alert('톤을 변경하려면 최소 20자 이상의 내용이 필요합니다.');
      return;
    }

    setShowToneManager(true);
    setToneResult('AI가 톤을 변환 중입니다...');

    try {
      const response = await fetch('http://localhost:5001/api/ai/change-tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: editorRef.current.innerText,
          tone: tone
        })
      });

      const data = await response.json();
      setToneResult(data.changed_text || '');
    } catch (error) {
      console.error('톤 변환 오류:', error);
      setToneResult('톤 변환 중 오류가 발생했습니다.');
    }
  };

  const applyToneToEditor = () => {
    if (toneResult && editorRef.current) {
      editorRef.current.innerHTML = toneResult.replace(/\n/g, '<br>');
      setEditorContent(editorRef.current.innerHTML);
      setShowToneManager(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Simple notification implementation
    alert(message);
  };

  const applyContentToEditor = (model: string) => {
    const result = floatingResults[model];
    if (result && editorRef.current) {
      editorRef.current.innerHTML = `<h2>${result.title}</h2>${result.content}`;
      setEditorContent(editorRef.current.innerHTML);
      setShowFloatingModal(false);
      showNotification('에디터에 내용이 적용되었습니다!', 'success');
    }
  };

  const copyModelContent = (model: string) => {
    const result = floatingResults[model];
    if (result) {
      navigator.clipboard.writeText(`${result.title}\n\n${result.content}`);
      showNotification('클립보드에 복사되었습니다!', 'success');
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-white text-black p-5">
      {/* Header */}
      <div className="bg-white border-2 border-gray-200 rounded-[20px] p-5 mb-8 sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaMagic className="text-black" />
            AI 스마트 에디터 Pro
          </h1>
          <div className="flex gap-2">
            <button
              onClick={previewContent}
              className="px-5 py-2 bg-white border-2 border-black rounded-full font-medium hover:bg-black hover:text-white transition"
            >
              <FaEye className="inline mr-2" />
              미리보기
            </button>
            <a
              href="/posts"
              className="px-5 py-2 bg-white border-2 border-black rounded-full font-medium hover:bg-black hover:text-white transition"
            >
              <FaFileAlt className="inline mr-2" />
              내 글
            </a>
          </div>
        </div>
      </div>

      {/* AI Tools Compact Grid */}
      <div className="mb-5 p-4 bg-gray-100 rounded-xl border border-gray-300">
        <div className="flex gap-2 flex-wrap items-center">
          <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-black hover:text-white transition flex items-center gap-2">
            <FaBlog />
            블로그 작성
          </button>
          <button
            onClick={() => setShowSummarizeModal(true)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-black hover:text-white transition flex items-center gap-2"
          >
            <FaCompressAlt />
            요약
          </button>
          <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-black hover:text-white transition flex items-center gap-2">
            <FaSearch />
            SEO
          </button>
          <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-black hover:text-white transition flex items-center gap-2">
            <FaShareAlt />
            SNS 변환
          </button>
          <button
            onClick={() => setShowImageModal(true)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-black hover:text-white transition flex items-center gap-2"
          >
            <FaImage />
            이미지
          </button>
          <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-black hover:text-white transition flex items-center gap-2">
            <FaHeading />
            제목
          </button>
          <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-black hover:text-white transition flex items-center gap-2">
            <FaLanguage />
            번역
          </button>
          <button
            onClick={() => setShowTagModal(true)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-black hover:text-white transition flex items-center gap-2"
          >
            <FaTags />
            태그
          </button>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Main Content */}
        <div className="flex-1">
          {/* AI Generation Section */}
          <div className="bg-white border border-gray-200 rounded-[20px] p-6 mb-8 shadow-sm">
            <div className="mb-4">
              {/* Topic Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💡 주제로 블로그 포스트 생성
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="예: AI 기술의 미래, 블록체인의 활용 사례..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && generateFromTopic()}
                  />
                  <button
                    onClick={generateFromTopic}
                    disabled={isGenerating}
                    className="px-5 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <FaMagic />
                    생성
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative border-t border-gray-300 my-4">
                <span className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 bg-white px-3 text-gray-500 text-xs">또는</span>
              </div>

              {/* News Source Selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📰 최신 뉴스에서 블로그 포스트 자동 생성
                </label>

                {/* Category Selection */}
                <div className="mb-2">
                  <select
                    value={topicCategory}
                    onChange={(e) => setTopicCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">주제 카테고리 선택...</option>
                    <optgroup label="🤖 AI & 기술">
                      <option value="ai_general">AI 전반</option>
                      <option value="machine_learning">머신러닝 & 딥러닝</option>
                      <option value="chatgpt">ChatGPT & LLM</option>
                    </optgroup>
                  </select>
                </div>

                {/* News Source Selection */}
                <div className="flex gap-2">
                  <select
                    value={newsSource}
                    onChange={(e) => {
                      setNewsSource(e.target.value);
                      fetchNewsPreview();
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">뉴스 소스 선택...</option>
                    <optgroup label="🇰🇷 국내 뉴스">
                      <option value="naver_news">📰 네이버 뉴스 - 국내 종합</option>
                      <option value="naver_tech">💻 네이버 IT/과학</option>
                    </optgroup>
                    <optgroup label="🌍 해외 뉴스">
                      <option value="google_news">🔍 Google News - 글로벌</option>
                      <option value="hacker_news">🔥 Hacker News - 기술 트렌드</option>
                    </optgroup>
                  </select>
                  <button
                    onClick={() => selectedNews && generateFromNews(selectedNews)}
                    disabled={isGenerating || !selectedNews}
                    className="px-5 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <FaMagic />
                    자동 생성
                  </button>
                </div>

                {/* AI Model Selection */}
                <div className="mt-3 p-4 bg-gray-100 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaRobot />
                    사용할 AI 모델 선택 (멀티 선택 가능)
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={toggleAllModels}
                      className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-full text-xs font-medium hover:bg-black hover:text-white transition"
                    >
                      <FaCheckSquare className="inline mr-1" />
                      전체
                    </button>
                    {aiModels.map((model) => (
                      <label
                        key={model.value}
                        className={`px-3 py-2 border rounded-full text-xs cursor-pointer transition ${
                          selectedModels.includes(model.value)
                            ? 'bg-gray-100 border-gray-300'
                            : 'bg-white border-gray-300 hover:bg-black hover:text-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={model.value}
                          checked={selectedModels.includes(model.value)}
                          onChange={() => handleModelSelection(model.value)}
                          className="mr-1"
                        />
                        {model.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Editor Section */}
          <div className="bg-white border border-gray-200 rounded-[20px] mb-8 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b-2 border-black">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaFileAlt />
                텍스트 편집기
              </h2>
            </div>

            {/* Editor Toolbar */}
            <div className="p-3 bg-gray-100 border-b border-gray-200 flex gap-2 flex-wrap items-center">
              <button onClick={() => formatText('bold')} className="w-9 h-9 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition">
                <FaBold />
              </button>
              <button onClick={() => formatText('italic')} className="w-9 h-9 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition">
                <FaItalic />
              </button>
              <button onClick={() => formatText('underline')} className="w-9 h-9 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition">
                <FaUnderline />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <button onClick={() => formatText('insertOrderedList')} className="w-9 h-9 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition">
                <FaListOl />
              </button>
              <button onClick={() => formatText('insertUnorderedList')} className="w-9 h-9 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition">
                <FaListUl />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <button onClick={insertLink} className="w-9 h-9 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition">
                <FaLink />
              </button>
              <button onClick={insertImageToEditor} className="w-9 h-9 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition">
                <FaImage />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <button onClick={() => formatText('undo')} className="w-9 h-9 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition">
                <FaUndo />
              </button>
              <button onClick={() => formatText('redo')} className="w-9 h-9 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition">
                <FaRedo />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <button
                onClick={() => setShowToneManager(true)}
                className="px-3 py-2 bg-white border-2 border-black rounded-full flex items-center gap-2 hover:bg-black hover:text-white transition"
              >
                <FaSlidersH />
                톤매니저
              </button>
            </div>

            {/* Editor Content */}
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[400px] p-8 text-base leading-relaxed outline-none"
              dangerouslySetInnerHTML={{ __html: editorContent }}
              onInput={(e) => setEditorContent(e.currentTarget.innerHTML)}
            />

            {/* Editor Footer */}
            <div className="p-4 bg-gray-100 border-t-2 border-gray-200 flex justify-between items-center flex-wrap gap-3">
              <div className="text-sm text-gray-600 font-medium">
                글자 수: <span>{charCount}</span> | 단어 수: <span>{wordCount}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={saveContent}
                  className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm font-medium hover:bg-black hover:text-white transition flex items-center gap-2"
                >
                  <FaSave />
                  저장
                </button>
                <select
                  value={selectedBlog}
                  onChange={(e) => setSelectedBlog(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium bg-gray-100 hover:bg-black hover:text-white transition"
                >
                  <option value="">블로그 선택</option>
                  {blogAccounts.map((blog) => (
                    <option key={blog.id} value={blog.id}>
                      {blog.name} ({blog.platform})
                    </option>
                  ))}
                </select>
                <button className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm font-medium hover:bg-black hover:text-white transition flex items-center gap-2">
                  <FaRocket />
                  발행하기
                </button>
                <button className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm font-medium hover:bg-black hover:text-white transition flex items-center gap-2">
                  <FaClock />
                  예약 발행
                </button>
                <button className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm font-medium hover:bg-black hover:text-white transition flex items-center gap-2">
                  <FaList />
                  예약 목록
                </button>
                <button className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm font-medium hover:bg-black hover:text-white transition flex items-center gap-2">
                  <FaChartBar />
                  콘텐츠 분석
                </button>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-sm text-gray-600">자동 저장됨</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Assistant Sidebar */}
        {showChat && (
          <div className="w-80 bg-white border border-gray-200 rounded-[20px] shadow-sm h-fit sticky top-24">
            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-[20px] flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <FaRobot className="text-purple-600" />
                AI 어시스턴트
              </h3>
              <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-black">
                <FaTimes />
              </button>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-200">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="질문을 입력하세요..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={sendChatMessage}
                  className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <FaPaperPlane />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition">
                  확장
                </button>
                <button className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition">
                  요약
                </button>
                <button className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition">
                  개선
                </button>
                <button className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition">
                  SEO
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Tone Manager Modal */}
      {showToneManager && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[2000]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold">톤 매니저</h2>
              <button
                onClick={() => setShowToneManager(false)}
                className="text-2xl text-gray-500 hover:text-black"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex gap-2 mb-5 flex-wrap">
              <button
                onClick={() => changeTone('professional')}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-full hover:bg-black hover:text-white transition"
              >
                전문적
              </button>
              <button
                onClick={() => changeTone('casual')}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-full hover:bg-black hover:text-white transition"
              >
                친근한
              </button>
              <button
                onClick={() => changeTone('creative')}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-full hover:bg-black hover:text-white transition"
              >
                창의적
              </button>
            </div>
            <textarea
              value={toneResult}
              onChange={(e) => setToneResult(e.target.value)}
              className="w-full h-80 border border-gray-300 rounded-xl p-4 text-base resize-none mb-5"
              placeholder="이곳에서 AI가 변환한 텍스트를 확인하고 수정할 수 있습니다..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowToneManager(false)}
                className="px-5 py-2 bg-white border-2 border-black rounded-full font-medium hover:bg-black hover:text-white transition"
              >
                닫기
              </button>
              <button
                onClick={applyToneToEditor}
                className="px-5 py-2 bg-black text-white border-2 border-black rounded-full font-medium hover:bg-white hover:text-black transition"
              >
                에디터에 적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summarize Modal */}
      {showSummarizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 bg-gray-50 border-b-2 border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                <FaCompressAlt className="text-purple-600" />
                AI 완벽 요약
              </h2>
              <button
                onClick={() => setShowSummarizeModal(false)}
                className="text-2xl text-gray-500 hover:text-black"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 border-b border-gray-200">
              <div className="flex gap-2">
                {['youtube', 'document', 'website', 'text'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSummaryTab(tab)}
                    className={`px-5 py-2 border-2 border-gray-300 rounded-lg font-semibold text-sm transition ${
                      summaryTab === tab
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab === 'youtube' && '유튜브'}
                    {tab === 'document' && '문서'}
                    {tab === 'website' && '웹사이트'}
                    {tab === 'text' && '텍스트'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {summaryTab === 'youtube' && (
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">유튜브 링크</label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}
              {summaryTab === 'text' && (
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">요약할 텍스트</label>
                  <textarea
                    placeholder="여기에 요약할 텍스트를 붙여넣어주세요..."
                    className="w-full min-h-[200px] px-3 py-2 border-2 border-gray-300 rounded-lg text-sm resize-vertical"
                  />
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t-2 border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowSummarizeModal(false)}
                className="px-6 py-2 bg-white text-gray-600 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                취소
              </button>
              <button className="px-6 py-2 bg-black text-white border-2 border-black rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2">
                <FaMagic />
                요약하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[10000] p-5">
          <div className="bg-white p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">이미지 추가</h2>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-2xl text-gray-500 hover:text-black"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex gap-3 mb-6 border-b-2 border-gray-100">
              <button
                onClick={() => setImageTab('search')}
                className={`px-6 py-3 font-semibold border-b-3 ${
                  imageTab === 'search'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600'
                }`}
              >
                이미지 검색
              </button>
              <button
                onClick={() => setImageTab('generate')}
                className={`px-6 py-3 font-semibold border-b-3 ${
                  imageTab === 'generate'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600'
                }`}
              >
                AI 생성
              </button>
            </div>

            {imageTab === 'search' && (
              <div>
                <div className="mb-5">
                  <input
                    type="text"
                    placeholder="검색어 입력 (예: technology, nature, business)"
                    className="w-[calc(100%-130px)] px-3 py-3 border-2 border-gray-300 rounded-lg text-sm"
                  />
                  <button className="w-24 px-3 py-3 bg-purple-600 text-white rounded-lg font-semibold ml-3">
                    검색
                  </button>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 max-h-[500px] overflow-y-auto">
                  <div className="col-span-full text-center p-10 text-gray-500">
                    검색어를 입력하고 검색 버튼을 눌러주세요
                  </div>
                </div>
              </div>
            )}

            {imageTab === 'generate' && (
              <div>
                <div className="mb-5">
                  <div className="mb-4">
                    <label className="block font-semibold mb-2 text-gray-700">
                      <FaImage className="inline mr-2" />
                      이미지 생성 API 선택
                    </label>
                    <select className="w-full px-3 py-3 border-2 border-purple-600 rounded-lg text-sm bg-white font-medium">
                      <option value="huggingface">Hugging Face (Stable Diffusion)</option>
                      <option value="dalle">DALL-E (OpenAI)</option>
                      <option value="midjourney">Midjourney</option>
                    </select>
                    <small className="block mt-2 text-gray-600 p-2 bg-gray-100 rounded">
                      💡 Hugging Face API 키가 필요합니다. 설정에서 API 키를 등록하세요.
                    </small>
                  </div>
                  <textarea
                    placeholder="이미지 설명 입력 (영어 권장)&#10;예: A beautiful sunset over mountains, photorealistic, 4k quality"
                    className="w-full h-24 px-3 py-3 border-2 border-gray-300 rounded-lg text-sm resize-none"
                  />
                  <button className="w-full px-3 py-3.5 bg-purple-600 text-white rounded-lg font-semibold mt-3 text-base">
                    <FaMagic className="inline mr-2" />
                    AI로 이미지 생성
                  </button>
                </div>
                <div className="text-center p-5 text-gray-500">
                  프롬프트를 입력하고 생성 버튼을 눌러주세요
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10000] backdrop-blur-sm">
          <div className="bg-white p-10 rounded-3xl max-w-3xl w-[90%] max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl text-gray-800 flex items-center gap-3">
                <FaTags className="text-cyan-500" />
                태그 및 카테고리 추천
              </h2>
              <button
                onClick={() => setShowTagModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xl text-gray-600 hover:bg-gray-200 transition"
              >
                <FaTimes />
              </button>
            </div>
            <button className="w-full px-4 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-3 mb-8 transition hover:shadow-lg">
              <FaMagic />
              AI로 자동 추천받기
            </button>
            <div className="text-center text-gray-500 py-10">
              AI로 자동 추천받기 버튼을 눌러주세요
            </div>
          </div>
        </div>
      )}

      {/* Floating Results Modal */}
      {showFloatingModal && (
        <div className="fixed right-5 bottom-5 w-[850px] max-w-[90vw] h-[650px] max-h-[85vh] bg-white border-2 border-gray-300 rounded-2xl shadow-2xl flex flex-col z-[10000]">
          <div className="p-4 bg-black rounded-t-2xl border-b-2 border-gray-300 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaRobot />
              AI 글 생성 결과 ({Object.keys(floatingResults).length}개 모델)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFloatingModal(false)}
                className="w-8 h-8 rounded-lg bg-transparent border-2 border-white text-white flex items-center justify-center hover:bg-white hover:text-black transition"
              >
                <FaTimes />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex gap-1 p-3 bg-gray-50 border-b border-gray-200 overflow-x-auto">
              {Object.keys(floatingResults).map((model) => (
                <button
                  key={model}
                  onClick={() => setActiveFloatingTab(model)}
                  className={`px-5 py-3 border-none rounded-t-lg font-semibold text-sm transition ${
                    activeFloatingTab === model
                      ? 'bg-white text-black'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-7">
              {activeFloatingTab && floatingResults[activeFloatingTab] ? (
                <div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: floatingResults[activeFloatingTab].content
                    }}
                    className="prose max-w-none"
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500">모델을 선택하여 결과를 확인하세요</div>
              )}
            </div>
            <div className="p-3 bg-gray-100 border-t border-gray-200 flex gap-2 justify-end">
              <button
                onClick={() => activeFloatingTab && applyContentToEditor(activeFloatingTab)}
                className="px-5 py-2.5 bg-black text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-gray-900 transition flex items-center gap-2"
              >
                <FaCheckCircle />
                에디터로 가져가기
              </button>
              <button
                onClick={() => activeFloatingTab && copyModelContent(activeFloatingTab)}
                className="px-5 py-2.5 bg-white text-black border border-gray-300 rounded-lg font-semibold text-sm shadow-sm hover:bg-gray-100 transition flex items-center gap-2"
              >
                <FaCopy />
                복사
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorRealPage;

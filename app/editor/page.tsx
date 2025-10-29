'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { FaMagic, FaRobot, FaBold, FaItalic, FaUnderline, FaListOl, FaListUl, FaLink, FaUndo, FaRedo, FaSave, FaImage, FaEye } from 'react-icons/fa';

// ==================== TYPES ====================
interface AIModel {
  value: string;
  name: string;
  provider: string;
}

interface BlogPost {
  title: string;
  content: string;
  source: string;
  model: string;
  loading?: boolean;
  error?: boolean;
}

interface ModelResults {
  [key: string]: BlogPost;
}

const EditorPage: React.FC = () => {
  const router = useRouter();
  const [editorContent, setEditorContent] = useState<string>('<h2>제목을 입력하세요</h2><p>여기에 내용을 작성하세요. AI가 실시간으로 도와드립니다.</p>');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-2.5-flash', 'gemini-pro']);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [topicInput, setTopicInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [charCount, setCharCount] = useState<number>(0);
  const [wordCount, setWordCount] = useState<number>(0);
  const [showFloatingModal, setShowFloatingModal] = useState<boolean>(false);
  const [floatingResults, setFloatingResults] = useState<ModelResults>({});
  const [activeFloatingTab, setActiveFloatingTab] = useState<string>('');

  const editorRef = useRef<HTMLDivElement>(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadAIModels();
  }, []);

  useEffect(() => {
    updateWordCount();
  }, [editorContent]);

  // ==================== FUNCTIONS ====================
  const loadAIModels = async () => {
    const defaultModels: AIModel[] = [
      { value: 'llama', name: 'DeepSeek Coder V2 16B', provider: 'ollama' },
      { value: 'qwen', name: 'Qwen3 Coder 30B', provider: 'ollama' },
      { value: 'gemma', name: 'Qwen3 Coder 480B', provider: 'ollama' },
      { value: 'mistral', name: 'GPT-OSS 120B', provider: 'ollama' },
      { value: 'deepseek-v3', name: 'DeepSeek V3.1', provider: 'ollama' },
      { value: 'gemini-flash', name: 'Gemini 1.5 Flash', provider: 'google' },
      { value: 'gemini-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
      { value: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
      { value: 'gemini-2.5-exp', name: 'Gemini 2.5 Pro', provider: 'google' }
    ];
    setAiModels(defaultModels);
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

    const prompt = `다음 주제로 SEO 최적화된 블로그 포스트를 작성해주세요: "${topicInput}"

다음 형식으로 작성해주세요:

## 제목
[클릭을 유도하는 매력적인 한글 제목, 50-60자]

## 본문
[1000-1500자의 상세한 블로그 포스트]

당신은 전문 블로그 작가이자 SEO 전문가입니다. 한국어로 고품질의 블로그 포스트를 작성합니다.`;

    const results: ModelResults = {};

    // Initialize loading states
    for (const model of selectedModels) {
      results[model] = {
        title: topicInput,
        content: '<div style="text-align: center; padding: 40px; color: #6b7280;"><i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i><br/><br/>AI가 블로그 포스트를 생성하고 있습니다...</div>',
        source: '사용자 입력',
        model: model,
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
            prompt: prompt,
            model: model
          })
        });

        const data = await response.json();
        const content = data.generated_text || data.content || '';

        results[model] = {
          title: topicInput,
          content: content,
          source: '사용자 입력',
          model: model,
          loading: false
        };

        setFloatingResults({ ...results });
      } catch (error) {
        console.error(`${model} 생성 오류:`, error);
        results[model] = {
          title: topicInput,
          content: `<div style="color: #ef4444; text-align: center; padding: 20px;">생성 실패: ${error}</div>`,
          source: '사용자 입력',
          model: model,
          loading: false,
          error: true
        };
        setFloatingResults({ ...results });
      }
    });

    await Promise.all(promises);
    setIsGenerating(false);
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
    alert('저장되었습니다!');
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

  const applyContentToEditor = (model: string) => {
    const result = floatingResults[model];
    if (result && editorRef.current) {
      editorRef.current.innerHTML = `<h2>${result.title}</h2>${result.content}`;
      setEditorContent(editorRef.current.innerHTML);
      setShowFloatingModal(false);
      alert('에디터에 내용이 적용되었습니다!');
    }
  };

  const copyModelContent = (model: string) => {
    const result = floatingResults[model];
    if (result) {
      navigator.clipboard.writeText(`${result.title}\n\n${result.content}`);
      alert('클립보드에 복사되었습니다!');
    }
  };

  const headerActions = (
    <>
      <button
        onClick={previewContent}
        style={{
          background: '#ffffff',
          color: '#111827',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f9fafb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ffffff';
        }}
      >
        <FaEye />
        미리보기
      </button>
      <button
        onClick={() => router.push('/posts')}
        style={{
          background: '#3b82f6',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#2563eb';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#3b82f6';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        내 글 보기
      </button>
    </>
  );

  // ==================== RENDER ====================
  return (
    <AppLayout>
      <style jsx global>{`
        .editor-container {
          display: grid;
          gap: 24px;
        }

        .ai-generation-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .input-group {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .input-field {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .btn-primary {
          padding: 10px 20px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .model-selection {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }

        .model-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .model-chip {
          padding: 6px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .model-chip input[type="checkbox"] {
          cursor: pointer;
        }

        .model-chip:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .model-chip.selected {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #ffffff;
        }

        .editor-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .editor-toolbar {
          padding: 12px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .toolbar-btn {
          width: 36px;
          height: 36px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #374151;
        }

        .toolbar-btn:hover {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #ffffff;
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: #e5e7eb;
          margin: 0 4px;
        }

        .editor-content {
          min-height: 500px;
          padding: 32px;
          font-size: 16px;
          line-height: 1.8;
          outline: none;
        }

        .editor-footer {
          padding: 16px 24px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .word-count {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .footer-actions {
          display: flex;
          gap: 8px;
        }

        .btn-secondary {
          padding: 8px 16px;
          background: #ffffff;
          color: #374151;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: #f9fafb;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .modal-content {
          background: #ffffff;
          border-radius: 12px;
          width: 90%;
          max-width: 900px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          padding: 20px 24px;
          background: #3b82f6;
          color: #ffffff;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-close-btn {
          width: 32px;
          height: 32px;
          background: transparent;
          border: 2px solid #ffffff;
          border-radius: 6px;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background: #ffffff;
          color: #3b82f6;
        }

        .modal-tabs {
          padding: 12px 24px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .modal-tab {
          padding: 8px 16px;
          background: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .modal-tab.active {
          background: #3b82f6;
          color: #ffffff;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .modal-footer {
          padding: 16px 24px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .input-group {
            flex-direction: column;
          }

          .editor-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .footer-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <PageHeader
        title="AI 에디터"
        subtitle="AI를 활용한 스마트 글쓰기"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'AI 에디터' },
        ]}
        actions={headerActions}
      />

      <div className="editor-container">
        {/* AI Generation Section */}
        <div className="ai-generation-card">
          <div className="section-title">
            <FaMagic /> AI 블로그 포스트 생성
          </div>

          <div className="input-group">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="주제를 입력하세요 (예: AI 기술의 미래, 블록체인의 활용 사례...)"
              className="input-field"
              onKeyPress={(e) => e.key === 'Enter' && generateFromTopic()}
            />
            <button
              onClick={generateFromTopic}
              disabled={isGenerating}
              className="btn-primary"
            >
              <FaMagic />
              {isGenerating ? '생성 중...' : '생성하기'}
            </button>
          </div>

          {/* AI Model Selection */}
          <div className="model-selection">
            <div className="section-title">
              <FaRobot /> AI 모델 선택 (복수 선택 가능)
            </div>
            <div className="model-chips">
              <button onClick={toggleAllModels} className="model-chip">
                전체 선택/해제
              </button>
              {aiModels.map((model) => (
                <label
                  key={model.value}
                  className={`model-chip ${selectedModels.includes(model.value) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model.value)}
                    onChange={() => handleModelSelection(model.value)}
                  />
                  {model.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Text Editor */}
        <div className="editor-card">
          {/* Toolbar */}
          <div className="editor-toolbar">
            <button onClick={() => formatText('bold')} className="toolbar-btn" title="굵게">
              <FaBold />
            </button>
            <button onClick={() => formatText('italic')} className="toolbar-btn" title="기울임">
              <FaItalic />
            </button>
            <button onClick={() => formatText('underline')} className="toolbar-btn" title="밑줄">
              <FaUnderline />
            </button>
            <div className="toolbar-divider"></div>
            <button onClick={() => formatText('insertOrderedList')} className="toolbar-btn" title="번호 목록">
              <FaListOl />
            </button>
            <button onClick={() => formatText('insertUnorderedList')} className="toolbar-btn" title="글머리 기호">
              <FaListUl />
            </button>
            <div className="toolbar-divider"></div>
            <button onClick={insertLink} className="toolbar-btn" title="링크">
              <FaLink />
            </button>
            <button onClick={insertImageToEditor} className="toolbar-btn" title="이미지">
              <FaImage />
            </button>
            <div className="toolbar-divider"></div>
            <button onClick={() => formatText('undo')} className="toolbar-btn" title="실행 취소">
              <FaUndo />
            </button>
            <button onClick={() => formatText('redo')} className="toolbar-btn" title="다시 실행">
              <FaRedo />
            </button>
          </div>

          {/* Editor Content */}
          <div
            ref={editorRef}
            contentEditable
            className="editor-content"
            dangerouslySetInnerHTML={{ __html: editorContent }}
            onInput={(e) => setEditorContent(e.currentTarget.innerHTML)}
          />

          {/* Footer */}
          <div className="editor-footer">
            <div className="word-count">
              글자 수: {charCount} | 단어 수: {wordCount}
            </div>
            <div className="footer-actions">
              <button onClick={saveContent} className="btn-secondary">
                <FaSave />
                저장
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Results Modal */}
      {showFloatingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                <FaRobot />
                AI 생성 결과 ({Object.keys(floatingResults).length}개 모델)
              </h2>
              <button onClick={() => setShowFloatingModal(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <div className="modal-tabs">
              {Object.keys(floatingResults).map((model) => (
                <button
                  key={model}
                  onClick={() => setActiveFloatingTab(model)}
                  className={`modal-tab ${activeFloatingTab === model ? 'active' : ''}`}
                >
                  {model}
                </button>
              ))}
            </div>

            <div className="modal-body">
              {activeFloatingTab && floatingResults[activeFloatingTab] ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: floatingResults[activeFloatingTab].content
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#6b7280' }}>
                  모델을 선택하여 결과를 확인하세요
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => activeFloatingTab && applyContentToEditor(activeFloatingTab)}
                className="btn-primary"
              >
                에디터로 가져가기
              </button>
              <button
                onClick={() => activeFloatingTab && copyModelContent(activeFloatingTab)}
                className="btn-secondary"
              >
                복사
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default EditorPage;

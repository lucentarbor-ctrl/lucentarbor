'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';

interface AIModel {
  value: string;
  name: string;
  provider: string;
}

interface NewsResult {
  title: string;
  content: string;
  source: string;
  model: string;
  loading?: boolean;
  error?: boolean;
}

interface ModelResults {
  [key: string]: NewsResult;
}

export default function NewsCrawlerPage() {
  const [newsUrl, setNewsUrl] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-2.5-flash']);
  const [aiModels] = useState<AIModel[]>([
    { value: 'llama', name: 'DeepSeek Coder V2 16B', provider: 'ollama' },
    { value: 'qwen', name: 'Qwen3 Coder 30B', provider: 'ollama' },
    { value: 'gemma', name: 'Qwen3 Coder 480B', provider: 'ollama' },
    { value: 'mistral', name: 'GPT-OSS 120B', provider: 'ollama' },
    { value: 'deepseek-v3', name: 'DeepSeek V3.1', provider: 'ollama' },
    { value: 'gemini-flash', name: 'Gemini 1.5 Flash', provider: 'google' },
    { value: 'gemini-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
    { value: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
    { value: 'gemini-2.5-exp', name: 'Gemini 2.5 Pro', provider: 'google' }
  ]);
  const [results, setResults] = useState<ModelResults>({});
  const [activeTab, setActiveTab] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);

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

  const handleCrawlNews = async () => {
    if (!newsUrl.trim()) {
      alert('뉴스 URL을 입력해주세요');
      return;
    }

    if (selectedModels.length === 0) {
      alert('최소 하나의 AI 모델을 선택해주세요');
      return;
    }

    setIsGenerating(true);

    const prompt = `다음 뉴스 기사를 읽고 요약 및 분석해주세요: ${newsUrl}

다음 형식으로 작성해주세요:

## 제목
[기사의 핵심을 담은 제목]

## 본문
[기사 요약 및 주요 내용 분석]

뉴스 URL에서 직접 콘텐츠를 가져올 수 없다면, URL 주소를 바탕으로 예상되는 내용을 작성해주세요.`;

    const newResults: ModelResults = {};

    // Initialize loading states
    for (const model of selectedModels) {
      newResults[model] = {
        title: '로딩 중...',
        content: 'AI가 뉴스를 분석하고 있습니다...',
        source: newsUrl,
        model: model,
        loading: true
      };
    }

    setResults(newResults);
    setShowResults(true);
    setActiveTab(selectedModels[0] || '');

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

        if (!response.ok) {
          throw new Error('AI 생성 실패');
        }

        const data = await response.json();
        const fullContent = data.generated_text || data.content || '';

        // AI 응답에서 제목 추출
        let extractedTitle = '뉴스 요약';
        let extractedContent = fullContent;

        const titleMatch = fullContent.match(/##\s*제목\s*\n\s*(.+?)(?:\n|$)/i);
        if (titleMatch && titleMatch[1]) {
          extractedTitle = titleMatch[1].trim();
          extractedContent = fullContent.replace(/##\s*제목\s*\n\s*.+?\n/i, '');
        } else {
          const h2Match = fullContent.match(/##\s*(.+?)(?:\n|$)/);
          if (h2Match && h2Match[1] && !h2Match[1].includes('본문')) {
            extractedTitle = h2Match[1].trim();
          }
        }

        extractedContent = extractedContent.replace(/##\s*본문\s*\n/i, '');

        newResults[model] = {
          title: extractedTitle,
          content: extractedContent,
          source: newsUrl,
          model: model,
          loading: false
        };

        setResults({ ...newResults });
      } catch (error) {
        console.error(`${model} 생성 오류:`, error);
        newResults[model] = {
          title: '생성 실패',
          content: `뉴스 크롤링 중 오류가 발생했습니다: ${error}`,
          source: newsUrl,
          model: model,
          loading: false,
          error: true
        };
        setResults({ ...newResults });
      }
    });

    await Promise.all(promises);
    setIsGenerating(false);
  };

  const handleSaveToEditor = (model: string) => {
    const result = results[model];
    if (!result) return;

    // 에디터로 이동하면서 제목과 내용 전달
    const editorUrl = `/editor?title=${encodeURIComponent(result.title)}&content=${encodeURIComponent(result.content)}`;
    window.location.href = editorUrl;
  };

  return (
    <AppLayout>
      <PageHeader
        title="뉴스 크롤링"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: '콘텐츠' },
          { label: '뉴스크롤링' }
        ]}
        subtitle="뉴스 URL을 입력하고 AI가 분석한 내용을 확인하세요"
      />

      <div style={{
        flex: 1,
        display: 'flex',
        gap: '24px',
        minHeight: 0
      }}>
        {/* Left Panel - Input & Model Selection */}
        <div style={{
          width: '400px',
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          height: 'fit-content'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              <i className="fas fa-newspaper" style={{ marginRight: '8px', color: '#3b82f6' }}></i>
              뉴스 URL
            </label>
            <input
              type="url"
              value={newsUrl}
              onChange={(e) => setNewsUrl(e.target.value)}
              placeholder="https://news.example.com/article/..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  handleCrawlNews();
                }
              }}
            />
          </div>

          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                <i className="fas fa-robot" style={{ marginRight: '8px', color: '#3b82f6' }}></i>
                AI 모델 선택
              </label>
              <button
                onClick={toggleAllModels}
                style={{
                  padding: '4px 12px',
                  background: 'transparent',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                {selectedModels.length === aiModels.length ? '전체 해제' : '전체 선택'}
              </button>
            </div>

            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px'
            }}>
              {aiModels.map((model) => (
                <div key={model.value} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  marginBottom: '4px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: selectedModels.includes(model.value) ? '#f0f9ff' : 'transparent'
                }}
                onClick={() => handleModelSelection(model.value)}
                >
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model.value)}
                    onChange={() => handleModelSelection(model.value)}
                    style={{ marginRight: '8px', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                      {model.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {model.provider}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCrawlNews}
            disabled={isGenerating || selectedModels.length === 0}
            style={{
              width: '100%',
              padding: '14px',
              background: isGenerating || selectedModels.length === 0 ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isGenerating || selectedModels.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isGenerating ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                분석 중...
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                뉴스 분석 시작 ({selectedModels.length}개 모델)
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Results */}
        <div style={{
          flex: 1,
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          {!showResults ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              textAlign: 'center'
            }}>
              <i className="fas fa-newspaper" style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.3 }}></i>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                뉴스 분석 준비 완료
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                뉴스 URL을 입력하고 AI 모델을 선택한 후<br/>
                "뉴스 분석 시작" 버튼을 클릭하세요
              </p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '2px solid #f3f4f6',
                marginBottom: '20px',
                overflowX: 'auto',
                flexShrink: 0
              }}>
                {selectedModels.map((modelValue) => {
                  const model = aiModels.find(m => m.value === modelValue);
                  return (
                    <button
                      key={modelValue}
                      onClick={() => setActiveTab(modelValue)}
                      style={{
                        padding: '12px 20px',
                        background: activeTab === modelValue ? '#3b82f6' : 'transparent',
                        color: activeTab === modelValue ? '#ffffff' : '#6b7280',
                        border: 'none',
                        borderRadius: '8px 8px 0 0',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                      }}
                    >
                      {results[modelValue]?.loading && (
                        <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                      )}
                      {model?.name}
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                {activeTab && results[activeTab] && (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        제목
                      </label>
                      <input
                        type="text"
                        value={results[activeTab].title}
                        onChange={(e) => {
                          setResults(prev => ({
                            ...prev,
                            [activeTab]: {
                              ...prev[activeTab],
                              title: e.target.value
                            }
                          }));
                        }}
                        disabled={results[activeTab].loading}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '600',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        내용
                      </label>
                      <textarea
                        value={results[activeTab].content}
                        onChange={(e) => {
                          setResults(prev => ({
                            ...prev,
                            [activeTab]: {
                              ...prev[activeTab],
                              content: e.target.value
                            }
                          }));
                        }}
                        disabled={results[activeTab].loading}
                        style={{
                          width: '100%',
                          minHeight: '400px',
                          padding: '16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          fontFamily: 'inherit',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #f3f4f6'
                    }}>
                      <button
                        onClick={() => handleSaveToEditor(activeTab)}
                        disabled={results[activeTab].loading}
                        style={{
                          flex: 1,
                          padding: '12px 24px',
                          background: results[activeTab].loading ? '#9ca3af' : '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: results[activeTab].loading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <i className="fas fa-edit"></i>
                        에디터에서 편집
                      </button>
                    </div>

                    {results[activeTab].source && (
                      <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#6b7280'
                      }}>
                        <strong>출처:</strong>{' '}
                        <a
                          href={results[activeTab].source}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3b82f6', textDecoration: 'none' }}
                        >
                          {results[activeTab].source}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';

interface NewsResult {
  title: string;
  content: string;
  source: string;
  model: string;
  loading: boolean;
  url?: string;
}

type AIModel = 'gemini' | 'gpt4o' | 'claude';

export default function NewsCrawlerPage() {
  const [newsUrl, setNewsUrl] = useState('');
  const [results, setResults] = useState<Record<AIModel, NewsResult>>({
    gemini: { title: '', content: '', source: '', model: 'gemini', loading: false },
    gpt4o: { title: '', content: '', source: '', model: 'gpt4o', loading: false },
    claude: { title: '', content: '', source: '', model: 'claude', loading: false },
  });
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');

  const handleCrawlNews = async (model: AIModel) => {
    if (!newsUrl.trim()) {
      alert('뉴스 URL을 입력해주세요');
      return;
    }

    setResults(prev => ({
      ...prev,
      [model]: { ...prev[model], loading: true }
    }));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: `다음 뉴스 URL의 내용을 크롤링하고 요약해주세요: ${newsUrl}`,
          newsUrl: newsUrl
        }),
      });

      if (!response.ok) {
        throw new Error('뉴스 크롤링 실패');
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

      setResults(prev => ({
        ...prev,
        [model]: {
          title: extractedTitle,
          content: extractedContent,
          source: newsUrl,
          model: model,
          loading: false,
          url: newsUrl
        }
      }));
    } catch (error) {
      console.error('뉴스 크롤링 오류:', error);
      setResults(prev => ({
        ...prev,
        [model]: {
          ...prev[model],
          loading: false,
          content: '뉴스 크롤링 중 오류가 발생했습니다.'
        }
      }));
    }
  };

  const handleCrawlAll = () => {
    handleCrawlNews('gemini');
    handleCrawlNews('gpt4o');
    handleCrawlNews('claude');
  };

  const handleSave = async () => {
    const result = results[selectedModel];
    if (!result.title || !result.content) {
      alert('저장할 내용이 없습니다');
      return;
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.title,
          content: result.content,
          model: result.model,
          source: result.url || newsUrl
        }),
      });

      if (response.ok) {
        alert('저장되었습니다!');
      } else {
        alert('저장 실패');
      }
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다');
    }
  };

  return (
    <div>
      <PageHeader
        title="뉴스 크롤링"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: '콘텐츠' },
          { label: '뉴스크롤링' }
        ]}
        subtitle="뉴스 URL을 입력하고 AI가 요약한 내용을 확인하세요"
      />

      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            뉴스 URL
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="url"
              value={newsUrl}
              onChange={(e) => setNewsUrl(e.target.value)}
              placeholder="https://news.example.com/article/..."
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCrawlNews(selectedModel);
                }
              }}
            />
            <button
              onClick={() => handleCrawlNews(selectedModel)}
              disabled={results[selectedModel].loading}
              style={{
                padding: '12px 24px',
                background: results[selectedModel].loading ? '#9ca3af' : '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: results[selectedModel].loading ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {results[selectedModel].loading ? '크롤링 중...' : '크롤링'}
            </button>
            <button
              onClick={handleCrawlAll}
              disabled={Object.values(results).some(r => r.loading)}
              style={{
                padding: '12px 24px',
                background: Object.values(results).some(r => r.loading) ? '#9ca3af' : '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: Object.values(results).some(r => r.loading) ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              모두 크롤링
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '8px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          {(['gemini', 'gpt4o', 'claude'] as AIModel[]).map((model) => (
            <button
              key={model}
              onClick={() => setSelectedModel(model)}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: selectedModel === model ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                color: selectedModel === model ? '#111827' : '#6b7280',
                cursor: 'pointer',
                boxShadow: selectedModel === model ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {model === 'gemini' ? 'Gemini' : model === 'gpt4o' ? 'GPT-4o' : 'Claude'}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            크롤링 결과
          </h2>
          {results[selectedModel].content && (
            <button
              onClick={handleSave}
              style={{
                padding: '10px 20px',
                background: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              저장
            </button>
          )}
        </div>

        {results[selectedModel].loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '16px' }}></i>
            <p>뉴스를 크롤링하고 있습니다...</p>
          </div>
        ) : results[selectedModel].content ? (
          <div>
            {results[selectedModel].title && (
              <div style={{ marginBottom: '16px' }}>
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
                  value={results[selectedModel].title}
                  onChange={(e) => {
                    setResults(prev => ({
                      ...prev,
                      [selectedModel]: {
                        ...prev[selectedModel],
                        title: e.target.value
                      }
                    }));
                  }}
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
            )}
            <div>
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
                value={results[selectedModel].content}
                onChange={(e) => {
                  setResults(prev => ({
                    ...prev,
                    [selectedModel]: {
                      ...prev[selectedModel],
                      content: e.target.value
                    }
                  }));
                }}
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
            {results[selectedModel].url && (
              <div style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
                출처: <a href={results[selectedModel].url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                  {results[selectedModel].url}
                </a>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#9ca3af'
          }}>
            <i className="fas fa-newspaper" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}></i>
            <p>뉴스 URL을 입력하고 크롤링 버튼을 클릭하세요</p>
          </div>
        )}
      </div>
    </div>
  );
}

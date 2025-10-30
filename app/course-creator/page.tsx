'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';

interface CourseResult {
  title: string;
  content: string;
  source: string;
  model: string;
  loading: boolean;
}

type AIModel = 'gemini' | 'gpt4o' | 'claude';

export default function CourseCreatorPage() {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [results, setResults] = useState<Record<AIModel, CourseResult>>({
    gemini: { title: '', content: '', source: '', model: 'gemini', loading: false },
    gpt4o: { title: '', content: '', source: '', model: 'gpt4o', loading: false },
    claude: { title: '', content: '', source: '', model: 'claude', loading: false },
  });
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');

  const handleCreateCourse = async (model: AIModel) => {
    if (!courseTitle.trim()) {
      alert('강좌 제목을 입력해주세요');
      return;
    }

    setResults(prev => ({
      ...prev,
      [model]: { ...prev[model], loading: true }
    }));

    try {
      const prompt = `
다음 강좌를 제작해주세요:

제목: ${courseTitle}
${courseDescription ? `설명: ${courseDescription}` : ''}

다음 형식으로 강좌 내용을 작성해주세요:
- 강좌 개요
- 학습 목표
- 커리큘럼 (섹션별 구성)
- 각 섹션의 상세 내용
- 실습 예제 (있다면)
- 마무리 및 다음 단계
`;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('강좌 생성 실패');
      }

      const data = await response.json();
      const fullContent = data.generated_text || data.content || '';

      // AI 응답에서 제목 추출
      let extractedTitle = courseTitle;
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
          source: '사용자 입력',
          model: model,
          loading: false
        }
      }));
    } catch (error) {
      console.error('강좌 생성 오류:', error);
      setResults(prev => ({
        ...prev,
        [model]: {
          ...prev[model],
          loading: false,
          content: '강좌 생성 중 오류가 발생했습니다.'
        }
      }));
    }
  };

  const handleCreateAll = () => {
    handleCreateCourse('gemini');
    handleCreateCourse('gpt4o');
    handleCreateCourse('claude');
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
          source: result.source,
          type: 'course'
        }),
      });

      if (response.ok) {
        alert('강좌가 저장되었습니다!');
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
        title="강좌 제작"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: '콘텐츠' },
          { label: '강좌제작' }
        ]}
        subtitle="AI를 활용하여 강좌 콘텐츠를 자동으로 생성하세요"
      />

      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            강좌 제목
          </label>
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="예: React 기초부터 고급까지"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateCourse(selectedModel);
              }
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
            강좌 설명 (선택사항)
          </label>
          <textarea
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
            placeholder="강좌에 포함될 내용이나 학습 대상을 설명해주세요"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => handleCreateCourse(selectedModel)}
            disabled={results[selectedModel].loading}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: results[selectedModel].loading ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: results[selectedModel].loading ? 'not-allowed' : 'pointer'
            }}
          >
            {results[selectedModel].loading ? '생성 중...' : '강좌 생성'}
          </button>
          <button
            onClick={handleCreateAll}
            disabled={Object.values(results).some(r => r.loading)}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: Object.values(results).some(r => r.loading) ? '#9ca3af' : '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: Object.values(results).some(r => r.loading) ? 'not-allowed' : 'pointer'
            }}
          >
            모든 모델로 생성
          </button>
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
            생성된 강좌
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
            <p>강좌를 생성하고 있습니다...</p>
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
                  minHeight: '500px',
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
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#9ca3af'
          }}>
            <i className="fas fa-graduation-cap" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}></i>
            <p>강좌 제목을 입력하고 생성 버튼을 클릭하세요</p>
          </div>
        )}
      </div>
    </div>
  );
}

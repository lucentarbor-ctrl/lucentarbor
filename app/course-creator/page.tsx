'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';

interface AIModel {
  value: string;
  name: string;
  provider: string;
}

interface CourseResult {
  title: string;
  content: string;
  source: string;
  model: string;
  loading?: boolean;
  error?: boolean;
}

interface ModelResults {
  [key: string]: CourseResult;
}

export default function CourseCreatorPage() {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [duration, setDuration] = useState('medium');
  const [audience, setAudience] = useState('beginner');
  const [includedSections, setIncludedSections] = useState<string[]>(['overview', 'curriculum', 'content']);

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
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');

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

  const toggleSection = (section: string) => {
    setIncludedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const difficultyLabels = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급'
  };

  const durationLabels = {
    short: '짧은 강좌 (30-60분)',
    medium: '보통 강좌 (1-3시간)',
    long: '긴 강좌 (3시간 이상)'
  };

  const audienceLabels = {
    beginner: '초보자',
    intermediate: '중급자',
    expert: '전문가'
  };

  const sectionOptions = [
    { value: 'overview', label: '강좌 개요', icon: 'fa-info-circle' },
    { value: 'objectives', label: '학습 목표', icon: 'fa-bullseye' },
    { value: 'prerequisites', label: '사전 요구사항', icon: 'fa-clipboard-check' },
    { value: 'curriculum', label: '커리큘럼', icon: 'fa-list-ol' },
    { value: 'content', label: '상세 내용', icon: 'fa-book-open' },
    { value: 'exercises', label: '실습 예제', icon: 'fa-code' },
    { value: 'quiz', label: '퀴즈/평가', icon: 'fa-question-circle' },
    { value: 'resources', label: '참고 자료', icon: 'fa-link' },
    { value: 'summary', label: '마무리 요약', icon: 'fa-check-circle' }
  ];

  const handleCreateCourse = async () => {
    if (!courseTitle.trim()) {
      alert('강좌 제목을 입력해주세요');
      return;
    }

    if (selectedModels.length === 0) {
      alert('최소 하나의 AI 모델을 선택해주세요');
      return;
    }

    if (includedSections.length === 0) {
      alert('최소 하나의 섹션을 선택해주세요');
      return;
    }

    setIsGenerating(true);

    const sectionDescriptions = includedSections.map(section => {
      const option = sectionOptions.find(opt => opt.value === section);
      return option ? option.label : section;
    }).join(', ');

    const prompt = `다음 조건으로 온라인 강좌를 제작해주세요:

강좌 제목: ${courseTitle}
${courseDescription ? `강좌 설명: ${courseDescription}` : ''}
난이도: ${difficultyLabels[difficulty as keyof typeof difficultyLabels]}
강좌 길이: ${durationLabels[duration as keyof typeof durationLabels]}
대상 청중: ${audienceLabels[audience as keyof typeof audienceLabels]}
포함할 섹션: ${sectionDescriptions}

다음 형식으로 작성해주세요:

## 제목
[매력적인 강좌 제목]

## 본문
[선택된 섹션들에 대한 상세한 내용을 체계적으로 작성]

전문 강사이자 교육 전문가의 관점에서 학습자가 이해하기 쉽고 실용적인 강좌를 작성해주세요.`;

    const newResults: ModelResults = {};

    // Initialize loading states
    for (const model of selectedModels) {
      newResults[model] = {
        title: '로딩 중...',
        content: 'AI가 강좌를 생성하고 있습니다...',
        source: '사용자 입력',
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

        newResults[model] = {
          title: extractedTitle,
          content: extractedContent,
          source: '사용자 입력',
          model: model,
          loading: false
        };

        setResults({ ...newResults });
      } catch (error) {
        console.error(`${model} 생성 오류:`, error);
        newResults[model] = {
          title: '생성 실패',
          content: `강좌 생성 중 오류가 발생했습니다: ${error}`,
          source: '사용자 입력',
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

    const editorUrl = `/editor?title=${encodeURIComponent(result.title)}&content=${encodeURIComponent(result.content)}`;
    window.location.href = editorUrl;
  };

  return (
    <AppLayout>
      <PageHeader
        title="강좌 제작"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: '콘텐츠' },
          { label: '강좌제작' }
        ]}
        subtitle="AI를 활용하여 전문 강좌를 손쉽게 제작하세요"
      />

      <div style={{
        flex: 1,
        display: 'flex',
        gap: '24px',
        minHeight: 0
      }}>
        {/* Left Panel - Course Configuration */}
        <div style={{
          width: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: '100%',
          overflowY: 'auto'
        }}>
          {/* 기본 정보 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-graduation-cap" style={{ color: '#3b82f6' }}></i>
              기본 정보
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                강좌 제목 *
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
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                강좌 설명 (선택)
              </label>
              <textarea
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="강좌에 대한 간단한 설명을 입력하세요"
                style={{
                  width: '100%',
                  minHeight: '80px',
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
          </div>

          {/* 강좌 설정 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-sliders-h" style={{ color: '#3b82f6' }}></i>
              강좌 설정
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                난이도
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Object.entries(difficultyLabels).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setDifficulty(value)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: difficulty === value ? '#3b82f6' : '#f3f4f6',
                      color: difficulty === value ? '#ffffff' : '#6b7280',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                강좌 길이
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {Object.entries(durationLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                대상 청중
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {Object.entries(audienceLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 포함할 섹션 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-th-list" style={{ color: '#3b82f6' }}></i>
              포함할 섹션
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sectionOptions.map((section) => (
                <div
                  key={section.value}
                  onClick={() => toggleSection(section.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    background: includedSections.includes(section.value) ? '#f0f9ff' : '#f9fafb',
                    border: `2px solid ${includedSections.includes(section.value) ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={includedSections.includes(section.value)}
                    onChange={() => toggleSection(section.value)}
                    style={{ marginRight: '12px', cursor: 'pointer' }}
                  />
                  <i className={`fas ${section.icon}`} style={{
                    marginRight: '10px',
                    color: includedSections.includes(section.value) ? '#3b82f6' : '#6b7280',
                    width: '20px'
                  }}></i>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: includedSections.includes(section.value) ? '#111827' : '#6b7280'
                  }}>
                    {section.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI 모델 선택 */}
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
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-robot" style={{ color: '#3b82f6' }}></i>
                AI 모델 선택
              </h3>
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
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px'
            }}>
              {aiModels.map((model) => (
                <div
                  key={model.value}
                  onClick={() => handleModelSelection(model.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px',
                    marginBottom: '4px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: selectedModels.includes(model.value) ? '#f0f9ff' : 'transparent'
                  }}
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

          {/* 생성 버튼 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <button
              onClick={handleCreateCourse}
              disabled={isGenerating || selectedModels.length === 0}
              style={{
                width: '100%',
                padding: '16px',
                background: isGenerating || selectedModels.length === 0 ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isGenerating || selectedModels.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: isGenerating || selectedModels.length === 0 ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  강좌 생성 중...
                </>
              ) : (
                <>
                  <i className="fas fa-magic"></i>
                  강좌 생성 시작 ({selectedModels.length}개 모델)
                </>
              )}
            </button>
          </div>
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
              <i className="fas fa-graduation-cap" style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.3 }}></i>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                강좌 제작 준비 완료
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', maxWidth: '400px' }}>
                왼쪽에서 강좌 정보를 입력하고 원하는 섹션과 AI 모델을 선택한 후<br/>
                "강좌 생성 시작" 버튼을 클릭하세요
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
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          내용
                        </label>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          background: '#f3f4f6',
                          padding: '4px',
                          borderRadius: '6px'
                        }}>
                          <button
                            onClick={() => setViewMode('edit')}
                            style={{
                              padding: '6px 12px',
                              background: viewMode === 'edit' ? '#ffffff' : 'transparent',
                              color: viewMode === 'edit' ? '#111827' : '#6b7280',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              boxShadow: viewMode === 'edit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                          >
                            <i className="fas fa-code" style={{ marginRight: '4px' }}></i>
                            편집
                          </button>
                          <button
                            onClick={() => setViewMode('preview')}
                            style={{
                              padding: '6px 12px',
                              background: viewMode === 'preview' ? '#ffffff' : 'transparent',
                              color: viewMode === 'preview' ? '#111827' : '#6b7280',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              boxShadow: viewMode === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                          >
                            <i className="fas fa-eye" style={{ marginRight: '4px' }}></i>
                            미리보기
                          </button>
                        </div>
                      </div>

                      {viewMode === 'edit' ? (
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
                            minHeight: '500px',
                            padding: '16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            fontFamily: 'monospace',
                            outline: 'none',
                            resize: 'vertical'
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            minHeight: '500px',
                            padding: '16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            background: '#ffffff',
                            overflow: 'auto'
                          }}
                          dangerouslySetInnerHTML={{ __html: results[activeTab].content }}
                        />
                      )}
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

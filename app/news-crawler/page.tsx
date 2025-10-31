'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';

interface AIModel {
  value: string;
  name: string;
  provider: string;
}

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedDate: string;
  summary?: string;
  selected?: boolean;
}

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  lastFetched?: string;
  itemCount?: number;
  active: boolean;
}

type TabMode = 'keyword' | 'rss' | 'trending' | 'compare';

export default function NewsCrawlerPage() {
  const [activeTab, setActiveTab] = useState<TabMode>('keyword');

  // Keyword Search States
  const [keyword, setKeyword] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [searchResults, setSearchResults] = useState<NewsItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // RSS Feed States
  const [rssFeeds, setRssFeeds] = useState<RSSFeed[]>([
    { id: '1', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech', active: true, itemCount: 0 },
    { id: '2', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech', active: true, itemCount: 0 },
  ]);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [rssFeedItems, setRssFeedItems] = useState<NewsItem[]>([]);
  const [isFetchingRss, setIsFetchingRss] = useState(false);

  // Trending States
  const [trendingNews, setTrendingNews] = useState<NewsItem[]>([]);
  const [trendingCategory, setTrendingCategory] = useState('all');
  const [isFetchingTrending, setIsFetchingTrending] = useState(false);

  // Compare States
  const [compareUrls, setCompareUrls] = useState<string[]>(['', '', '']);
  const [compareResults, setCompareResults] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // AI Model Selection
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [aiModels] = useState<AIModel[]>([
    { value: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
    { value: 'gemini-2.5-exp', name: 'Gemini 2.5 Pro', provider: 'google' },
    { value: 'gemini-flash', name: 'Gemini 1.5 Flash', provider: 'google' },
    { value: 'gemini-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
    { value: 'llama', name: 'DeepSeek Coder V2 16B', provider: 'ollama' },
    { value: 'qwen', name: 'Qwen3 Coder 30B', provider: 'ollama' },
    { value: 'gemma', name: 'Qwen3 Coder 480B', provider: 'ollama' },
    { value: 'mistral', name: 'GPT-OSS 120B', provider: 'ollama' },
    { value: 'deepseek-v3', name: 'DeepSeek V3.1', provider: 'ollama' }
  ]);

  // Advanced Features
  const [autoSummarize, setAutoSummarize] = useState<boolean>(true);
  const [resultsPerPage, setResultsPerPage] = useState<number>(20);
  const [sortBy, setSortBy] = useState<'date' | 'relevance'>('date');

  // Keywords Search Handler
  const handleKeywordSearch = async () => {
    if (!keyword.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch('/api/news/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          category: searchCategory,
          limit: 20,
        }),
      });

      const data = await response.json();

      if (data.success && data.items) {
        setSearchResults(data.items);
      } else {
        console.error('Search failed:', data.error);
        alert('뉴스 검색에 실패했습니다: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('뉴스 검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // RSS Feed Handlers
  const handleAddRssFeed = () => {
    if (!newFeedUrl.trim() || !newFeedName.trim()) return;

    const newFeed: RSSFeed = {
      id: Date.now().toString(),
      name: newFeedName,
      url: newFeedUrl,
      category: 'custom',
      active: true,
      itemCount: 0,
    };

    setRssFeeds([...rssFeeds, newFeed]);
    setNewFeedUrl('');
    setNewFeedName('');
  };

  const handleFetchRssFeeds = async () => {
    setIsFetchingRss(true);

    try {
      const activeFeeds = rssFeeds.filter(feed => feed.active);

      if (activeFeeds.length === 0) {
        alert('활성화된 RSS 피드가 없습니다.');
        setIsFetchingRss(false);
        return;
      }

      const response = await fetch('/api/news/rss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: activeFeeds.map(feed => feed.url),
        }),
      });

      const data = await response.json();

      if (data.success && data.items) {
        setRssFeedItems(data.items);

        // Update feed item counts
        const updatedFeeds = rssFeeds.map(feed => {
          const feedData = data.feeds?.find((f: any) => f.url === feed.url);
          return feedData ? { ...feed, itemCount: feedData.items?.length || 0 } : feed;
        });
        setRssFeeds(updatedFeeds);
      } else {
        console.error('RSS fetch failed:', data.error);
        alert('RSS 피드를 불러오는데 실패했습니다: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('RSS fetch error:', error);
      alert('RSS 피드를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsFetchingRss(false);
    }
  };

  // Trending News Handler
  const handleFetchTrending = async () => {
    setIsFetchingTrending(true);

    try {
      const response = await fetch('/api/news/trending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: trendingCategory,
          limit: 20,
        }),
      });

      const data = await response.json();

      if (data.success && data.items) {
        setTrendingNews(data.items);
      } else {
        console.error('Trending fetch failed:', data.error);
        alert('트렌딩 뉴스를 불러오는데 실패했습니다: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Trending fetch error:', error);
      alert('트렌딩 뉴스를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsFetchingTrending(false);
    }
  };

  // Compare Analysis Handler
  const handleCompareNews = async () => {
    const validUrls = compareUrls.filter(url => url.trim());
    if (validUrls.length < 2) {
      alert('최소 2개 이상의 URL을 입력해주세요.');
      return;
    }

    setIsComparing(true);

    try {
      const response = await fetch('/api/news/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: validUrls,
          aiModel: selectedModel || 'gemini-2.5-flash',
        }),
      });

      const data = await response.json();

      if (data.success && data.analysis) {
        setCompareResults({
          summary: data.analysis.summary,
          commonPoints: data.analysis.commonPoints,
          differences: data.analysis.differences,
          synthesis: data.analysis.synthesis,
        });
      } else {
        console.error('Compare failed:', data.error);
        alert('뉴스 비교 분석에 실패했습니다: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Compare error:', error);
      alert('뉴스 비교 분석 중 오류가 발생했습니다.');
    } finally {
      setIsComparing(false);
    }
  };

  const handleRewriteNews = async (newsItem: NewsItem) => {
    // 선택한 뉴스를 AI로 리라이팅
    const editorUrl = `/editor?url=${encodeURIComponent(newsItem.url)}&title=${encodeURIComponent(newsItem.title)}`;
    window.location.href = editorUrl;
  };

  const tabs = [
    { id: 'keyword' as TabMode, label: '키워드 검색', icon: 'fa-search' },
    { id: 'rss' as TabMode, label: 'RSS 피드', icon: 'fa-rss' },
    { id: 'trending' as TabMode, label: '트렌딩', icon: 'fa-fire' },
    { id: 'compare' as TabMode, label: '비교 분석', icon: 'fa-balance-scale' },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="뉴스 크롤링"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: '콘텐츠' },
          { label: '뉴스크롤링' }
        ]}
        subtitle="키워드 검색, RSS 피드, 트렌딩 뉴스, 비교 분석 등 다양한 방식으로 뉴스를 수집하세요"
      />

      {/* AI Model Selector - Global */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="fas fa-robot" style={{ fontSize: '24px' }}></i>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
              AI 모델 선택
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              뉴스 분석 및 요약에 사용할 AI 모델을 선택하세요
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '220px',
              backdropFilter: 'blur(10px)'
            }}
          >
            {aiModels.map((model) => (
              <option key={model.value} value={model.value} style={{ color: '#111827', background: '#ffffff' }}>
                {model.name}
              </option>
            ))}
          </select>
          <div style={{
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {aiModels.find(m => m.value === selectedModel)?.provider.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? '#3b82f6' : '#f3f4f6',
              color: activeTab === tab.id ? '#ffffff' : '#6b7280',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className={`fas ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{
        display: 'flex',
        gap: '24px',
        minHeight: '600px'
      }}>
        {/* Left Panel - Settings */}
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
          {/* Keyword Search Panel */}
          {activeTab === 'keyword' && (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  <i className="fas fa-search" style={{ marginRight: '8px', color: '#3b82f6' }}></i>
                  검색 키워드
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="예: 인공지능, 블록체인, 메타버스..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isSearching) {
                      handleKeywordSearch();
                    }
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
                  카테고리
                </label>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="all">전체</option>
                  <option value="tech">기술</option>
                  <option value="business">경제</option>
                  <option value="science">과학</option>
                  <option value="health">건강</option>
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
                  <i className="fas fa-cog" style={{ marginRight: '8px', color: '#8b5cf6' }}></i>
                  추가 옵션
                </label>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  flexDirection: 'column',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={autoSummarize}
                      onChange={(e) => setAutoSummarize(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>자동 요약 생성</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#6b7280', minWidth: '80px' }}>결과 개수:</label>
                    <select
                      value={resultsPerPage}
                      onChange={(e) => setResultsPerPage(Number(e.target.value))}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        flex: 1
                      }}
                    >
                      <option value={10}>10개</option>
                      <option value={20}>20개</option>
                      <option value={50}>50개</option>
                      <option value={100}>100개</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#6b7280', minWidth: '80px' }}>정렬 기준:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'relevance')}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        flex: 1
                      }}
                    >
                      <option value="date">최신순</option>
                      <option value="relevance">관련도순</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleKeywordSearch}
                disabled={isSearching || !keyword.trim()}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: isSearching
                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: isSearching ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.2s ease',
                  transform: isSearching ? 'none' : 'translateY(0)',
                }}
                onMouseEnter={(e) => {
                  if (!isSearching) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSearching) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                  }
                }}
              >
                {isSearching ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '16px' }}></i>
                    검색 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search" style={{ fontSize: '16px' }}></i>
                    뉴스 검색 시작
                  </>
                )}
              </button>
            </>
          )}

          {/* RSS Feed Panel */}
          {activeTab === 'rss' && (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  RSS 피드 추가
                </label>
                <input
                  type="text"
                  value={newFeedName}
                  onChange={(e) => setNewFeedName(e.target.value)}
                  placeholder="피드 이름"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    marginBottom: '8px'
                  }}
                />
                <input
                  type="url"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  placeholder="RSS 피드 URL"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    marginBottom: '8px'
                  }}
                />
                <button
                  onClick={handleAddRssFeed}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-plus"></i> 피드 추가
                </button>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  등록된 피드 ({rssFeeds.length})
                </label>
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {rssFeeds.map((feed) => (
                    <div
                      key={feed.id}
                      style={{
                        padding: '12px',
                        background: feed.active ? '#f0f9ff' : '#f3f4f6',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                          {feed.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {feed.itemCount || 0} items
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={feed.active}
                        onChange={() => {
                          setRssFeeds(rssFeeds.map(f =>
                            f.id === feed.id ? { ...f, active: !f.active } : f
                          ));
                        }}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleFetchRssFeeds}
                disabled={isFetchingRss}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: isFetchingRss
                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: isFetchingRss ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: isFetchingRss ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isFetchingRss) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFetchingRss) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                  }
                }}
              >
                {isFetchingRss ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '16px' }}></i>
                    불러오는 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync" style={{ fontSize: '16px' }}></i>
                    RSS 피드 불러오기
                  </>
                )}
              </button>
            </>
          )}

          {/* Trending Panel */}
          {activeTab === 'trending' && (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  트렌딩 카테고리
                </label>
                <select
                  value={trendingCategory}
                  onChange={(e) => setTrendingCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="all">전체</option>
                  <option value="tech">기술</option>
                  <option value="business">경제</option>
                  <option value="science">과학</option>
                  <option value="entertainment">엔터테인먼트</option>
                </select>
              </div>

              <div style={{
                padding: '16px',
                background: '#fef3c7',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#92400e'
              }}>
                <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                실시간으로 인기 있는 뉴스를 자동으로 수집합니다.
              </div>

              <button
                onClick={handleFetchTrending}
                disabled={isFetchingTrending}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: isFetchingTrending
                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: isFetchingTrending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: isFetchingTrending ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isFetchingTrending) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFetchingTrending) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                  }
                }}
              >
                {isFetchingTrending ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '16px' }}></i>
                    불러오는 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-fire" style={{ fontSize: '16px' }}></i>
                    트렌딩 뉴스 보기
                  </>
                )}
              </button>
            </>
          )}

          {/* Compare Panel */}
          {activeTab === 'compare' && (
            <>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  비교할 뉴스 URL (2-3개)
                </label>
                {compareUrls.map((url, index) => (
                  <input
                    key={index}
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...compareUrls];
                      newUrls[index] = e.target.value;
                      setCompareUrls(newUrls);
                    }}
                    placeholder={`뉴스 URL ${index + 1}`}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      marginBottom: '8px'
                    }}
                  />
                ))}
              </div>

              <div style={{
                padding: '16px',
                background: '#e0e7ff',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#3730a3'
              }}>
                <i className="fas fa-lightbulb" style={{ marginRight: '8px' }}></i>
                같은 주제의 여러 뉴스를 비교 분석하여 객관적인 리포트를 생성합니다.
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  <i className="fas fa-brain" style={{ marginRight: '8px', color: '#8b5cf6' }}></i>
                  분석 옵션
                </label>
                <div style={{
                  padding: '12px',
                  background: '#f5f3ff',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#6b21a8'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <i className="fas fa-check-circle" style={{ color: '#8b5cf6' }}></i>
                    <span>AI 통합 리포트 생성</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <i className="fas fa-check-circle" style={{ color: '#8b5cf6' }}></i>
                    <span>공통점/차이점 분석</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-check-circle" style={{ color: '#8b5cf6' }}></i>
                    <span>다중 관점 종합 요약</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCompareNews}
                disabled={isComparing}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: isComparing
                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                    : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: isComparing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: isComparing ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isComparing) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isComparing) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                  }
                }}
              >
                {isComparing ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '16px' }}></i>
                    AI가 분석 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-balance-scale" style={{ fontSize: '16px' }}></i>
                    비교 분석 시작
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Right Panel - Results */}
        <div style={{
          flex: 1,
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflowY: 'auto',
          maxHeight: '800px'
        }}>
          {/* Keyword Results */}
          {activeTab === 'keyword' && (
            <>
              {searchResults.length === 0 && !isSearching && (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6b7280'
                }}>
                  <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                  <p>키워드를 입력하고 검색해보세요</p>
                </div>
              )}

              {searchResults.map((news) => (
                <div
                  key={news.id}
                  style={{
                    padding: '20px',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0,
                      flex: 1
                    }}>
                      {news.title}
                    </h3>
                    <button
                      onClick={() => handleRewriteNews(news)}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        marginLeft: '12px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                      }}
                    >
                      <i className="fas fa-edit"></i> 리라이팅
                    </button>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    marginBottom: '8px'
                  }}>
                    <i className="fas fa-newspaper" style={{ marginRight: '6px' }}></i>
                    {news.source} • {new Date(news.publishedDate).toLocaleDateString()}
                  </div>
                  {news.summary && (
                    <p style={{
                      fontSize: '14px',
                      color: '#4b5563',
                      margin: 0,
                      lineHeight: 1.6
                    }}>
                      {news.summary}
                    </p>
                  )}
                </div>
              ))}
            </>
          )}

          {/* RSS Results */}
          {activeTab === 'rss' && (
            <>
              {rssFeedItems.length === 0 && !isFetchingRss && (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6b7280'
                }}>
                  <i className="fas fa-rss" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                  <p>RSS 피드를 불러오세요</p>
                </div>
              )}

              {rssFeedItems.map((news) => (
                <div
                  key={news.id}
                  style={{
                    padding: '20px',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0,
                      flex: 1
                    }}>
                      {news.title}
                    </h3>
                    <button
                      onClick={() => handleRewriteNews(news)}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        marginLeft: '12px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                      }}
                    >
                      <i className="fas fa-edit"></i> 리라이팅
                    </button>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    marginBottom: '8px'
                  }}>
                    <i className="fas fa-rss" style={{ marginRight: '6px' }}></i>
                    {news.source} • {new Date(news.publishedDate).toLocaleDateString()}
                  </div>
                  {news.summary && (
                    <p style={{
                      fontSize: '14px',
                      color: '#4b5563',
                      margin: 0,
                      lineHeight: 1.6
                    }}>
                      {news.summary}
                    </p>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Trending Results */}
          {activeTab === 'trending' && (
            <>
              {trendingNews.length === 0 && !isFetchingTrending && (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6b7280'
                }}>
                  <i className="fas fa-fire" style={{ fontSize: '48px', marginBottom: '16px', color: '#ef4444' }}></i>
                  <p>트렌딩 뉴스를 불러오세요</p>
                </div>
              )}

              {trendingNews.map((news, index) => (
                <div
                  key={news.id}
                  style={{
                    padding: '20px',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#ef4444'
                      }}>
                        #{index + 1}
                      </div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0
                      }}>
                        {news.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleRewriteNews(news)}
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        marginLeft: '12px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                      }}
                    >
                      <i className="fas fa-edit"></i> 리라이팅
                    </button>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    marginBottom: '8px',
                    marginLeft: '32px'
                  }}>
                    <i className="fas fa-fire" style={{ marginRight: '6px', color: '#ef4444' }}></i>
                    {news.source} • {new Date(news.publishedDate).toLocaleDateString()}
                  </div>
                  {news.summary && (
                    <p style={{
                      fontSize: '14px',
                      color: '#4b5563',
                      margin: 0,
                      marginLeft: '32px',
                      lineHeight: 1.6
                    }}>
                      {news.summary}
                    </p>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Compare Results */}
          {activeTab === 'compare' && (
            <>
              {!compareResults && !isComparing && (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#6b7280'
                }}>
                  <i className="fas fa-balance-scale" style={{ fontSize: '48px', marginBottom: '16px', color: '#8b5cf6' }}></i>
                  <p>비교할 뉴스 URL을 입력하고 분석을 시작하세요</p>
                </div>
              )}

              {compareResults && (
                <div style={{ padding: '20px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '24px'
                  }}>
                    <i className="fas fa-chart-line" style={{ marginRight: '12px', color: '#8b5cf6' }}></i>
                    비교 분석 결과
                  </h2>

                  <div style={{
                    background: '#f5f3ff',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#6b21a8',
                      marginBottom: '12px'
                    }}>
                      종합 요약
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#4b5563',
                      lineHeight: 1.6,
                      margin: 0
                    }}>
                      {compareResults.summary}
                    </p>
                  </div>

                  <div style={{
                    background: '#f0fdf4',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#166534',
                      marginBottom: '12px'
                    }}>
                      공통점
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {compareResults.commonPoints.map((point: string, idx: number) => (
                        <li key={idx} style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{
                    background: '#fef2f2',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#991b1b',
                      marginBottom: '12px'
                    }}>
                      차이점
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {compareResults.differences.map((point: string, idx: number) => (
                        <li key={idx} style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{
                    background: '#ffffff',
                    border: '2px solid #e5e7eb',
                    padding: '20px',
                    borderRadius: '8px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '12px'
                    }}>
                      AI 통합 리포트
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#4b5563',
                      lineHeight: 1.6,
                      margin: 0
                    }}>
                      {compareResults.synthesis}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const editorUrl = `/editor?content=${encodeURIComponent(compareResults.synthesis)}`;
                      window.location.href = editorUrl;
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      marginTop: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                    }}
                  >
                    <i className="fas fa-edit" style={{ fontSize: '16px' }}></i>
                    에디터에서 편집하기
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

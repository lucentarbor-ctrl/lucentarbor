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

  // Keywords Search Handler
  const handleKeywordSearch = async () => {
    if (!keyword.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      // TODO: API 연동 - 실제 뉴스 검색 API 호출
      // 임시 mock 데이터
      const mockResults: NewsItem[] = [
        {
          id: '1',
          title: `${keyword} 관련 최신 기술 동향`,
          url: 'https://example.com/news1',
          source: 'TechNews',
          publishedDate: new Date().toISOString(),
          summary: `${keyword}에 대한 최신 기술 동향을 분석한 기사입니다.`,
        },
        {
          id: '2',
          title: `${keyword} 산업의 미래 전망`,
          url: 'https://example.com/news2',
          source: 'BusinessDaily',
          publishedDate: new Date().toISOString(),
          summary: `${keyword} 산업이 어떻게 발전할 것인지 전문가들의 의견을 담았습니다.`,
        },
        {
          id: '3',
          title: `${keyword} 시장 분석 리포트`,
          url: 'https://example.com/news3',
          source: 'MarketWatch',
          publishedDate: new Date().toISOString(),
          summary: `${keyword} 시장의 현황과 향후 전망을 상세히 분석합니다.`,
        },
      ];

      setTimeout(() => {
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 1000);
    } catch (error) {
      console.error('Search error:', error);
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
      // TODO: API 연동 - RSS 피드 파싱
      // 임시 mock 데이터
      const mockItems: NewsItem[] = rssFeeds
        .filter(feed => feed.active)
        .flatMap((feed, idx) => [
          {
            id: `${feed.id}-1`,
            title: `${feed.name} - Latest Article ${idx + 1}`,
            url: `${feed.url}/article-1`,
            source: feed.name,
            publishedDate: new Date().toISOString(),
            summary: `Latest article from ${feed.name}`,
          },
          {
            id: `${feed.id}-2`,
            title: `${feed.name} - Breaking News ${idx + 1}`,
            url: `${feed.url}/article-2`,
            source: feed.name,
            publishedDate: new Date().toISOString(),
            summary: `Breaking news from ${feed.name}`,
          },
        ]);

      setTimeout(() => {
        setRssFeedItems(mockItems);
        setIsFetchingRss(false);
      }, 1000);
    } catch (error) {
      console.error('RSS fetch error:', error);
      setIsFetchingRss(false);
    }
  };

  // Trending News Handler
  const handleFetchTrending = async () => {
    setIsFetchingTrending(true);

    try {
      // TODO: API 연동 - 실시간 트렌딩 뉴스
      // 임시 mock 데이터
      const categories = ['tech', 'business', 'science', 'health'];
      const mockTrending: NewsItem[] = categories.map((cat, idx) => ({
        id: `trending-${idx}`,
        title: `🔥 Trending in ${cat}: Latest developments`,
        url: `https://example.com/trending/${cat}`,
        source: 'TrendingNews',
        publishedDate: new Date().toISOString(),
        summary: `Currently trending in ${cat} category`,
      }));

      setTimeout(() => {
        setTrendingNews(mockTrending);
        setIsFetchingTrending(false);
      }, 1000);
    } catch (error) {
      console.error('Trending fetch error:', error);
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
      // TODO: API 연동 - 뉴스 비교 분석
      setTimeout(() => {
        setCompareResults({
          summary: '여러 뉴스를 종합 분석한 결과입니다.',
          commonPoints: ['공통점 1', '공통점 2'],
          differences: ['차이점 1', '차이점 2'],
          synthesis: 'AI가 생성한 종합 리포트 내용...',
        });
        setIsComparing(false);
      }, 2000);
    } catch (error) {
      console.error('Compare error:', error);
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

              <button
                onClick={handleKeywordSearch}
                disabled={isSearching || !keyword.trim()}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: isSearching ? '#9ca3af' : '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSearching ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    검색 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search"></i>
                    뉴스 검색
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
                  padding: '14px',
                  background: isFetchingRss ? '#9ca3af' : '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isFetchingRss ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isFetchingRss ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    불러오는 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync"></i>
                    피드 불러오기
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
                  padding: '14px',
                  background: isFetchingTrending ? '#9ca3af' : '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isFetchingTrending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isFetchingTrending ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    불러오는 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-fire"></i>
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

              <button
                onClick={handleCompareNews}
                disabled={isComparing}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: isComparing ? '#9ca3af' : '#8b5cf6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isComparing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isComparing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    분석 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-balance-scale"></i>
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
                        padding: '8px 16px',
                        background: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginLeft: '12px',
                        whiteSpace: 'nowrap'
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
                        padding: '8px 16px',
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginLeft: '12px',
                        whiteSpace: 'nowrap'
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
                        padding: '8px 16px',
                        background: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginLeft: '12px',
                        whiteSpace: 'nowrap'
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
                      padding: '14px',
                      background: '#8b5cf6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <i className="fas fa-edit"></i>
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

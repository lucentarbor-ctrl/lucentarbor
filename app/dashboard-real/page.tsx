'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface PerformanceTrendItem {
  date: string;
  views: number;
  likes: number;
}

interface TopPost {
  title: string;
  category: string;
  views: number;
  likes: number;
}

interface DashboardSummary {
  total_views: number;
  total_likes: number;
  published_posts: number;
  avg_views_per_post: number;
}

interface DashboardData {
  summary: DashboardSummary;
  performance_trend: PerformanceTrendItem[];
  top_posts: TopPost[];
}

export default function DashboardPage() {
  const [totalViews, setTotalViews] = useState<string>('-');
  const [totalLikes, setTotalLikes] = useState<string>('-');
  const [publishedPosts, setPublishedPosts] = useState<string>('-');
  const [avgViews, setAvgViews] = useState<string>('-');
  const [lastUpdate, setLastUpdate] = useState<string>('백엔드 연결 중...');
  const [syncIconClass, setSyncIconClass] = useState<string>('');
  const [syncIconColor, setSyncIconColor] = useState<string>('var(--gray-600)');
  const [updateColor, setUpdateColor] = useState<string>('var(--gray-600)');
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [performanceTrend, setPerformanceTrend] = useState<PerformanceTrendItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const showLoadingState = () => {
    setSyncIconClass('fa-spin');
    setSyncIconColor('var(--primary)');
    setLastUpdate('데이터 불러오는 중...');
    setUpdateColor('var(--gray-600)');
    setTotalViews('...');
    setTotalLikes('...');
    setPublishedPosts('...');
    setAvgViews('...');
  };

  const updateLastRefreshTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR');
    setLastUpdate(`마지막 업데이트: ${timeString}`);
    setUpdateColor('var(--success)');
    setSyncIconClass('');
    setSyncIconColor('var(--success)');
    console.log(`✓ 대시보드 데이터 갱신 완료: ${timeString}`);
  };

  const displayPerformanceTrend = (trendData: PerformanceTrendItem[]) => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Handle empty data
    let finalTrendData = trendData;
    if (trendData.length === 0) {
      finalTrendData = [{ date: '데이터 없음', views: 0, likes: 0 }];
    }

    // Extract labels and data
    const labels = finalTrendData.map(item => item.date);
    const viewsData = finalTrendData.map(item => item.views);
    const likesData = finalTrendData.map(item => item.likes);

    // Create Chart.js line chart
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '조회수',
            data: viewsData,
            borderColor: '#667eea',
            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) {
                return 'rgba(102, 126, 234, 0.4)';
              }
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, 'rgba(102, 126, 234, 0.4)');
              gradient.addColorStop(1, 'rgba(102, 126, 234, 0.02)');
              return gradient;
            },
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#667eea',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3,
            borderWidth: 3
          },
          {
            label: '좋아요',
            data: likesData,
            borderColor: '#f093fb',
            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) {
                return 'rgba(240, 147, 251, 0.4)';
              }
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, 'rgba(240, 147, 251, 0.4)');
              gradient.addColorStop(1, 'rgba(240, 147, 251, 0.02)');
              return gradient;
            },
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#f093fb',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3,
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 14,
                family: 'Pretendard'
              }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            padding: 12,
            titleFont: {
              size: 14,
              family: 'Pretendard'
            },
            bodyFont: {
              size: 13,
              family: 'Pretendard'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: 12,
                family: 'Pretendard'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              font: {
                size: 12,
                family: 'Pretendard'
              }
            },
            grid: {
              display: false
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  };

  const loadDashboard = async () => {
    showLoadingState();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/analytics/dashboard');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        const data: DashboardData = result.data;

        // Update summary statistics
        setTotalViews(data.summary.total_views.toLocaleString());
        setTotalLikes(data.summary.total_likes.toLocaleString());
        setPublishedPosts(data.summary.published_posts.toLocaleString());
        setAvgViews(Math.round(data.summary.avg_views_per_post).toLocaleString());

        // Set performance trend and top posts
        setPerformanceTrend(data.performance_trend);
        setTopPosts(data.top_posts);

        // Update last refresh time
        updateLastRefreshTime();
      } else {
        throw new Error(result.message || '데이터 로드 실패');
      }
    } catch (error) {
      console.error('대시보드 로드 실패:', error);

      // Set error state
      setTotalViews('0');
      setTotalLikes('0');
      setPublishedPosts('0');
      setAvgViews('0');
      setPerformanceTrend([]);
      setTopPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    // Auto refresh every 30 seconds
    const interval = setInterval(loadDashboard, 30000);

    return () => {
      clearInterval(interval);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (performanceTrend.length >= 0) {
      displayPerformanceTrend(performanceTrend);
    }
  }, [performanceTrend]);

  const handlePostsClick = () => {
    window.location.href = 'posts.html?filter=published';
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --primary: #2d3748;
          --secondary: #ffffff;
          --gray-100: #f7fafc;
          --gray-200: #edf2f7;
          --gray-300: #e2e8f0;
          --gray-400: #cbd5e0;
          --gray-500: #a0aec0;
          --gray-600: #718096;
          --success: #48bb78;
          --radius: 12px;
          --radius-lg: 16px;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
          --shadow-md: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
          --shadow-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
          --transition: all 0.3s ease;
        }

        body {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
          margin: 0;
          padding: 0;
          background: #f7fafc;
        }

        /* App Layout */
        .app-layout {
          display: flex;
          min-height: 100vh;
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          background: var(--secondary);
          border-right: 2px solid var(--gray-300);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
        }

        .sidebar-logo {
          padding: 24px;
          border-bottom: 2px solid var(--gray-200);
          text-decoration: none;
        }

        .sidebar-logo-content {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 700;
          color: var(--primary);
        }

        .sidebar-logo-content i {
          font-size: 28px;
        }

        .sidebar-menu {
          flex: 1;
          padding: 20px 12px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          margin-bottom: 6px;
          border-radius: var(--radius);
          color: var(--gray-600);
          text-decoration: none;
          font-weight: 500;
          transition: var(--transition);
        }

        .sidebar-item:hover {
          background: var(--gray-100);
          color: var(--primary);
        }

        .sidebar-item.active {
          background: var(--primary);
          color: var(--secondary);
        }

        .sidebar-item i {
          font-size: 18px;
          width: 20px;
          text-align: center;
        }

        .sidebar-footer {
          padding: 20px;
          text-align: center;
          color: var(--gray-500);
          font-size: 12px;
          border-top: 2px solid var(--gray-200);
        }

        /* Main Content */
        .main-content {
          margin-left: 260px;
          flex: 1;
          background: var(--gray-100);
          min-height: 100vh;
        }

        /* Dashboard Styles */
        .dashboard-container {
          padding: 40px;
        }

        .dashboard-header {
          background: var(--secondary);
          border: 2px solid var(--gray-300);
          border-radius: var(--radius-lg);
          padding: 32px;
          margin-bottom: 30px;
          box-shadow: var(--shadow-sm);
        }

        .dashboard-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 0;
        }

        .dashboard-header p {
          color: var(--gray-600);
          font-size: 16px;
          margin: 0;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: var(--secondary);
          border: 2px solid var(--gray-300);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin-bottom: 16px;
          background: var(--gray-100);
          color: var(--primary);
        }

        .stat-label {
          font-size: 14px;
          color: var(--gray-600);
          margin-bottom: 8px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--primary);
        }

        .chart-container {
          background: var(--secondary);
          border: 2px solid var(--gray-300);
          border-radius: var(--radius-lg);
          padding: 32px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 30px;
        }

        .chart-container h2 {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 24px;
          margin-top: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chart-wrapper {
          position: relative;
          height: 300px;
        }

        .top-posts {
          background: var(--secondary);
          border: 2px solid var(--gray-300);
          border-radius: var(--radius-lg);
          padding: 32px;
          box-shadow: var(--shadow-sm);
        }

        .top-posts h2 {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 24px;
          margin-top: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .post-item {
          padding: 20px;
          border-bottom: 2px solid var(--gray-200);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: var(--transition);
        }

        .post-item:hover {
          background: var(--gray-100);
        }

        .post-item:last-child {
          border-bottom: none;
        }

        .post-info {
          flex: 1;
        }

        .post-rank {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
          margin-right: 16px;
        }

        .post-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 8px;
        }

        .post-category {
          display: inline-block;
          padding: 4px 12px;
          background: var(--primary);
          color: var(--secondary);
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .post-stats {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .post-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--gray-600);
          font-weight: 500;
        }

        .post-stat i {
          color: var(--primary);
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: var(--gray-500);
        }

        .error {
          background: #fee;
          color: #c33;
          padding: 20px;
          border-radius: var(--radius);
          margin: 20px 0;
          border: 2px solid #fcc;
        }

        .refresh-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--primary);
          color: var(--secondary);
          border: none;
          font-size: 20px;
          cursor: pointer;
          box-shadow: var(--shadow-md);
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .refresh-btn:hover {
          transform: scale(1.1) rotate(90deg);
          box-shadow: var(--shadow-lg);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--gray-500);
        }

        .empty-state i {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.3;
        }

        .empty-state p {
          font-size: 16px;
          margin-bottom: 8px;
        }

        .empty-state small {
          font-size: 14px;
          color: var(--gray-400);
        }
      `}</style>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Pretendard:wght@100;200;300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="app-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <Link href="index.html" className="sidebar-logo">
            <div className="sidebar-logo-content">
              <i className="fas fa-robot"></i>
              <span>AI 블로그</span>
            </div>
          </Link>

          <nav className="sidebar-menu">
            <Link href="index.html" className="sidebar-item">
              <i className="fas fa-home"></i>
              <span>홈</span>
            </Link>
            <Link href="editor.html" className="sidebar-item">
              <i className="fas fa-pen"></i>
              <span>에디터</span>
            </Link>
            <Link href="posts.html" className="sidebar-item">
              <i className="fas fa-file-alt"></i>
              <span>내 글</span>
            </Link>
            <Link href="media.html" className="sidebar-item">
              <i className="fas fa-images"></i>
              <span>미디어</span>
            </Link>
            <Link href="wordpress.html" className="sidebar-item">
              <i className="fab fa-wordpress"></i>
              <span>WordPress 발행</span>
            </Link>
            <Link href="dashboard.html" className="sidebar-item active">
              <i className="fas fa-chart-line"></i>
              <span>대시보드</span>
            </Link>
            <Link href="settings.html" className="sidebar-item">
              <i className="fas fa-cog"></i>
              <span>설정</span>
            </Link>
          </nav>

          <div className="sidebar-footer">AI 블로그 플랫폼 v1.0</div>
        </aside>

        {/* Main Content */}
        <div className="main-content">
          <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1>
                    <i className="fas fa-chart-line"></i>
                    분석 대시보드
                  </h1>
                  <p>게시물 성과를 실시간으로 모니터링하세요</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: updateColor,
                      fontSize: '14px'
                    }}
                  >
                    <i
                      className={`fas fa-sync-alt ${syncIconClass}`}
                      id="syncIcon"
                      style={{ color: syncIconColor }}
                    ></i>
                    <span id="lastUpdate">{lastUpdate}</span>
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--gray-500)' }}>
                    <i className="fas fa-database"></i> 실시간 데이터
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" id="statsGrid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-eye"></i>
                </div>
                <div className="stat-label">총 조회수</div>
                <div className="stat-value" id="totalViews">
                  {totalViews}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-heart"></i>
                </div>
                <div className="stat-label">총 좋아요</div>
                <div className="stat-value" id="totalLikes">
                  {totalLikes}
                </div>
              </div>
              <div
                className="stat-card"
                onClick={handlePostsClick}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="stat-label">발행된 게시물</div>
                <div className="stat-value" id="publishedPosts">
                  {publishedPosts}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <div className="stat-label">평균 조회수</div>
                <div className="stat-value" id="avgViews">
                  {avgViews}
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="chart-container">
              <h2>
                <i className="fas fa-chart-area"></i>
                성과 추이
              </h2>
              <div className="chart-wrapper">
                <canvas ref={chartRef} id="performanceChart"></canvas>
              </div>
            </div>

            {/* Top Posts */}
            <div className="top-posts">
              <h2>
                <i className="fas fa-trophy"></i>
                인기 게시물 Top 5
              </h2>
              <div id="topPostsList">
                {isLoading && totalViews === '...' ? (
                  <div className="loading">데이터를 불러오는 중...</div>
                ) : topPosts.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>데이터를 불러올 수 없습니다.</p>
                    <small>백엔드 서버가 실행 중인지 확인해주세요 (포트 5001)</small>
                  </div>
                ) : (
                  topPosts.map((post, index) => (
                    <div key={index} className="post-item">
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <span className="post-rank">#{index + 1}</span>
                        <div className="post-info">
                          <div className="post-title">{post.title}</div>
                          <span className="post-category">{post.category}</span>
                        </div>
                      </div>
                      <div className="post-stats">
                        <div className="post-stat">
                          <i className="fas fa-eye"></i>
                          <span>{post.views.toLocaleString()}</span>
                        </div>
                        <div className="post-stat">
                          <i className="fas fa-heart"></i>
                          <span>{post.likes.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <button className="refresh-btn" onClick={loadDashboard} title="새로고침">
        <i className="fas fa-sync-alt"></i>
      </button>
    </>
  );
}

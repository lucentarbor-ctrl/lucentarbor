'use client';

import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import AppLayout from '@/components/AppLayout';

Chart.register(...registerables);

interface DashboardStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_views: number;
  avg_views_per_post: number;
  active_blogs: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (stats) {
      renderChart();
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [stats]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const result = await response.json();

      if (result.status === 'success') {
        setStats(result.data);
      }
    } catch (error) {
      console.error('통계 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = () => {
    if (!chartRef.current || !stats) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Views',
            data: [120, 190, 300, 500, 420, 350, 400],
            borderColor: '#000000',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#000000',
            pointBorderColor: '#FFFFFF',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#000000',
            titleColor: '#FFFFFF',
            bodyColor: '#FFFFFF',
            borderColor: '#000000',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            titleFont: {
              size: 13,
              weight: '600',
            },
            bodyFont: {
              size: 12,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: '#666666',
              font: {
                size: 11,
              },
            },
          },
          y: {
            grid: {
              color: '#F0F0F0',
              drawBorder: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: '#666666',
              font: {
                size: 11,
              },
            },
          },
        },
      },
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{
              width: '40px',
              height: '40px',
              border: '3px solid #F0F0F0',
              borderTop: '3px solid #000000',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}></div>
            <p style={{ color: '#666666', fontSize: '14px' }}>로딩 중...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dashboard-container {
          padding: 40px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 32px;
        }

        .dashboard-title {
          font-size: 32px;
          font-weight: 700;
          color: #000000;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .dashboard-subtitle {
          font-size: 14px;
          color: #666666;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: #FFFFFF;
          border: 1px solid #E0E0E0;
          border-radius: 8px;
          padding: 24px;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          border-color: #000000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .stat-label {
          font-size: 13px;
          color: #666666;
          margin-bottom: 8px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #000000;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-change {
          font-size: 12px;
          color: #666666;
        }

        .chart-section {
          background: #FFFFFF;
          border: 1px solid #E0E0E0;
          border-radius: 8px;
          padding: 32px;
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #000000;
          margin: 0 0 24px 0;
        }

        .chart-container {
          height: 300px;
          position: relative;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666666;
        }

        .empty-state-icon {
          font-size: 48px;
          color: #E0E0E0;
          margin-bottom: 16px;
        }

        .empty-state-title {
          font-size: 16px;
          font-weight: 600;
          color: #000000;
          margin-bottom: 8px;
        }

        .empty-state-text {
          font-size: 14px;
          color: #666666;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .action-btn {
          background: #000000;
          color: #FFFFFF;
          border: none;
          border-radius: 6px;
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-btn:hover {
          background: #333333;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .action-icon {
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 24px;
          }

          .dashboard-title {
            font-size: 24px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .stat-value {
            font-size: 28px;
          }

          .chart-section {
            padding: 24px;
          }
        }
      `}</style>

      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">블로그 통계 및 분석</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Posts</div>
            <div className="stat-value">{stats?.total_posts || 0}</div>
            <div className="stat-change">전체 포스트</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Published</div>
            <div className="stat-value">{stats?.published_posts || 0}</div>
            <div className="stat-change">발행된 글</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Drafts</div>
            <div className="stat-value">{stats?.draft_posts || 0}</div>
            <div className="stat-change">임시 저장</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Total Views</div>
            <div className="stat-value">{(stats?.total_views || 0).toLocaleString()}</div>
            <div className="stat-change">총 조회수</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Avg. Views</div>
            <div className="stat-value">{stats?.avg_views_per_post || 0}</div>
            <div className="stat-change">평균 조회수</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Active Blogs</div>
            <div className="stat-value">{stats?.active_blogs || 0}</div>
            <div className="stat-change">연결된 블로그</div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="chart-section">
          <h2 className="section-title">Performance Trend</h2>
          <div className="chart-container">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="chart-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => window.location.href = '/editor'}>
              <span className="action-icon">✏️</span>
              <span>새 글 작성</span>
            </button>
            <button className="action-btn" onClick={() => window.location.href = '/posts'}>
              <span className="action-icon">📄</span>
              <span>포스트 관리</span>
            </button>
            <button className="action-btn" onClick={() => window.location.href = '/media'}>
              <span className="action-icon">🖼️</span>
              <span>미디어 라이브러리</span>
            </button>
            <button className="action-btn" onClick={() => window.location.href = '/settings'}>
              <span className="action-icon">⚙️</span>
              <span>설정</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/common/StatCard';
import ChartCard from '@/components/common/ChartCard';
import DataTable from '@/components/common/DataTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

interface DashboardStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_views: number;
  avg_views_per_post: number;
  active_blogs: number;
}

interface RecentPost {
  id: number;
  title: string;
  status: string;
  views: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load stats
      const statsResponse = await fetch('/api/stats');

      if (!statsResponse.ok) {
        throw new Error('통계 데이터를 불러오는데 실패했습니다');
      }

      const statsResult = await statsResponse.json();

      if (statsResult.status === 'success') {
        setStats(statsResult.data);
      } else if (statsResult.status === 'error') {
        throw new Error(statsResult.message || '통계 데이터 로드 실패');
      }

      // Load recent posts
      const postsResponse = await fetch('/api/posts?limit=5');

      if (!postsResponse.ok) {
        throw new Error('포스트 데이터를 불러오는데 실패했습니다');
      }

      const postsResult = await postsResponse.json();

      if (postsResult.status === 'success') {
        const posts = postsResult.data || [];
        // Get 5 most recent posts
        const sorted = posts.sort((a: RecentPost, b: RecentPost) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5);
        setRecentPosts(sorted);
      } else if (postsResult.status === 'error') {
        throw new Error(postsResult.message || '포스트 데이터 로드 실패');
      }
    } catch (error: any) {
      console.error('Dashboard data load error:', error);
      setError(error.message || '데이터를 불러오는 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const headerActions = (
    <>
      <button
        onClick={() => router.push('/editor')}
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
        <i className="fas fa-plus"></i>
        새 글 작성
      </button>
    </>
  );

  const postColumns = [
    {
      key: 'title',
      header: '제목',
      render: (post: RecentPost) => (
        <div style={{ fontWeight: '500', color: '#111827' }}>{post.title}</div>
      ),
    },
    {
      key: 'status',
      header: '상태',
      width: '120px',
      align: 'center' as const,
      render: (post: RecentPost) => (
        <span style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          background: post.status === 'published' ? '#f0fdf4' : '#fef3c7',
          color: post.status === 'published' ? '#10b981' : '#f59e0b',
        }}>
          {post.status === 'published' ? '발행됨' : '임시저장'}
        </span>
      ),
    },
    {
      key: 'views',
      header: '조회수',
      width: '100px',
      align: 'right' as const,
      render: (post: RecentPost) => (
        <span style={{ fontWeight: '600', color: '#6b7280' }}>
          {post.views.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: '작성일',
      width: '140px',
      align: 'right' as const,
      render: (post: RecentPost) => (
        <span style={{ color: '#9ca3af', fontSize: '13px' }}>
          {new Date(post.created_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
  ];

  const chartData = {
    labels: ['월', '화', '수', '목', '금', '토', '일'],
    datasets: [
      {
        label: '조회수',
        data: [120, 190, 300, 500, 420, 350, 400],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSpinner
          size="lg"
          message="대시보드 데이터를 불러오는 중..."
        />
      </AppLayout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <AppLayout>
        <ErrorMessage
          title="대시보드 로드 실패"
          message={error}
          onRetry={loadDashboardData}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <style jsx global>{`
        .dashboard-grid {
          display: grid;
          gap: 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        @media (max-width: 1200px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
      `}</style>

      <PageHeader
        title="Dashboard"
        subtitle="블로그 통계 및 분석"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Dashboard' },
        ]}
        actions={headerActions}
      />

      <div className="dashboard-grid">
        {/* Stats Cards */}
        <div className="stats-grid">
          <StatCard
            title="Total Posts"
            value={stats?.total_posts || 0}
            icon="far fa-file-alt"
            color="blue"
            trend={{ value: '+12.5%', isPositive: true }}
            loading={isLoading}
          />
          <StatCard
            title="Published"
            value={stats?.published_posts || 0}
            icon="fas fa-check-circle"
            color="green"
            trend={{ value: '+8.2%', isPositive: true }}
            loading={isLoading}
          />
          <StatCard
            title="Drafts"
            value={stats?.draft_posts || 0}
            icon="far fa-clock"
            color="orange"
            loading={isLoading}
          />
          <StatCard
            title="Total Views"
            value={(stats?.total_views || 0).toLocaleString()}
            icon="far fa-eye"
            color="purple"
            trend={{ value: '+23.1%', isPositive: true }}
            loading={isLoading}
          />
          <StatCard
            title="Avg Views"
            value={stats?.avg_views_per_post || 0}
            icon="fas fa-chart-line"
            color="blue"
            trend={{ value: '+5.4%', isPositive: true }}
            loading={isLoading}
          />
          <StatCard
            title="Active Blogs"
            value={stats?.active_blogs || 0}
            icon="fas fa-blog"
            color="green"
            loading={isLoading}
          />
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <ChartCard
            title="Weekly Performance"
            type="line"
            data={chartData}
            loading={isLoading}
            height={320}
          />
          <ChartCard
            title="Post Status Distribution"
            type="doughnut"
            data={{
              labels: ['Published', 'Draft', 'Scheduled'],
              datasets: [{
                data: [stats?.published_posts || 0, stats?.draft_posts || 0, 0],
                backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
                borderWidth: 0,
              }],
            }}
            loading={isLoading}
            height={320}
          />
        </div>

        {/* Recent Posts Table */}
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '16px',
          }}>
            Recent Posts
          </h2>
          <DataTable
            columns={postColumns}
            data={recentPosts}
            loading={isLoading}
            emptyMessage="최근 작성된 포스트가 없습니다"
            onRowClick={(post) => router.push(`/posts/${post.id}`)}
          />
        </div>
      </div>
    </AppLayout>
  );
}

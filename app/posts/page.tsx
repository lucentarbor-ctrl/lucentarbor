'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatCard from '@/components/common/StatCard';

interface Post {
  id: string | number;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt?: string;
  views?: number;
  likes?: number;
  blogId?: number;
  categoryId?: number;
  source?: string;
}

interface Blog {
  id: number;
  name: string;
  url?: string;
  platform: string;
  description?: string;
  categories: Category[];
}

interface Category {
  id: number;
  name: string;
  blog_id?: number;
  blogId?: number;
  parent_id?: number | null;
  parentId?: number | null;
  isDefault?: boolean;
  order?: number;
}

type FilterType = 'all' | 'draft' | 'published';
type SortType = 'newest' | 'oldest' | 'title';

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [isLoading, setIsLoading] = useState(true);

  // Load blogs from API
  const loadBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      if (!response.ok) throw new Error('Failed to load blogs');
      const result = await response.json();
      const blogsData = result.data || [];

      // Load categories for each blog
      for (let blog of blogsData) {
        const categoriesResponse = await fetch(`/api/categories?blog_id=${blog.id}`);
        if (categoriesResponse.ok) {
          const catResult = await categoriesResponse.json();
          blog.categories = catResult.data || [];
        } else {
          blog.categories = [];
        }
      }

      setBlogs(blogsData);
      return blogsData;
    } catch (error) {
      console.error('Error loading blogs:', error);
      return [];
    }
  };

  // Load posts from localStorage and API
  const loadPosts = async () => {
    let allPosts: Post[] = [];

    // Load from localStorage
    const drafts = JSON.parse(localStorage.getItem('blog-drafts') || '[]');
    const localPosts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
    allPosts = [...drafts, ...localPosts];

    // Load from backend API
    try {
      const response = await fetch('/api/posts');
      const result = await response.json();

      if (result.status === 'success' && result.data) {
        const backendPosts = result.data.map((post: any) => ({
          id: `backend-${post.id}`,
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags,
          status: post.status,
          createdAt: post.created_at,
          updatedAt: post.created_at,
          views: post.views || 0,
          likes: post.likes || 0,
          source: 'backend'
        }));

        allPosts = [...allPosts, ...backendPosts];
      }
    } catch (error) {
      console.warn('Failed to load backend posts:', error);
    }

    // Sort by date
    allPosts.sort((a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );

    setPosts(allPosts);
    return allPosts;
  };

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await Promise.all([loadBlogs(), loadPosts()]);
      setIsLoading(false);
    };
    initialize();
  }, []);

  // Get filtered and sorted posts
  const getFilteredPosts = () => {
    let filtered = [...posts];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(post => {
        const title = (post.title || '').toLowerCase();
        const content = (post.content || '').replace(/<[^>]*>/g, '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query) || content.includes(query);
      });
    }

    // Apply sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) =>
        new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime()
      );
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return filtered;
  };

  // Delete post
  const deletePost = async (postId: string | number) => {
    if (!confirm('정말로 이 글을 삭제하시겠습니까?')) return;

    try {
      if (String(postId).startsWith('backend-')) {
        const realId = String(postId).replace('backend-', '');
        const response = await fetch(`/api/posts/${realId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('백엔드에서 포스트 삭제 실패');
        }
      } else {
        let drafts = JSON.parse(localStorage.getItem('blog-drafts') || '[]');
        drafts = drafts.filter((post: Post) => post.id !== postId);
        localStorage.setItem('blog-drafts', JSON.stringify(drafts));

        let localPosts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
        localPosts = localPosts.filter((post: Post) => post.id !== postId);
        localStorage.setItem('blog-posts', JSON.stringify(localPosts));
      }

      await loadPosts();
      alert('글이 삭제되었습니다.');
    } catch (error) {
      console.error('포스트 삭제 오류:', error);
      alert('글 삭제에 실패했습니다.');
    }
  };

  const filteredPosts = getFilteredPosts();
  const totalPosts = posts.length;
  const draftCount = posts.filter(p => p.status === 'draft').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;

  // Table columns
  const columns = [
    {
      key: 'title',
      header: '제목',
      render: (post: Post) => (
        <div>
          <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
            {post.title || '제목 없음'}
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            {post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : '내용 없음'}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: '상태',
      width: '100px',
      align: 'center' as const,
      render: (post: Post) => (
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
      render: (post: Post) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <i className="far fa-eye" style={{ color: '#9ca3af' }}></i>
          <span style={{ fontWeight: '600', color: '#6b7280' }}>
            {(post.views || 0).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'likes',
      header: '좋아요',
      width: '100px',
      align: 'right' as const,
      render: (post: Post) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <i className="far fa-heart" style={{ color: '#9ca3af' }}></i>
          <span style={{ fontWeight: '600', color: '#6b7280' }}>
            {(post.likes || 0).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'date',
      header: '날짜',
      width: '140px',
      align: 'right' as const,
      render: (post: Post) => (
        <span style={{ color: '#9ca3af', fontSize: '13px' }}>
          {new Date(post.updatedAt || post.createdAt).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '180px',
      align: 'right' as const,
      render: (post: Post) => (
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => router.push(`/editor?id=${post.id}`)}
            style={{
              padding: '6px 12px',
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <i className="fas fa-edit"></i> 편집
          </button>
          <button
            onClick={() => deletePost(post.id)}
            style={{
              padding: '6px 12px',
              background: '#ffffff',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <i className="fas fa-trash"></i> 삭제
          </button>
        </div>
      ),
    },
  ];

  const headerActions = (
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
  );

  return (
    <AppLayout>
      <style jsx global>{`
        .posts-container {
          display: grid;
          gap: 24px;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .filters-bar {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-label {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          min-width: 60px;
        }

        .filter-buttons {
          display: flex;
          gap: 6px;
        }

        .filter-btn {
          padding: 6px 16px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #6b7280;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .filter-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #ffffff;
        }

        .search-input {
          flex: 1;
          min-width: 200px;
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          fontSize: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .sort-select {
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          fontSize: 14px;
          cursor: pointer;
          background: #ffffff;
          outline: none;
          transition: all 0.2s ease;
        }

        .sort-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        @media (max-width: 768px) {
          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            min-width: 100%;
          }
        }
      `}</style>

      <PageHeader
        title="내 글"
        subtitle="작성한 모든 글을 관리하세요"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: '내 글' },
        ]}
        actions={headerActions}
      />

      <div className="posts-container">
        {/* Stats */}
        <div className="stats-row">
          <StatCard
            title="Total Posts"
            value={totalPosts}
            icon="far fa-file-alt"
            color="blue"
            loading={isLoading}
          />
          <StatCard
            title="Published"
            value={publishedCount}
            icon="fas fa-check-circle"
            color="green"
            loading={isLoading}
          />
          <StatCard
            title="Drafts"
            value={draftCount}
            icon="far fa-clock"
            color="orange"
            loading={isLoading}
          />
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <span className="filter-label">상태</span>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                전체 ({totalPosts})
              </button>
              <button
                className={`filter-btn ${statusFilter === 'published' ? 'active' : ''}`}
                onClick={() => setStatusFilter('published')}
              >
                발행됨 ({publishedCount})
              </button>
              <button
                className={`filter-btn ${statusFilter === 'draft' ? 'active' : ''}`}
                onClick={() => setStatusFilter('draft')}
              >
                임시저장 ({draftCount})
              </button>
            </div>
          </div>

          <input
            type="text"
            className="search-input"
            placeholder="제목이나 내용으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="title">제목순</option>
          </select>
        </div>

        {/* Posts Table */}
        <DataTable
          columns={columns}
          data={filteredPosts}
          loading={isLoading}
          emptyMessage="작성된 글이 없습니다"
          onRowClick={(post) => router.push(`/editor?id=${post.id}`)}
        />
      </div>
    </AppLayout>
  );
}

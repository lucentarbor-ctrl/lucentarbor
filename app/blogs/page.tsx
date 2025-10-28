'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

interface Blog {
  id: number;
  name: string;
  url?: string;
  platform: string;
  is_active: boolean;
  api_url?: string;
  username?: string;
  api_key?: string;
}

interface Post {
  id: number;
  title: string;
  content?: string;
  category?: string;
  created_at: string;
  views?: number;
  status: string;
}

interface BlogSelection {
  blog_id: number;
  category_id?: number;
  status?: string;
  include_adsense?: boolean;
}

export default function WordPressPage() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [blogFilter, setBlogFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [modalBlogId, setModalBlogId] = useState('');
  const [modalStatus, setModalStatus] = useState('publish');
  const [modalAdsense, setModalAdsense] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter posts when filters change
  useEffect(() => {
    filterPosts();
  }, [blogFilter, statusFilter, searchQuery, allPosts]);

  // Load all data
  async function loadData() {
    await Promise.all([
      loadWordPressBlogs(),
      loadPosts(),
    ]);
  }

  // Load WordPress blogs
  async function loadWordPressBlogs() {
    try {
      const response = await fetch('/api/blogs');
      const blogs = await response.json();
      const wpBlogs = blogs.filter((b: Blog) => b.platform === 'wordpress' && b.is_active);
      setAllBlogs(wpBlogs);
    } catch (error) {
      console.error('Error loading blogs:', error);
    }
  }

  // Load posts
  async function loadPosts() {
    try {
      const response = await fetch('/api/posts');
      const posts = await response.json();
      setAllPosts(posts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }

  // Filter posts
  function filterPosts() {
    let filtered = [...allPosts];

    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }

  // Test connection
  async function testConnection(blogId: number) {
    try {
      const blogResponse = await fetch(`/api/blogs/${blogId}`);
      const blog = await blogResponse.json();

      const response = await fetch('/api/wordpress/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_url: blog.api_url,
          username: blog.username,
          app_password: blog.api_key
        })
      });

      const result = await response.json();
      alert(result.success ? '✅ 연결 성공!' : '❌ 연결 실패: ' + result.message);
    } catch (error) {
      alert('❌ 연결 테스트 오류: ' + (error as Error).message);
    }
  }

  // Sync categories
  async function syncCategories(blogId: number) {
    if (!confirm('WordPress의 카테고리를 로컬로 가져오시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch('/api/wordpress/sync-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blog_id: blogId })
      });

      const result = await response.json();
      alert(result.success ? `✅ ${result.message}` : '❌ 동기화 실패');
    } catch (error) {
      alert('❌ 오류 발생: ' + (error as Error).message);
    }
  }

  // Open publish modal
  function openPublishModal(postId: number) {
    if (allBlogs.length === 0) {
      alert('등록된 WordPress 블로그가 없습니다.\n설정 페이지에서 WordPress 블로그를 먼저 추가해주세요.');
      window.location.href = '/settings';
      return;
    }

    setSelectedPostId(postId);
    setModalBlogId(allBlogs[0].id.toString());
    setModalStatus('publish');
    setModalAdsense(false);
    setShowModal(true);
  }

  // Publish to WordPress
  async function publishToWordPress() {
    if (!selectedPostId) return;

    try {
      const response = await fetch('/api/wordpress/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: selectedPostId,
          blog_id: parseInt(modalBlogId),
          status: modalStatus,
          include_adsense: modalAdsense
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ WordPress 발행 성공!\n${result.wp_post_url}`);
        if (result.wp_post_url) {
          await navigator.clipboard.writeText(result.wp_post_url);
          console.log('URL이 클립보드에 복사되었습니다');
        }
        loadData(); // Refresh data
      } else {
        alert('❌ 발행 실패: ' + result.message);
      }
    } catch (error) {
      alert('❌ 오류 발생: ' + (error as Error).message);
    }

    setShowModal(false);
  }

  // View post
  function viewPost(postId: number) {
    window.open(`/posts?id=${postId}`, '_blank');
  }

  const totalBlogs = allBlogs.length;
  const totalPosts = allPosts.length;

  return (
    <AppLayout>
        <div className="wordpress-container">
          {/* Header */}
          <div className="wordpress-header">
            <h1>
              <i className="fab fa-wordpress"></i>
              WordPress 발행 관리
            </h1>
            <p>등록된 WordPress 블로그에 글을 발행하고 관리하세요</p>
          </div>

          {/* Stats */}
          <div className="wp-stats">
            <div className="wp-stat-card">
              <h3>등록된 블로그</h3>
              <div className="value">{totalBlogs}</div>
            </div>
            <div className="wp-stat-card">
              <h3>발행 가능한 글</h3>
              <div className="value">{totalPosts}</div>
            </div>
            <div className="wp-stat-card">
              <h3>총 발행 횟수</h3>
              <div className="value">0</div>
            </div>
            <div className="wp-stat-card">
              <h3>발행 성공률</h3>
              <div className="value">100%</div>
            </div>
          </div>

          {/* WordPress Blogs Section */}
          <div className="wp-blogs-section">
            <h2>
              <i className="fab fa-wordpress"></i>
              등록된 WordPress 블로그
            </h2>
            <div id="wp-blogs-list">
              {allBlogs.length === 0 ? (
                <div className="empty-state">
                  <i className="fab fa-wordpress"></i>
                  <h3>등록된 WordPress 블로그가 없습니다</h3>
                  <p>설정 페이지에서 WordPress 블로그를 추가해주세요</p>
                  <Link href="/settings" className="wp-btn wp-btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
                    <i className="fas fa-cog"></i> 설정으로 이동
                  </Link>
                </div>
              ) : (
                allBlogs.map(blog => (
                  <div key={blog.id} className="wp-blog-card">
                    <div className="wp-blog-info">
                      <h3>{blog.name}</h3>
                      <p><i className="fas fa-link"></i> {blog.url || '미설정'}</p>
                    </div>
                    <div className="wp-blog-actions">
                      <button className="wp-btn wp-btn-secondary" onClick={() => testConnection(blog.id)}>
                        <i className="fas fa-check-circle"></i> 연결 테스트
                      </button>
                      <button className="wp-btn wp-btn-secondary" onClick={() => syncCategories(blog.id)}>
                        <i className="fas fa-sync"></i> 카테고리 동기화
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Posts Section */}
          <div className="wp-blogs-section">
            <h2>
              <i className="fas fa-file-alt"></i>
              발행 가능한 글
            </h2>

            <div className="filter-bar">
              <select
                className="filter-select"
                value={blogFilter}
                onChange={(e) => setBlogFilter(e.target.value)}
              >
                <option value="">모든 블로그</option>
                {allBlogs.map(blog => (
                  <option key={blog.id} value={blog.id}>{blog.name}</option>
                ))}
              </select>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">모든 상태</option>
                <option value="draft">초안</option>
                <option value="published">발행됨</option>
              </select>
              <input
                type="text"
                className="search-box"
                placeholder="글 제목 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="posts-grid">
              {filteredPosts.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-file-alt"></i>
                  <h3>발행 가능한 글이 없습니다</h3>
                  <p>에디터에서 새로운 글을 작성해보세요</p>
                  <Link href="/editor" className="wp-btn wp-btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
                    <i className="fas fa-pen"></i> 글 작성하기
                  </Link>
                </div>
              ) : (
                filteredPosts.map(post => {
                  const preview = post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '';
                  const statusClass = post.status === 'published' ? 'status-published' : 'status-draft';

                  return (
                    <div key={post.id} className="post-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <h3>{post.title}</h3>
                        <span className={`publish-status ${statusClass}`}>
                          {post.status === 'published' ? '발행됨' : '초안'}
                        </span>
                      </div>
                      <div className="post-meta">
                        <span><i className="fas fa-folder"></i> {post.category || '미분류'}</span>
                        <span><i className="fas fa-calendar"></i> {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                        <span><i className="fas fa-eye"></i> {post.views || 0}</span>
                      </div>
                      <div className="post-content-preview">{preview}</div>
                      <div className="post-actions">
                        <button className="wp-btn wp-btn-primary" onClick={() => openPublishModal(post.id)}>
                          <i className="fab fa-wordpress"></i> WordPress 발행
                        </button>
                        <button className="wp-btn wp-btn-secondary" onClick={() => viewPost(post.id)}>
                          <i className="fas fa-eye"></i> 미리보기
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      {/* Publish Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ marginBottom: '24px', fontSize: '24px', color: '#000' }}>WordPress 발행</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>블로그 선택</label>
              <select
                value={modalBlogId}
                onChange={(e) => setModalBlogId(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              >
                {allBlogs.map(blog => (
                  <option key={blog.id} value={blog.id}>{blog.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>발행 상태</label>
              <select
                value={modalStatus}
                onChange={(e) => setModalStatus(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px' }}
              >
                <option value="publish">즉시 발행</option>
                <option value="draft">초안으로 저장</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={modalAdsense}
                  onChange={(e) => setModalAdsense(e.target.checked)}
                />
                <span>애드센스 광고 자동 삽입</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={publishToWordPress}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#21759b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                발행
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f5f5f5',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .wordpress-container {
          padding: 40px;
        }

        .wordpress-header {
          background: linear-gradient(135deg, #21759b 0%, #1e6a8d 100%);
          border-radius: var(--radius-lg);
          padding: 40px;
          margin-bottom: 32px;
          box-shadow: var(--shadow-md);
          color: white;
        }

        .wordpress-header h1 {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .wordpress-header p {
          font-size: 16px;
          opacity: 0.9;
        }

        .wp-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .wp-stat-card {
          background: var(--secondary);
          border: 2px solid var(--gray-300);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow-sm);
        }

        .wp-stat-card h3 {
          font-size: 14px;
          color: var(--gray-600);
          margin-bottom: 8px;
          font-weight: 500;
        }

        .wp-stat-card .value {
          font-size: 28px;
          font-weight: 700;
          color: #21759b;
        }

        .wp-blogs-section {
          background: var(--secondary);
          border: 2px solid var(--gray-300);
          border-radius: var(--radius-lg);
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: var(--shadow-sm);
        }

        .wp-blogs-section h2 {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wp-blog-card {
          background: var(--gray-50);
          border: 2px solid var(--gray-200);
          border-radius: var(--radius);
          padding: 20px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: var(--transition);
        }

        .wp-blog-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .wp-blog-info h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 6px;
        }

        .wp-blog-info p {
          font-size: 14px;
          color: var(--gray-600);
        }

        .wp-blog-actions {
          display: flex;
          gap: 10px;
        }

        .wp-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
        }

        .wp-btn-primary {
          background: #21759b;
          color: white;
        }

        .wp-btn-primary:hover {
          background: #1e6a8d;
        }

        .wp-btn-secondary {
          background: var(--gray-200);
          color: var(--gray-800);
        }

        .wp-btn-secondary:hover {
          background: var(--gray-300);
        }

        .posts-grid {
          display: grid;
          gap: 20px;
        }

        .post-card {
          background: var(--secondary);
          border: 2px solid var(--gray-300);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }

        .post-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .post-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 12px;
        }

        .post-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          font-size: 13px;
          color: var(--gray-600);
        }

        .post-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .post-content-preview {
          font-size: 14px;
          color: var(--gray-600);
          line-height: 1.6;
          margin-bottom: 16px;
          max-height: 60px;
          overflow: hidden;
        }

        .post-actions {
          display: flex;
          gap: 10px;
        }

        .publish-status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-published {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-draft {
          background: #fff3e0;
          color: #ef6c00;
        }

        .status-pending {
          background: #e3f2fd;
          color: #1976d2;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--gray-600);
        }

        .empty-state i {
          font-size: 64px;
          opacity: 0.3;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 600;
          color: var(--gray-800);
          margin-bottom: 8px;
        }

        .filter-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          align-items: center;
        }

        .filter-select {
          padding: 10px 16px;
          border: 2px solid var(--gray-300);
          border-radius: 8px;
          font-size: 14px;
          background: var(--secondary);
          color: var(--primary);
          cursor: pointer;
        }

        .search-box {
          flex: 1;
          padding: 10px 16px;
          border: 2px solid var(--gray-300);
          border-radius: 8px;
          font-size: 14px;
          background: var(--secondary);
          color: var(--primary);
        }

        .main-content {
          padding: 0;
        }
      `}</style>
    </AppLayout>
  );
}

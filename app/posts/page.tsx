'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

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

interface CurrentFilter {
  type: 'all' | 'blog' | 'category';
  blogId?: number;
  categoryId?: number;
}

const API_BASE_URL = 'http://localhost:5001/api';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [currentFilter, setCurrentFilter] = useState<CurrentFilter>({ type: 'all' });
  const [activeFilterTab, setActiveFilterTab] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showBlogManageModal, setShowBlogManageModal] = useState(false);
  const [currentViewTitle, setCurrentViewTitle] = useState('전체 글');
  const [currentViewSubtitle, setCurrentViewSubtitle] = useState('작성한 글들을 관리하세요');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [activeTreeNode, setActiveTreeNode] = useState<string>('all');
  const [manageTab, setManageTab] = useState<'blogs' | 'categories'>('blogs');
  const [selectedBlogForCategories, setSelectedBlogForCategories] = useState<number | null>(null);

  // Load blogs from API
  const loadBlogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs`);
      if (!response.ok) throw new Error('Failed to load blogs');
      const blogsData = await response.json();

      // Load categories for each blog
      for (let blog of blogsData) {
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories?blog_id=${blog.id}`);
        if (categoriesResponse.ok) {
          blog.categories = await categoriesResponse.json();
        } else {
          blog.categories = [];
        }
      }

      setBlogs(blogsData);
      if (blogsData.length > 0 && !selectedBlogForCategories) {
        setSelectedBlogForCategories(blogsData[0].id);
      }
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
      const response = await fetch(`${API_BASE_URL}/posts`);
      const result = await response.json();

      if (Array.isArray(result)) {
        const backendPosts = result.map(post => ({
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

  // Initialize blogs on mount
  useEffect(() => {
    const initializeBlogs = async () => {
      const blogsData = await loadBlogs();
      if (blogsData.length === 0) {
        const defaultBlog = {
          name: "내 블로그",
          url: "",
          platform: "default",
          description: "나의 첫 블로그"
        };

        try {
          const response = await fetch(`${API_BASE_URL}/blogs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(defaultBlog)
          });

          if (response.ok) {
            const createdBlog = await response.json();

            const defaultCategories = [
              { blog_id: createdBlog.id, name: "임시 저장", parent_id: null, order: 0 },
              { blog_id: createdBlog.id, name: "개발", parent_id: null, order: 1 },
              { blog_id: createdBlog.id, name: "일상", parent_id: null, order: 2 }
            ];

            for (let cat of defaultCategories) {
              await fetch(`${API_BASE_URL}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cat)
              });
            }

            await loadBlogs();
          }
        } catch (error) {
          console.error('Error initializing default blog:', error);
        }
      }
    };

    initializeBlogs();
    loadPosts();
  }, []);

  // Get filtered and sorted posts
  const getFilteredPosts = () => {
    let filtered = [...posts];

    // Apply current filter
    if (currentFilter.type === 'blog') {
      filtered = filtered.filter(p => p.blogId === currentFilter.blogId);
    } else if (currentFilter.type === 'category') {
      filtered = filtered.filter(p =>
        p.blogId === currentFilter.blogId &&
        p.categoryId === currentFilter.categoryId
      );
    }

    // Apply status filter
    if (activeFilterTab !== 'all') {
      filtered = filtered.filter(post => post.status === activeFilterTab);
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

  // Statistics
  const totalPosts = posts.length;
  const draftCount = posts.filter(p => p.status !== 'published').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;

  // Delete post
  const deletePost = async (postId: string | number) => {
    if (!confirm('정말로 이 글을 삭제하시겠습니까?')) return;

    try {
      if (String(postId).startsWith('backend-')) {
        const realId = String(postId).replace('backend-', '');
        const response = await fetch(`${API_BASE_URL}/posts/${realId}`, {
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

  // Toggle tree node
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Filter handlers
  const filterByAll = () => {
    setCurrentFilter({ type: 'all' });
    setActiveTreeNode('all');
    setCurrentViewTitle('전체 글');
    setCurrentViewSubtitle('모든 글을 관리하세요');
  };

  const filterByBlog = (blogId: number) => {
    const blog = blogs.find(b => b.id === blogId);
    if (blog) {
      setCurrentFilter({ type: 'blog', blogId });
      setActiveTreeNode(`blog-${blogId}`);
      setCurrentViewTitle(blog.name);
      setCurrentViewSubtitle(`${blog.name}의 글들`);
    }
  };

  const filterByCategory = (blogId: number, categoryId: number) => {
    const blog = blogs.find(b => b.id === blogId);
    const category = blog?.categories.find(c => c.id === categoryId);
    if (blog && category) {
      setCurrentFilter({ type: 'category', blogId, categoryId });
      setActiveTreeNode(`cat-${blogId}-${categoryId}`);
      setCurrentViewTitle(category.name);
      setCurrentViewSubtitle(`${blog.name} > ${category.name}`);
    }
  };

  // Render category tree recursively
  const renderCategoryNode = (blogId: number, category: Category, allCategories: Category[], level: number = 0): JSX.Element => {
    const categoryPosts = posts.filter(p => p.categoryId === category.id && p.blogId === blogId);
    const nodeId = `cat-${blogId}-${category.id}`;
    const children = allCategories.filter(c => (c.parentId || c.parent_id) === category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(nodeId);
    const isActive = activeTreeNode === nodeId;

    return (
      <div key={nodeId} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`tree-node ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (hasChildren) toggleNode(nodeId);
            filterByCategory(blogId, category.id);
          }}
        >
          {hasChildren ? (
            <i className={`fas fa-chevron-right toggle ${isExpanded ? 'expanded' : ''}`}></i>
          ) : (
            <span style={{ width: '12px', display: 'inline-block' }}></span>
          )}
          <i className={`fas fa-folder${category.isDefault ? '-open' : ''} icon`}></i>
          <span className="tree-node-label">{category.name}</span>
          <span className="tree-node-count">{categoryPosts.length}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="tree-children expanded">
            {children.map(child => renderCategoryNode(blogId, child, allCategories, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredPosts = getFilteredPosts();

  return (
    <AppLayout>
      <div className="page-container" style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 80px)' }}>
        {/* Left Tree Navigation */}
        <div className="tree-navigation" style={{
          width: '300px',
          background: 'var(--secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          overflowY: 'auto',
          border: '2px solid var(--gray-300)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
              <i className="fas fa-folder-tree"></i> 블로그 & 카테고리
            </h2>
            <button
              onClick={() => setShowBlogManageModal(true)}
              style={{
                background: 'var(--primary)',
                color: 'var(--secondary)',
                border: 'none',
                padding: '8px 12px',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
          <div id="tree-view">
            {/* All posts node */}
            <div className="tree-item">
              <div
                className={`tree-node ${activeTreeNode === 'all' ? 'active' : ''}`}
                onClick={filterByAll}
              >
                <i className="fas fa-folder icon"></i>
                <span className="tree-node-label">전체 글</span>
                <span className="tree-node-count">{totalPosts}</span>
              </div>
            </div>

            {/* Blogs */}
            {blogs.map(blog => {
              const blogPosts = posts.filter(p => p.blogId === blog.id || !p.blogId);
              const blogId = `blog-${blog.id}`;
              const isExpanded = expandedNodes.has(blogId);
              const isActive = activeTreeNode === blogId;

              return (
                <div key={blog.id} className="tree-item">
                  <div
                    className={`tree-node ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      toggleNode(blogId);
                      filterByBlog(blog.id);
                    }}
                  >
                    <i className={`fas fa-chevron-right toggle ${isExpanded ? 'expanded' : ''}`}></i>
                    <i className="fas fa-blog icon"></i>
                    <span className="tree-node-label">{blog.name}</span>
                    <span className="tree-node-count">{blogPosts.length}</span>
                  </div>
                  {isExpanded && (
                    <div className="tree-children expanded">
                      {blog.categories
                        .filter(c => !(c.parentId || c.parent_id))
                        .map(category => renderCategoryNode(blog.id, category, blog.categories, 0))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Posts List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <h1 className="page-title">
            <i className="fas fa-file-alt"></i> <span>{currentViewTitle}</span>
          </h1>
          <p className="page-subtitle">{currentViewSubtitle}</p>

          {/* Statistics Bar */}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-number">{totalPosts}</span>
              <span>총 글</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{draftCount}</span>
              <span>초안</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{publishedCount}</span>
              <span>발행됨</span>
            </div>
          </div>

          {/* Search and Sort Bar */}
          <div className="controls-bar" style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="제목이나 내용으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 16px',
                  border: '2px solid var(--gray-300)',
                  borderRadius: '24px',
                  fontSize: '14px'
                }}
              />
              <i className="fas fa-search" style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-500)'
              }}></i>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              style={{
                padding: '12px 16px',
                border: '2px solid var(--gray-300)',
                borderRadius: '24px',
                fontSize: '14px',
                cursor: 'pointer',
                background: 'var(--secondary)'
              }}
            >
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="title">제목순</option>
            </select>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <div
              className={`filter-tab ${activeFilterTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilterTab('all')}
            >
              전체 <span>{totalPosts}</span>
            </div>
            <div
              className={`filter-tab ${activeFilterTab === 'draft' ? 'active' : ''}`}
              onClick={() => setActiveFilterTab('draft')}
            >
              초안 <span>{draftCount}</span>
            </div>
            <div
              className={`filter-tab ${activeFilterTab === 'published' ? 'active' : ''}`}
              onClick={() => setActiveFilterTab('published')}
            >
              발행됨 <span>{publishedCount}</span>
            </div>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-file-alt"></i>
              <h3>아직 작성한 글이 없습니다</h3>
              <p>AI 에디터로 첫 글을 작성해보세요!</p>
              <br />
              <Link href="/editor" className="btn btn-primary">
                <i className="fas fa-pen"></i> 새 글 쓰기
              </Link>
            </div>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map(post => {
                const date = new Date(post.updatedAt || post.createdAt).toLocaleDateString('ko-KR');
                const contentPreview = post.content ?
                  post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' :
                  '내용 없음';
                const statusClass = post.status === 'published' ? 'published' : 'draft';
                const statusText = post.status === 'published' ? '발행됨' : '초안';

                return (
                  <div
                    key={post.id}
                    className="post-card"
                    data-post-id={post.id}
                    data-status={post.status}
                    onClick={() => {
                      setSelectedPost(post);
                      setShowPreview(true);
                    }}
                  >
                    <h3 className="post-title">{post.title || '제목 없음'}</h3>
                    <div className="post-meta">
                      <span>{date}</span>
                      <span className={`post-status ${statusClass}`}>{statusText}</span>
                    </div>
                    <div className="post-content-preview">{contentPreview}</div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '14px', color: 'var(--gray-600)' }}>
                      <span><i className="fas fa-eye"></i> {(post.views || 0).toLocaleString()}</span>
                      <span><i className="fas fa-heart"></i> {(post.likes || 0).toLocaleString()}</span>
                    </div>
                    <div className="post-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="post-btn edit"
                        onClick={() => window.location.href = `/editor?id=${post.id}`}
                      >
                        <i className="fas fa-edit"></i> 편집
                      </button>
                      <button
                        className="post-btn wordpress"
                        style={{ background: '#21759b', color: 'white' }}
                        onClick={() => alert('WordPress 발행 기능 준비 중')}
                      >
                        <i className="fab fa-wordpress"></i> WordPress
                      </button>
                      <button
                        className="post-btn delete"
                        onClick={() => deletePost(post.id)}
                      >
                        <i className="fas fa-trash"></i> 삭제
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedPost && (
        <div className="preview-modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h2><i className="fas fa-eye"></i> 미리보기</h2>
              <button className="preview-close-btn" onClick={() => setShowPreview(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="preview-content">
              <h1 className="preview-title">{selectedPost.title || '제목 없음'}</h1>
              <div className="preview-meta">
                <div className="preview-meta-item">
                  <i className="fas fa-calendar"></i>
                  <span>{new Date(selectedPost.updatedAt || selectedPost.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="preview-meta-item">
                  <i className="fas fa-tag"></i>
                  <span className={`post-status ${selectedPost.status === 'published' ? 'published' : 'draft'}`}>
                    {selectedPost.status === 'published' ? '발행됨' : '초안'}
                  </span>
                </div>
              </div>
              <div className="preview-body" dangerouslySetInnerHTML={{ __html: selectedPost.content || '<p style="color: var(--gray-500);">내용이 없습니다.</p>' }} />
            </div>
            <div className="preview-footer">
              <button
                className="preview-action-btn edit"
                onClick={() => {
                  setShowPreview(false);
                  window.location.href = `/editor?id=${selectedPost.id}`;
                }}
              >
                <i className="fas fa-edit"></i> 편집하기
              </button>
              <button
                className="preview-action-btn delete"
                onClick={() => {
                  setShowPreview(false);
                  deletePost(selectedPost.id);
                }}
              >
                <i className="fas fa-trash"></i> 삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .page-container {
          padding: 40px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--primary);
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .page-subtitle {
          font-size: 16px;
          color: var(--gray-600);
          margin: 0 0 32px 0;
        }

        .stats-bar {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--gray-600);
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
        }

        .filter-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 2px solid var(--gray-300);
          padding-bottom: 12px;
        }

        .filter-tab {
          padding: 8px 20px;
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-600);
          cursor: pointer;
          border-radius: 20px;
          transition: var(--transition);
        }

        .filter-tab:hover {
          background: var(--gray-100);
        }

        .filter-tab.active {
          background: var(--primary);
          color: var(--secondary);
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
          margin-top: 32px;
        }

        .post-card {
          background: var(--secondary);
          border: 2px solid var(--gray-300);
          border-radius: var(--radius);
          padding: 24px;
          cursor: pointer;
          transition: var(--transition);
        }

        .post-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .post-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .post-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 14px;
          color: var(--gray-600);
        }

        .post-status {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .post-status.draft {
          background: var(--gray-200);
          color: var(--gray-700);
        }

        .post-status.published {
          background: var(--primary);
          color: var(--secondary);
        }

        .post-content-preview {
          font-size: 14px;
          color: var(--gray-600);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .post-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .post-btn {
          padding: 6px 12px;
          font-size: 12px;
          border-radius: 12px;
          border: 1px solid var(--gray-300);
          background: var(--secondary);
          color: var(--gray-700);
          cursor: pointer;
          transition: var(--transition);
        }

        .post-btn:hover {
          background: var(--gray-100);
        }

        .post-btn.delete {
          border-color: var(--danger);
          color: var(--danger);
        }

        .post-btn.delete:hover {
          background: var(--danger);
          color: var(--secondary);
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: var(--gray-500);
        }

        .empty-state i {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.3;
        }

        .btn-primary {
          padding: 12px 24px;
          background: var(--primary);
          color: var(--secondary);
          border: none;
          border-radius: var(--radius);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .btn-primary:hover {
          background: var(--gray-800);
          transform: translateY(-2px);
        }

        .tree-node {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: var(--radius);
          cursor: pointer;
          transition: var(--transition);
          font-size: 14px;
          user-select: none;
        }

        .tree-node:hover {
          background: var(--gray-100);
        }

        .tree-node.active {
          background: var(--primary);
          color: var(--secondary);
          font-weight: 600;
        }

        .tree-node i.toggle {
          margin-right: 6px;
          font-size: 10px;
          transition: transform 0.2s;
          width: 12px;
        }

        .tree-node i.toggle.expanded {
          transform: rotate(90deg);
        }

        .tree-node i.icon {
          margin-right: 8px;
        }

        .tree-children {
          display: none;
        }

        .tree-children.expanded {
          display: block;
        }

        .tree-node-label {
          flex: 1;
        }

        .tree-node-count {
          font-size: 11px;
          background: var(--gray-200);
          padding: 2px 8px;
          border-radius: 10px;
          margin-left: 8px;
        }

        .tree-node.active .tree-node-count {
          background: var(--secondary);
          color: var(--primary);
        }

        .preview-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .preview-modal {
          background: var(--secondary);
          border-radius: var(--radius-lg);
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .preview-header {
          padding: 24px 28px;
          background: var(--primary);
          color: var(--secondary);
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid var(--gray-300);
        }

        .preview-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .preview-close-btn {
          background: transparent;
          border: 2px solid var(--secondary);
          color: var(--secondary);
          width: 36px;
          height: 36px;
          border-radius: var(--radius);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .preview-close-btn:hover {
          background: var(--secondary);
          color: var(--primary);
        }

        .preview-content {
          padding: 32px;
          overflow-y: auto;
          flex: 1;
        }

        .preview-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .preview-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid var(--gray-200);
          font-size: 14px;
          color: var(--gray-600);
        }

        .preview-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .preview-body {
          font-size: 16px;
          line-height: 1.8;
          color: var(--gray-900);
        }

        .preview-footer {
          padding: 20px 28px;
          background: var(--gray-100);
          border-top: 2px solid var(--gray-200);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .preview-action-btn {
          padding: 12px 24px;
          border-radius: var(--radius);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          border: none;
        }

        .preview-action-btn.edit {
          background: var(--primary);
          color: var(--secondary);
        }

        .preview-action-btn.edit:hover {
          background: var(--gray-900);
        }

        .preview-action-btn.delete {
          background: var(--secondary);
          color: var(--danger);
          border: 1px solid var(--danger);
        }

        .preview-action-btn.delete:hover {
          background: var(--danger);
          color: var(--secondary);
        }

        @media (max-width: 768px) {
          .posts-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .stats-bar {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </AppLayout>
  );
}

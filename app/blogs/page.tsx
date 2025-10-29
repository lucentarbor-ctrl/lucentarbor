'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await loadData();
      } catch (error: any) {
        console.error('Failed to load data:', error);
        setError(error.message || '데이터를 불러오는 중 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
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
      const result = await response.json();
      const blogs = result.data || [];
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
      const result = await response.json();
      const posts = result.data || [];
      setAllPosts(posts);
    } catch (error) {
      console.error('Error loading posts:', error);
      setAllPosts([]);
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

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'WordPress', href: '/blogs' }
  ];

  // 로딩 상태
  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSpinner
          size="lg"
          message="WordPress 데이터를 불러오는 중..."
        />
      </AppLayout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <AppLayout>
        <ErrorMessage
          title="데이터 로드 실패"
          message={error}
          onRetry={() => {
            setError(null);
            setIsLoading(true);
            loadData().finally(() => setIsLoading(false));
          }}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="WordPress 발행 관리"
        breadcrumbs={breadcrumbs}
      />

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            등록된 블로그
          </h3>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#21759b'
          }}>
            {totalBlogs}
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            발행 가능한 글
          </h3>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#21759b'
          }}>
            {totalPosts}
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            총 발행 횟수
          </h3>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#21759b'
          }}>
            0
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            발행 성공률
          </h3>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#21759b'
          }}>
            100%
          </div>
        </div>
      </div>

      {/* WordPress Blogs Section */}
      <div style={{
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <i className="fab fa-wordpress"></i>
          등록된 WordPress 블로그
        </h2>

        {allBlogs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6b7280'
          }}>
            <i className="fab fa-wordpress" style={{
              fontSize: '64px',
              opacity: 0.3,
              marginBottom: '16px',
              display: 'block'
            }}></i>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              등록된 WordPress 블로그가 없습니다
            </h3>
            <p>설정 페이지에서 WordPress 블로그를 추가해주세요</p>
            <Link
              href="/settings"
              style={{
                marginTop: '16px',
                display: 'inline-block',
                padding: '10px 20px',
                background: '#21759b',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              <i className="fas fa-cog"></i> 설정으로 이동
            </Link>
          </div>
        ) : (
          allBlogs.map(blog => (
            <div key={blog.id} style={{
              background: '#f9fafb',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.3s ease'
            }}>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '6px'
                }}>
                  {blog.name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <i className="fas fa-link"></i> {blog.url || '미설정'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => testConnection(blog.id)}
                  style={{
                    padding: '10px 20px',
                    background: '#e5e7eb',
                    color: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <i className="fas fa-check-circle"></i> 연결 테스트
                </button>
                <button
                  onClick={() => syncCategories(blog.id)}
                  style={{
                    padding: '10px 20px',
                    background: '#e5e7eb',
                    color: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <i className="fas fa-sync"></i> 카테고리 동기화
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Posts Section */}
      <div style={{
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <i className="fas fa-file-alt"></i>
          발행 가능한 글
        </h2>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          alignItems: 'center'
        }}>
          <select
            value={blogFilter}
            onChange={(e) => setBlogFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white',
              color: '#111827',
              cursor: 'pointer'
            }}
          >
            <option value="">모든 블로그</option>
            {allBlogs.map(blog => (
              <option key={blog.id} value={blog.id}>{blog.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white',
              color: '#111827',
              cursor: 'pointer'
            }}
          >
            <option value="">모든 상태</option>
            <option value="draft">초안</option>
            <option value="published">발행됨</option>
          </select>

          <input
            type="text"
            placeholder="글 제목 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white',
              color: '#111827'
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gap: '20px'
        }}>
          {filteredPosts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <i className="fas fa-file-alt" style={{
                fontSize: '64px',
                opacity: 0.3,
                marginBottom: '16px',
                display: 'block'
              }}></i>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                발행 가능한 글이 없습니다
              </h3>
              <p>에디터에서 새로운 글을 작성해보세요</p>
              <Link
                href="/editor"
                style={{
                  marginTop: '16px',
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: '#21759b',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                <i className="fas fa-pen"></i> 글 작성하기
              </Link>
            </div>
          ) : (
            filteredPosts.map(post => {
              const preview = post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '';
              const statusStyle = post.status === 'published'
                ? { background: '#e8f5e9', color: '#2e7d32' }
                : { background: '#fff3e0', color: '#ef6c00' };

              return (
                <div key={post.id} style={{
                  background: 'white',
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '12px'
                  }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      {post.title}
                    </h3>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      ...statusStyle
                    }}>
                      {post.status === 'published' ? '발행됨' : '초안'}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    color: '#6b7280'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fas fa-folder"></i> {post.category || '미분류'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fas fa-calendar"></i> {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fas fa-eye"></i> {post.views || 0}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    marginBottom: '16px',
                    maxHeight: '60px',
                    overflow: 'hidden'
                  }}>
                    {preview}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => openPublishModal(post.id)}
                      style={{
                        padding: '10px 20px',
                        background: '#21759b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      <i className="fab fa-wordpress"></i> WordPress 발행
                    </button>
                    <button
                      onClick={() => viewPost(post.id)}
                      style={{
                        padding: '10px 20px',
                        background: '#e5e7eb',
                        color: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      <i className="fas fa-eye"></i> 미리보기
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Publish Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{
              marginBottom: '24px',
              fontSize: '24px',
              color: '#111827'
            }}>
              WordPress 발행
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 500,
                color: '#374151'
              }}>
                블로그 선택
              </label>
              <select
                value={modalBlogId}
                onChange={(e) => setModalBlogId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px'
                }}
              >
                {allBlogs.map(blog => (
                  <option key={blog.id} value={blog.id}>{blog.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 500,
                color: '#374151'
              }}>
                발행 상태
              </label>
              <select
                value={modalStatus}
                onChange={(e) => setModalStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px'
                }}
              >
                <option value="publish">즉시 발행</option>
                <option value="draft">초안으로 저장</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
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
    </AppLayout>
  );
}

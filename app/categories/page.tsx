'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';

interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number | null;
  blogId?: number | null;
  order: number;
  postCount: number;
  children: Category[];
  blog?: {
    id: number;
    name: string;
    platform: string;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: null as number | null,
    blogId: null as number | null,
    order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('카테고리를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = '/api/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingCategory
            ? { id: editingCategory.id, ...formData }
            : formData
        )
      });

      const data = await response.json();

      if (data.success) {
        alert(editingCategory ? '카테고리가 수정되었습니다.' : '카테고리가 생성되었습니다.');
        setShowAddModal(false);
        setEditingCategory(null);
        resetForm();
        fetchCategories();
      } else {
        alert(data.error || '작업에 실패했습니다.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('작업 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm('정말 이 카테고리를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/categories?id=${categoryId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('카테고리가 삭제되었습니다.');
        fetchCategories();
      } else {
        alert(data.error || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || null,
      blogId: category.blogId || null,
      order: category.order
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentId: null,
      blogId: null,
      order: 0
    });
  };

  const renderCategoryTree = (cats: Category[], level: number = 0) => {
    return cats.map((cat) => (
      <div key={cat.id}>
        <div style={{
          padding: '16px',
          marginLeft: level * 32 + 'px',
          background: level % 2 === 0 ? '#ffffff' : '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="fas fa-folder" style={{ color: '#8b5cf6' }}></i>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                {cat.name}
              </span>
              <span style={{
                padding: '2px 8px',
                background: '#e0e7ff',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#4f46e5',
                fontWeight: '600'
              }}>
                {cat.postCount} 글
              </span>
              {cat.blog && (
                <span style={{
                  padding: '2px 8px',
                  background: '#fef3c7',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#92400e'
                }}>
                  {cat.blog.name}
                </span>
              )}
            </div>
            {cat.description && (
              <div style={{
                fontSize: '13px',
                color: '#6b7280',
                marginTop: '4px',
                marginLeft: '28px'
              }}>
                {cat.description}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleEdit(cat)}
              style={{
                padding: '6px 12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)'
              }}
            >
              <i className="fas fa-edit"></i> 수정
            </button>
            <button
              onClick={() => handleDelete(cat.id)}
              disabled={cat.postCount > 0 || cat.children.length > 0}
              style={{
                padding: '6px 12px',
                background: cat.postCount > 0 || cat.children.length > 0
                  ? '#d1d5db'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: cat.postCount > 0 || cat.children.length > 0 ? 'not-allowed' : 'pointer',
                boxShadow: cat.postCount > 0 || cat.children.length > 0
                  ? 'none'
                  : '0 2px 6px rgba(239, 68, 68, 0.3)'
              }}
            >
              <i className="fas fa-trash"></i> 삭제
            </button>
          </div>
        </div>

        {cat.children && cat.children.length > 0 && renderCategoryTree(cat.children, level + 1)}
      </div>
    ));
  };

  return (
    <AppLayout>
      <PageHeader
        title="카테고리 관리"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: '콘텐츠' },
          { label: '카테고리 관리' }
        ]}
        subtitle="네이버 블로그, 티스토리 등 블로그별 카테고리를 계층적으로 관리하세요"
      />

      {/* Actions Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
            전체 카테고리 목록
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
            계층 구조로 카테고리를 관리하고 블로그별로 분류할 수 있습니다
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            resetForm();
            setShowAddModal(true);
          }}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
          <i className="fas fa-plus" style={{ fontSize: '14px' }}></i>
          새 카테고리 추가
        </button>
      </div>

      {/* Categories Tree */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
            <p>카테고리를 불러오는 중...</p>
          </div>
        ) : categories.length === 0 ? (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <i className="fas fa-folder-open" style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}></i>
            <p>등록된 카테고리가 없습니다.</p>
            <p style={{ fontSize: '14px' }}>새 카테고리를 추가해보세요!</p>
          </div>
        ) : (
          renderCategoryTree(categories)
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
              {editingCategory ? '카테고리 수정' : '새 카테고리 추가'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  카테고리 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="예: 기술, 일상, 여행"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="카테고리에 대한 설명을 입력하세요"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border 0.2s',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  정렬 순서
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '32px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  {editingCategory ? '수정하기' : '추가하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

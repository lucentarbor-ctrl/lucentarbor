'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

interface MediaFile {
  id: number;
  filename: string;
  url: string;
  file_size: number;
  width: number;
  height: number;
  is_ai_generated: boolean;
  alt_text?: string;
  ai_prompt?: string;
  ai_model?: string;
}

export default function MediaPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<number>>(new Set());
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiModel, setAiModel] = useState('dalle');
  const [aiSize, setAiSize] = useState('1024x1024');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/media/list');

      if (!response.ok) {
        throw new Error('미디어 목록을 불러오는데 실패했습니다');
      }

      const result = await response.json();

      if (result.status === 'success' && result.data?.files) {
        setMediaFiles(result.data.files);
      } else if (result.status === 'error') {
        throw new Error(result.message || '미디어 데이터 로드 실패');
      } else {
        setMediaFiles([]);
      }
    } catch (error: any) {
      console.error('미디어 로드 실패:', error);
      setError(error.message || '미디어를 불러오는 중 오류가 발생했습니다');
      setMediaFiles([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMedia(mediaId: number, filename: string) {
    if (!confirm(`"${filename}" 파일을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.status === 'success') {
        alert('미디어 파일이 삭제되었습니다.');
        loadMedia();
      } else {
        alert('삭제 실패: ' + (result.message || '알 수 없는 오류'));
      }
    } catch (error: any) {
      console.error('미디어 삭제 오류:', error);
      alert('삭제 중 오류 발생: ' + error.message);
    }
  }

  function toggleMediaSelection(mediaId: number) {
    const newSelected = new Set(selectedMediaIds);
    if (newSelected.has(mediaId)) {
      newSelected.delete(mediaId);
    } else {
      newSelected.add(mediaId);
    }
    setSelectedMediaIds(newSelected);
  }

  function toggleSelectAll() {
    if (selectedMediaIds.size === mediaFiles.length) {
      setSelectedMediaIds(new Set());
    } else {
      setSelectedMediaIds(new Set(mediaFiles.map(f => f.id)));
    }
  }

  async function deleteSelected() {
    if (selectedMediaIds.size === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedMediaIds.size}개 파일을 삭제하시겠습니까?`)) {
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const mediaId of selectedMediaIds) {
      try {
        const response = await fetch(`/api/media/${mediaId}`, {
          method: 'DELETE'
        });

        const result = await response.json();
        if (result.status === 'success') {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`미디어 ${mediaId} 삭제 오류:`, error);
        failCount++;
      }
    }

    if (successCount > 0) {
      alert(`${successCount}개 파일이 삭제되었습니다.${failCount > 0 ? ` (실패: ${failCount}개)` : ''}`);
      setSelectedMediaIds(new Set());
      loadMedia();
    } else {
      alert('파일 삭제에 실패했습니다.');
    }
  }

  function selectMedia(file: MediaFile) {
    const url = file.url;
    const markdown = `![${file.alt_text || file.filename}](${url})`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(markdown);
      alert('이미지 마크다운이 클립보드에 복사되었습니다!');
    } else {
      alert(`마크다운: ${markdown}`);
    }
  }

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }

  async function uploadFile() {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.status === 'success') {
        alert('업로드 완료!');
        closeUploadModal();
        loadMedia();
      } else {
        alert('업로드 실패: ' + result.message);
      }
    } catch (error: any) {
      alert('업로드 중 오류 발생: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function generateAIImage() {
    if (!aiPrompt.trim()) {
      alert('프롬프트를 입력해주세요.');
      return;
    }

    const [width, height] = aiSize.split('x').map(Number);

    try {
      setGenerating(true);

      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          api_type: aiModel,
          width: width,
          height: height,
          num_images: 1
        })
      });

      const result = await response.json();

      if (result.status === 'success' || result.status === 'placeholder') {
        if (result.message) {
          alert(result.message);
        }

        if (result.images && result.images.length > 0) {
          const imageUrl = result.images[0];

          const imageBlob = await fetch(imageUrl).then(r => r.blob());
          const formData = new FormData();
          formData.append('file', imageBlob, `ai-generated-${Date.now()}.png`);
          formData.append('is_ai_generated', 'true');
          formData.append('ai_prompt', aiPrompt);
          formData.append('ai_model', aiModel);

          const uploadResponse = await fetch('/api/media/upload', {
            method: 'POST',
            body: formData
          });

          const uploadResult = await uploadResponse.json();

          if (uploadResult.status === 'success') {
            alert('AI 이미지 생성 및 저장 완료!');
            closeAIModal();
            loadMedia();
          } else {
            alert('이미지 저장 실패: ' + uploadResult.message);
          }
        }
      } else {
        alert('생성 실패: ' + result.message || '알 수 없는 오류');
      }
    } catch (error: any) {
      console.error('AI 이미지 생성 오류:', error);
      alert('생성 중 오류 발생: ' + error.message);
    } finally {
      setGenerating(false);
    }
  }

  function closeUploadModal() {
    setUploadModalOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function closeAIModal() {
    setAiModalOpen(false);
    setAiPrompt('');
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: '미디어', href: '/media' }
  ];

  const actions = (
    <>
      {selectedMediaIds.size > 0 && (
        <>
          <button
            onClick={toggleSelectAll}
            style={{
              padding: '10px 20px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              color: '#111827'
            }}
          >
            <i className="fas fa-check-square" style={{marginRight: '8px'}}></i>
            전체 선택/해제
          </button>
          <button
            onClick={deleteSelected}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <i className="fas fa-trash" style={{marginRight: '8px'}}></i>
            선택 삭제 ({selectedMediaIds.size})
          </button>
        </>
      )}
      <button
        onClick={() => setAiModalOpen(true)}
        style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '14px'
        }}
      >
        <i className="fas fa-magic" style={{marginRight: '8px'}}></i>
        AI 이미지 생성
      </button>
      <button
        onClick={() => setUploadModalOpen(true)}
        style={{
          padding: '10px 20px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '14px'
        }}
      >
        <i className="fas fa-upload" style={{marginRight: '8px'}}></i>
        업로드
      </button>
    </>
  );

  // 로딩 상태
  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinner
          size="lg"
          message="미디어를 불러오는 중..."
        />
      </AppLayout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <AppLayout>
        <ErrorMessage
          title="미디어 로드 실패"
          message={error}
          onRetry={loadMedia}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="미디어 라이브러리"
        breadcrumbs={breadcrumbs}
        actions={actions}
      />

      <div style={{marginTop: '24px'}}>
        {mediaFiles.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {mediaFiles.map(file => {
              const size = (file.file_size / 1024).toFixed(1);
              const isSelected = selectedMediaIds.has(file.id);

              return (
                <div
                  key={file.id}
                  style={{
                    background: 'white',
                    border: isSelected ? '3px solid #3b82f6' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleMediaSelection(file.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      zIndex: 10,
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer'
                    }}
                  />
                  <div
                    onClick={() => selectMedia(file)}
                    style={{
                      width: '100%',
                      height: '200px',
                      background: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={file.url}
                      alt={file.filename}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <div style={{padding: '16px'}}>
                    <div style={{
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '8px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '14px'
                    }}>
                      {file.filename}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span>{size} KB</span>
                      <span>{file.width}x{file.height}</span>
                    </div>
                    {file.is_ai_generated && (
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: '12px'
                      }}>
                        <i className="fas fa-magic"></i> AI 생성
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMedia(file.id, file.filename);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      <i className="fas fa-trash"></i> 삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#9ca3af',
            background: 'white',
            borderRadius: '12px',
            border: '2px dashed #e5e7eb'
          }}>
            <i className="fas fa-images" style={{fontSize: '64px', marginBottom: '20px', opacity: 0.3}}></i>
            <p style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>아직 업로드된 미디어가 없습니다</p>
            <small style={{color: '#6b7280'}}>이미지를 업로드하거나 AI로 생성해보세요</small>
          </div>
        )}
      </div>

      {/* 업로드 모달 */}
      {uploadModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#111827'}}>
              이미지 업로드
            </h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '3px dashed #d1d5db',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              <i className="fas fa-cloud-upload-alt" style={{fontSize: '48px', color: '#9ca3af', marginBottom: '16px', display: 'block'}}></i>
              <p>클릭하거나 파일을 드래그하세요</p>
              <small style={{color: '#6b7280'}}>PNG, JPG, GIF, WebP, SVG (최대 16MB)</small>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {selectedFile && (
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#111827'}}>
                  선택된 파일
                </label>
                <p style={{color: '#6b7280'}}>{selectedFile.name}</p>
              </div>
            )}

            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button
                onClick={closeUploadModal}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                취소
              </button>
              <button
                onClick={uploadFile}
                disabled={!selectedFile || uploading}
                style={{
                  padding: '10px 20px',
                  background: uploading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> 업로드 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload"></i> 업로드
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI 이미지 생성 모달 */}
      {aiModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#111827'}}>
              AI 이미지 생성
            </h2>

            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#111827'}}>
                AI 모델
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="dalle">DALL-E 3 (OpenAI)</option>
                <option value="huggingface">Stable Diffusion (Hugging Face)</option>
                <option value="stability">Stable Diffusion XL (Stability AI)</option>
                <option value="replicate">SDXL (Replicate)</option>
              </select>
              <small style={{color: '#6b7280', marginTop: '4px', display: 'block'}}>
                <i className="fas fa-info-circle"></i> 설정에서 각 모델의 API 키를 등록해야 사용할 수 있습니다.
              </small>
            </div>

            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#111827'}}>
                프롬프트
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="어떤 이미지를 만들고 싶으신가요? (영문으로 입력하세요)"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#111827'}}>
                크기
              </label>
              <select
                value={aiSize}
                onChange={(e) => setAiSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="512x512">512x512</option>
                <option value="1024x1024">1024x1024</option>
                <option value="1792x1024">1792x1024</option>
                <option value="1024x1792">1024x1792</option>
              </select>
            </div>

            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button
                onClick={closeAIModal}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                취소
              </button>
              <button
                onClick={generateAIImage}
                disabled={generating}
                style={{
                  padding: '10px 20px',
                  background: generating ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                {generating ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> 생성 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i> 생성
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

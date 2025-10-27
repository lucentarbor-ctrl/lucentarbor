'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Sidebar from '@/components/Sidebar';

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

export default function MediaRealPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<number>>(new Set());
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiModel, setAiModel] = useState('dalle');
  const [aiSize, setAiSize] = useState('1024x1024');
  const [aiQuality, setAiQuality] = useState('standard');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      const response = await fetch('http://localhost:5001/api/media/list');
      const result = await response.json();

      if (result.status === 'success' && result.data.files.length > 0) {
        setMediaFiles(result.data.files);
      } else {
        setMediaFiles([]);
      }
    } catch (error) {
      console.error('미디어 로드 실패:', error);
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
      const response = await fetch(`http://localhost:5001/api/media/${mediaId}`, {
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
        const response = await fetch(`http://localhost:5001/api/media/${mediaId}`, {
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

  async function deleteAll() {
    if (mediaFiles.length === 0) {
      alert('삭제할 미디어가 없습니다.');
      return;
    }

    if (!confirm(`모든 미디어 파일 ${mediaFiles.length}개를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const file of mediaFiles) {
      try {
        const response = await fetch(`http://localhost:5001/api/media/${file.id}`, {
          method: 'DELETE'
        });

        const result = await response.json();
        if (result.status === 'success') {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`미디어 ${file.id} 삭제 오류:`, error);
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
    const url = `http://localhost:5001${file.url}`;
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

      const response = await fetch('http://localhost:5001/api/media/upload', {
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

      const response = await fetch('http://localhost:5001/api/ai/generate-image', {
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

          const uploadResponse = await fetch('http://localhost:5001/api/media/upload', {
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

  return (
    <div className="app-layout">
      <Sidebar currentPage="media" />

      <div className="main-content">
        <div className="media-container">
          {/* 헤더 */}
          <div className="media-header">
            <h1>
              <i className="fas fa-images"></i>
              미디어 라이브러리
            </h1>
            <div className="header-actions">
              <button className="btn btn-secondary" onClick={() => setAiModalOpen(true)}>
                <i className="fas fa-magic"></i>
                AI 이미지 생성
              </button>
              <button className="btn btn-primary" onClick={() => setUploadModalOpen(true)}>
                <i className="fas fa-upload"></i>
                업로드
              </button>
            </div>
          </div>

          {/* 선택 툴바 */}
          {selectedMediaIds.size > 0 && (
            <div className="selection-toolbar active">
              <div className="selection-info">
                <span>{selectedMediaIds.size}</span>개 항목 선택됨
              </div>
              <div className="selection-actions">
                <button className="btn btn-select-all" onClick={toggleSelectAll}>
                  <i className="fas fa-check-square"></i>
                  전체 선택/해제
                </button>
                <button className="btn btn-danger" onClick={deleteSelected}>
                  <i className="fas fa-trash"></i>
                  선택 삭제
                </button>
                <button className="btn btn-danger" onClick={deleteAll}>
                  <i className="fas fa-trash-alt"></i>
                  전체 삭제
                </button>
              </div>
            </div>
          )}

          {/* 미디어 그리드 */}
          <div className="media-grid">
            {loading ? (
              <div className="loading">미디어를 불러오는 중...</div>
            ) : mediaFiles.length > 0 ? (
              mediaFiles.map(file => {
                const url = `http://localhost:5001${file.url}`;
                const size = (file.file_size / 1024).toFixed(1);
                const isSelected = selectedMediaIds.has(file.id);

                return (
                  <div
                    key={file.id}
                    className={`media-item ${isSelected ? 'selected' : ''}`}
                    data-id={file.id}
                  >
                    <input
                      type="checkbox"
                      className="media-checkbox"
                      checked={isSelected}
                      onChange={() => toggleMediaSelection(file.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="media-preview" onClick={() => selectMedia(file)}>
                      <img src={url} alt={file.filename} />
                    </div>
                    <div className="media-info">
                      <div className="media-filename">{file.filename}</div>
                      <div className="media-meta">
                        <span>{size} KB</span>
                        <span>{file.width}x{file.height}</span>
                      </div>
                      {file.is_ai_generated && (
                        <div className="media-badge ai">
                          <i className="fas fa-magic"></i> AI 생성
                        </div>
                      )}
                      <div className="media-actions">
                        <button
                          className="btn-icon btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMedia(file.id, file.filename);
                          }}
                        >
                          <i className="fas fa-trash"></i>
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <i className="fas fa-images"></i>
                <p>아직 업로드된 미디어가 없습니다.</p>
                <small>이미지를 업로드하거나 AI로 생성해보세요.</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 업로드 모달 */}
      {uploadModalOpen && (
        <div className="modal active">
          <div className="modal-content">
            <h2 className="modal-header">이미지 업로드</h2>
            <div
              className="upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fas fa-cloud-upload-alt"></i>
              <p>클릭하거나 파일을 드래그하세요</p>
              <small>PNG, JPG, GIF, WebP, SVG (최대 16MB)</small>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {selectedFile && (
              <div className="form-group">
                <label className="form-label">선택된 파일</label>
                <p>{selectedFile.name}</p>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeUploadModal}>
                취소
              </button>
              <button
                className="btn btn-primary"
                onClick={uploadFile}
                disabled={!selectedFile || uploading}
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
        <div className="modal active">
          <div className="modal-content">
            <h2 className="modal-header">AI 이미지 생성</h2>

            <div className="form-group">
              <label className="form-label">AI 모델</label>
              <select
                className="form-input"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
              >
                <option value="dalle">DALL-E 3 (OpenAI)</option>
                <option value="huggingface">Stable Diffusion (Hugging Face)</option>
                <option value="stability">Stable Diffusion XL (Stability AI)</option>
                <option value="replicate">SDXL (Replicate)</option>
              </select>
              <small style={{ color: 'var(--gray-600)', marginTop: '4px', display: 'block' }}>
                <i className="fas fa-info-circle"></i> 설정에서 각 모델의 API 키를 등록해야 사용할 수 있습니다.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">프롬프트</label>
              <textarea
                className="form-input"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="어떤 이미지를 만들고 싶으신가요? (영문으로 입력하세요)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">크기</label>
              <select
                className="form-input"
                value={aiSize}
                onChange={(e) => setAiSize(e.target.value)}
              >
                <option value="512x512">512x512</option>
                <option value="1024x1024">1024x1024</option>
                <option value="1792x1024">1792x1024</option>
                <option value="1024x1792">1024x1792</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">품질</label>
              <select
                className="form-input"
                value={aiQuality}
                onChange={(e) => setAiQuality(e.target.value)}
              >
                <option value="standard">Standard</option>
                <option value="hd">HD</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeAIModal}>
                취소
              </button>
              <button
                className="btn btn-primary"
                onClick={generateAIImage}
                disabled={generating}
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

      <style jsx>{`
        .media-container {
          padding: 40px;
        }

        .media-header {
          background: var(--secondary);
          border: 2px solid var(--gray-300);
          border-radius: var(--radius-lg);
          padding: 32px;
          margin-bottom: 30px;
          box-shadow: var(--shadow-sm);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .media-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 12px 24px;
          border-radius: var(--radius);
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: var(--primary);
          color: var(--secondary);
        }

        .btn-primary:hover {
          background: var(--gray-800);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: var(--secondary);
          color: var(--primary);
          border: 2px solid var(--primary);
        }

        .btn-secondary:hover {
          background: var(--gray-100);
        }

        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .media-item {
          background: var(--secondary);
          border: 2px solid var(--gray-300);
          border-radius: var(--radius);
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
        }

        .media-item:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }

        .media-item.selected {
          outline: 3px solid var(--primary);
          outline-offset: -3px;
        }

        .media-preview {
          width: 100%;
          height: 200px;
          background: var(--gray-100);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .media-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-preview i {
          font-size: 48px;
          color: var(--gray-400);
        }

        .media-info {
          padding: 16px;
          position: relative;
        }

        .media-filename {
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .media-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .btn-icon {
          padding: 8px 12px;
          border-radius: var(--radius);
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .media-meta {
          font-size: 12px;
          color: var(--gray-600);
          display: flex;
          justify-content: space-between;
        }

        .media-badge {
          display: inline-block;
          padding: 4px 8px;
          background: var(--gray-100);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--primary);
          margin-top: 8px;
        }

        .media-badge.ai {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .media-checkbox {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          width: 24px;
          height: 24px;
          cursor: pointer;
          accent-color: var(--primary);
        }

        .selection-toolbar {
          background: var(--secondary);
          border: 2px solid var(--gray-300);
          border-radius: var(--radius);
          padding: 16px 24px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow-md);
        }

        .selection-info {
          font-weight: 600;
          color: var(--primary);
        }

        .selection-actions {
          display: flex;
          gap: 12px;
        }

        .btn-select-all {
          background: var(--gray-200);
          color: var(--primary);
        }

        .btn-select-all:hover {
          background: var(--gray-300);
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: var(--gray-500);
        }

        .empty-state i {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.3;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background: var(--secondary);
          border-radius: var(--radius-lg);
          padding: 32px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 24px;
          color: var(--primary);
        }

        .upload-area {
          border: 3px dashed var(--gray-300);
          border-radius: var(--radius);
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
          margin-bottom: 20px;
        }

        .upload-area:hover {
          border-color: var(--primary);
          background: var(--gray-100);
        }

        .upload-area i {
          font-size: 48px;
          color: var(--gray-400);
          margin-bottom: 16px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--primary);
        }

        .form-input {
          width: 100%;
          padding: 12px;
          border: 2px solid var(--gray-300);
          border-radius: var(--radius);
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
        }

        textarea.form-input {
          resize: vertical;
          min-height: 80px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: var(--gray-500);
          grid-column: 1 / -1;
        }
      `}</style>
    </div>
  );
}

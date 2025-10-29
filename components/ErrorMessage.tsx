/**
 * Error Message Component
 * 에러 메시지를 표시하는 공통 컴포넌트
 */

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export default function ErrorMessage({
  title = '오류가 발생했습니다',
  message,
  onRetry,
  fullScreen = false
}: ErrorMessageProps) {
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '32px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: '#fee2e2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <i
          className="fas fa-exclamation-triangle"
          style={{
            fontSize: '32px',
            color: '#ef4444',
          }}
        />
      </div>

      <div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827',
          margin: '0 0 8px 0',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0,
          maxWidth: '400px',
        }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 24px',
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
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#3b82f6';
          }}
        >
          <i className="fas fa-redo"></i>
          다시 시도
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6',
        zIndex: 9999,
      }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{
      background: '#ffffff',
      border: '2px solid #fecaca',
      borderRadius: '12px',
      padding: '24px',
    }}>
      {content}
    </div>
  );
}

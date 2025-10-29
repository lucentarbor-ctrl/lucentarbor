/**
 * Loading Spinner Component
 * 로딩 상태를 표시하는 공통 컴포넌트
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  message,
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizes = {
    sm: '20px',
    md: '32px',
    lg: '48px',
  };

  const spinner = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
    }}>
      <i
        className="fas fa-spinner fa-spin"
        style={{
          fontSize: sizes[size],
          color: '#3b82f6',
        }}
      />
      {message && (
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0,
        }}>
          {message}
        </p>
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
        background: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
}

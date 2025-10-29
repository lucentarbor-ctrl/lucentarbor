'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 루트 페이지 접속 시 대시보드로 리다이렉트
    router.push('/dashboard');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#f3f4f6'
    }}>
      <div style={{
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', marginBottom: '16px' }}></i>
        <p>대시보드로 이동 중...</p>
      </div>
    </div>
  );
}

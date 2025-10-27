/**
 * 공통 레이아웃 컴포넌트
 */
import Link from 'next/link';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700">
              🤖 AI 블로그
            </Link>
            <nav className="flex gap-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                대시보드
              </Link>
              <Link href="/posts" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                포스트
              </Link>
              <Link href="/media" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                미디어
              </Link>
              <Link href="/blogs" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                블로그 연동
              </Link>
              <Link href="/settings" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                설정
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>Powered by Next.js • Prisma • Multi-AI Router</p>
            <p className="mt-2">© 2025 AI Auto Blog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import PrimarySidebar from './PrimarySidebar';
import SecondarySidebar from './SecondarySidebar';
import { menuItems, MenuItem } from './PrimarySidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItem | null>(null);
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(false);
  const [isPrimarySidebarCollapsed, setIsPrimarySidebarCollapsed] = useState(false);

  // localStorage에서 사이드바 상태 로드
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsPrimarySidebarCollapsed(saved === 'true');
    }
  }, []);

  // 사이드바 토글 함수
  const togglePrimarySidebar = () => {
    const newState = !isPrimarySidebarCollapsed;
    setIsPrimarySidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  // 현재 경로에 맞는 메뉴 자동 선택
  useEffect(() => {
    for (const item of menuItems) {
      if (item.subItems) {
        const matchingSubItem = item.subItems.find(sub => pathname === sub.href);
        if (matchingSubItem) {
          setActiveMenuId(item.id);
          setActiveMenuItem(item);
          setIsSecondaryOpen(true);
          return;
        }
      } else {
        // 단일 페이지 메뉴 매칭
        const routes: Record<string, string> = {
          'dashboard': '/dashboard',
          'posts': '/posts',
          'media': '/media',
          'wordpress': '/blogs',
          'settings': '/settings',
        };
        if (routes[item.id] === pathname || (item.id === 'dashboard' && pathname === '/')) {
          setActiveMenuId(item.id);
          setActiveMenuItem(null);
          setIsSecondaryOpen(false);
          return;
        }
      }
    }
  }, [pathname]);

  const handleMenuClick = (menuId: string) => {
    const menu = menuItems.find(item => item.id === menuId);
    if (!menu) return;

    if (activeMenuId === menuId && isSecondaryOpen) {
      // 같은 메뉴 클릭 시 토글
      setIsSecondaryOpen(false);
    } else {
      setActiveMenuId(menuId);
      setActiveMenuItem(menu);

      // 서브 아이템이 있으면 2차 사이드바 열기
      if (menu.subItems) {
        setIsSecondaryOpen(true);
      } else {
        setIsSecondaryOpen(false);

        // 단일 페이지 메뉴는 바로 이동
        const routes: Record<string, string> = {
          'dashboard': '/dashboard',
          'posts': '/posts',
          'media': '/media',
          'wordpress': '/blogs',
          'settings': '/settings',
        };

        const targetRoute = routes[menuId];
        if (targetRoute) {
          router.push(targetRoute);
        }
      }
    }
  };

  const handleSecondaryClose = () => {
    setIsSecondaryOpen(false);
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --primary: #3b82f6;
          --primary-dark: #2563eb;
          --secondary: #ffffff;
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
          --info: #3b82f6;
          --gray-50: #f9fafb;
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-400: #9ca3af;
          --gray-500: #6b7280;
          --gray-600: #4b5563;
          --gray-700: #374151;
          --gray-800: #1f2937;
          --gray-900: #111827;
          --radius: 8px;
          --radius-lg: 12px;
          --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
          --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
          background: #111827;
          color: var(--gray-900);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow: hidden;
        }

        .app-layout {
          display: flex;
          min-height: 100vh;
          height: 100vh;
          background: #ffffff;
          overflow: hidden;
        }

        .main-content {
          flex: 1;
          height: 100vh;
          background: #f3f4f6;
          transition: var(--transition);
          padding: 32px;
          overflow-y: auto;
        }

        .main-content::-webkit-scrollbar {
          width: 8px;
        }

        .main-content::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        .main-content::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }

        .main-content::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        @media (max-width: 768px) {
          .app-layout {
            min-height: 100vh;
            height: 100vh;
          }

          .main-content {
            height: 100vh;
            padding: 20px;
          }
        }
      `}</style>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Pretendard:wght@100;200;300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="app-layout">
        <PrimarySidebar
          activeMenu={activeMenuId}
          onMenuClick={handleMenuClick}
          collapsed={isPrimarySidebarCollapsed}
          onToggleCollapse={togglePrimarySidebar}
        />
        <SecondarySidebar
          isOpen={isSecondaryOpen}
          activeMenuItem={activeMenuItem}
          onClose={handleSecondaryClose}
        />
        <div className="main-content">{children}</div>
      </div>
    </>
  );
}

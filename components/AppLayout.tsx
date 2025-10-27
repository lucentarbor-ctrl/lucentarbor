'use client';

import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const { sidebarWidth } = useSidebar();

  return (
    <>
      <style jsx global>{`
        :root {
          --primary: #2c3e50;
          --secondary: #ffffff;
          --success: #27ae60;
          --warning: #f39c12;
          --danger: #e74c3c;
          --info: #3498db;
          --gray-100: #f8f9fa;
          --gray-200: #e9ecef;
          --gray-300: #dee2e6;
          --gray-400: #ced4da;
          --gray-500: #adb5bd;
          --gray-600: #6c757d;
          --gray-700: #495057;
          --gray-800: #343a40;
          --gray-900: #212529;
          --radius: 8px;
          --radius-lg: 12px;
          --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
          --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
          --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
          --transition: all 0.3s ease;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
          background: #e5e7eb;
          color: var(--gray-900);
          line-height: 1.6;
        }

        .app-layout {
          display: flex;
          min-height: calc(100vh - 32px);
          margin: 16px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .main-content {
          flex: 1;
          min-height: calc(100vh - 32px);
          background: #f9fafb;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 24px;
          overflow-y: auto;
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
        <Sidebar />
        <div className="main-content">{children}</div>
      </div>
    </>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}

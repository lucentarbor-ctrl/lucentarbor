'use client';

import { usePathname } from 'next/navigation';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  href: string;
  icon: string;
  label: string;
}

interface PrimarySidebarProps {
  activeMenu: string | null;
  onMenuClick: (menuId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', icon: 'far fa-chart-bar', label: '대시보드' },
  {
    id: 'content',
    icon: 'far fa-folder',
    label: '콘텐츠',
    subItems: [
      { href: '/editor', icon: 'far fa-edit', label: '글쓰기' },
      { href: '/news-crawler', icon: 'fas fa-newspaper', label: '뉴스크롤링' },
      { href: '/course-creator', icon: 'fas fa-graduation-cap', label: '강좌제작' },
    ]
  },
  { id: 'posts', icon: 'far fa-file-alt', label: '내 글' },
  { id: 'media', icon: 'far fa-images', label: '미디어' },
  { id: 'wordpress', icon: 'fas fa-blog', label: 'WordPress' },
  { id: 'settings', icon: 'fas fa-cog', label: '설정' },
];

export default function PrimarySidebar({ activeMenu, onMenuClick, collapsed, onToggleCollapse }: PrimarySidebarProps) {
  const pathname = usePathname();

  const isActive = (item: MenuItem) => {
    if (item.id === 'dashboard') return pathname === '/' || pathname === '/dashboard';
    if (item.subItems) {
      return item.subItems.some(sub => pathname === sub.href);
    }
    return activeMenu === item.id;
  };

  return (
    <>
      <style jsx>{`
        .primary-sidebar {
          width: ${collapsed ? '72px' : '220px'};
          background: #ffffff;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: relative;
          z-index: 1000;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-header {
          padding: 20px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80px;
        }

        .logo-icon {
          font-size: 28px;
          color: #3b82f6;
          transition: all 0.3s ease;
          cursor: pointer;
          text-shadow: none;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
        }

        .logo-icon:hover {
          transform: scale(1.1) rotate(10deg);
          filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.5));
        }

        .sidebar-menu {
          flex: 1;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
          overflow-y: auto;
        }

        .sidebar-menu::-webkit-scrollbar {
          display: none;
        }

        .sidebar-menu {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .menu-item {
          width: 100%;
          height: 56px;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          padding-left: ${collapsed ? '0' : '20px'};
          border-radius: 0;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .menu-item:hover {
          background: #f9fafb;
          color: #111827;
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
        }

        .menu-item.active {
          background: #f3f4f6;
          color: #111827;
          border-radius: 0;
          position: relative;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.1);
        }

        .menu-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .menu-tooltip {
          position: absolute;
          left: 100%;
          margin-left: 12px;
          padding: 8px 12px;
          background: #1f2937;
          color: #ffffff;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s ease;
          z-index: 10000;
          transform: translateX(-8px);
        }

        .menu-item:hover .menu-tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        .sidebar-footer {
          padding: 16px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 0 auto;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .user-avatar:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5), inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: #f3f4f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          margin: 0 auto;
        }

        .toggle-btn:hover {
          background: #e5e7eb;
          color: #111827;
        }

        .menu-label {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          opacity: ${collapsed ? '0' : '1'};
          width: ${collapsed ? '0' : 'auto'};
          overflow: hidden;
          transition: opacity 0.2s ease, width 0.3s ease;
        }

        .menu-item-content {
          display: flex;
          align-items: center;
          gap: 12px;
          width: ${collapsed ? 'auto' : '100%'};
          justify-content: ${collapsed ? 'center' : 'flex-start'};
        }
      `}</style>

      <div className="primary-sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <i className="fas fa-bolt"></i>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => onMenuClick(item.id)}
            >
              <div className="menu-item-content">
                <i className={`${item.icon} menu-icon`}></i>
                {!collapsed && <span className="menu-label">{item.label}</span>}
              </div>
              {collapsed && <span className="menu-tooltip">{item.label}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="toggle-btn" onClick={onToggleCollapse} title={collapsed ? '사이드바 확장' : '사이드바 축소'}>
            <i className={`fas fa-${collapsed ? 'angle-right' : 'angle-left'}`}></i>
          </button>
          <div className="user-avatar" style={{ marginTop: '12px' }}>
            <i className="fas fa-user"></i>
          </div>
        </div>
      </div>
    </>
  );
}

export { menuItems };
export type { MenuItem, SubMenuItem };

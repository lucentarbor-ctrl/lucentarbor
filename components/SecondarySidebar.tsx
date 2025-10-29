'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MenuItem } from './PrimarySidebar';

interface SecondarySidebarProps {
  isOpen: boolean;
  activeMenuItem: MenuItem | null;
  onClose: () => void;
}

export default function SecondarySidebar({ isOpen, activeMenuItem, onClose }: SecondarySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
    // 모바일에서는 닫기
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  // 단일 페이지 메뉴 처리
  const handleSinglePageNav = (menuId: string) => {
    const routes: Record<string, string> = {
      'home': '/',
      'wordpress': '/blogs',
      'dashboard': '/dashboard',
      'settings': '/settings',
    };

    const href = routes[menuId];
    if (href) {
      router.push(href);
      if (window.innerWidth < 768) {
        onClose();
      }
    }
  };

  if (!activeMenuItem) return null;

  // 서브 아이템이 없는 메뉴는 바로 이동
  if (!activeMenuItem.subItems) {
    handleSinglePageNav(activeMenuItem.id);
    return null;
  }

  return (
    <>
      <style jsx>{`
        .secondary-sidebar {
          width: 260px;
          background: #ffffff;
          height: 100vh;
          position: relative;
          transform: translateX(${isOpen ? '0' : '-100%'});
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 999;
          display: flex;
          flex-direction: column;
          box-shadow: inset 4px 0 8px rgba(0, 0, 0, 0.05);
        }

        .secondary-header {
          padding: 24px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 80px;
        }

        .header-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          font-size: 20px;
          color: #6b7280;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #ffffff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #ffffff;
          color: #111827;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .secondary-menu {
          flex: 1;
          padding: 0;
          overflow-y: auto;
        }

        .secondary-menu::-webkit-scrollbar {
          width: 6px;
        }

        .secondary-menu::-webkit-scrollbar-track {
          background: transparent;
        }

        .secondary-menu::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }

        .secondary-menu::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }

        .menu-section {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 16px 20px 8px;
        }

        .submenu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          margin: 0;
          color: #6b7280;
          text-decoration: none;
          border-radius: 0;
          transition: all 0.2s ease;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .submenu-item:hover {
          background: #f9fafb;
          color: #111827;
        }

        .submenu-item.active {
          background: #f3f4f6;
          color: #111827;
          font-weight: 600;
          border-radius: 0;
          box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.08);
        }

        .submenu-icon {
          font-size: 16px;
          min-width: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .submenu-label {
          flex: 1;
        }

        .submenu-badge {
          font-size: 11px;
          padding: 2px 8px;
          background: #e5e7eb;
          color: #6b7280;
          border-radius: 12px;
          font-weight: 600;
        }

        .submenu-item.active .submenu-badge {
          background: #f3f4f6;
          color: #111827;
        }

        @media (max-width: 768px) {
          .secondary-sidebar {
            position: absolute;
            left: 72px;
            top: 0;
            bottom: 0;
            box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>

      <div className="secondary-sidebar">
        <div className="secondary-header">
          <div className="header-title">
            <i className={`${activeMenuItem.icon} title-icon`}></i>
            <span>{activeMenuItem.label}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="secondary-menu">
          {activeMenuItem.subItems && activeMenuItem.subItems.length > 0 && (
            <div className="menu-section">
              <div className="section-title">메뉴</div>
              {activeMenuItem.subItems.map((item) => (
                <div
                  key={item.href}
                  className={`submenu-item ${pathname === item.href ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.href)}
                >
                  <i className={`${item.icon} submenu-icon`}></i>
                  <span className="submenu-label">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

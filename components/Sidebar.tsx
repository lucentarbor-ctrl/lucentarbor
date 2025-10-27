'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, setIsExpanded } = useSidebar();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const menuItems = [
    { href: '/', icon: 'fas fa-home', label: '홈' },
    {
      href: '/content',
      icon: 'far fa-folder',
      label: '콘텐츠',
      children: [
        { href: '/editor', icon: 'far fa-edit', label: '에디터' },
        { href: '/posts', icon: 'far fa-file-alt', label: '내 글' },
        { href: '/media', icon: 'far fa-images', label: '미디어' },
      ]
    },
    { href: '/blogs', icon: 'fas fa-blog', label: 'WordPress 발행' },
    { href: '/dashboard', icon: 'far fa-chart-bar', label: '대시보드' },
    { href: '/settings', icon: 'fas fa-cog', label: '설정' },
  ];

  const toggleSection = (label: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <>
      <style jsx global>{`
        aside {
          border: none;
          outline: none;
          box-shadow: none;
        }

        .sidebar {
          width: ${isExpanded ? '260px' : '80px'};
          background: #111827;
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
          z-index: 100;
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: visible;
          border: none;
          outline: none;
          box-shadow: none;
        }

        .sidebar-header {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: ${isExpanded ? 'space-between' : 'center'};
          min-height: 80px;
          flex-direction: ${isExpanded ? 'row' : 'column'};
          gap: ${isExpanded ? '0' : '12px'};
          background: #111827;
        }

        .sidebar-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sidebar-logo-icon {
          font-size: 28px;
          color: #ffffff;
          min-width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .sidebar-logo-icon:hover {
          transform: scale(1.1);
          color: #f9fafb;
        }

        .sidebar-logo-text {
          display: none;
        }

        .sidebar-toggle {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          color: #6b7280;
          font-size: 13px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .sidebar-toggle:hover {
          background: #111827;
          color: #ffffff;
          border-color: #111827;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .sidebar-toggle:active {
          transform: scale(0.98);
        }

        .sidebar-menu {
          flex: 1;
          padding: 20px 0;
          overflow-y: auto;
          overflow-x: visible;
          background: #111827;
          border: none;
          border-bottom: none;
        }

        .sidebar-menu::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-menu::-webkit-scrollbar-track {
          background: #111827;
          margin: 8px 0;
        }

        .sidebar-menu::-webkit-scrollbar-thumb {
          background: var(--gray-400);
          border-radius: 10px;
          transition: background 0.2s;
        }

        .sidebar-menu::-webkit-scrollbar-thumb:hover {
          background: var(--gray-500);
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          margin: 3px 12px;
          color: #9ca3af;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          font-size: 14px;
          border-radius: 10px;
          position: relative;
          cursor: pointer;
        }

        .sidebar-item:hover:not(.active) {
          background: #f9fafb;
          color: #111827;
          border-radius: ${isExpanded ? '10px 4px 4px 10px' : '10px'};
          margin-right: ${isExpanded ? '-8px' : '0'};
          padding-right: ${isExpanded ? '20px' : '16px'};
          transform: translateX(2px);
        }

        .sidebar-item:hover:not(.active) .sidebar-item-icon {
          color: #111827;
          transform: scale(1.1);
        }

        .sidebar-item.active {
          background: linear-gradient(90deg, #ffffff 0%, #f9fafb 100%);
          color: #111827;
          position: relative;
          font-weight: 600;
          border-radius: ${isExpanded ? '10px 4px 4px 10px' : '10px'};
          margin-right: ${isExpanded ? '-12px' : '0'};
          padding-right: ${isExpanded ? '24px' : '16px'};
          box-shadow: ${isExpanded ? '2px 0 8px rgba(0, 0, 0, 0.06)' : 'none'};
        }

        .sidebar-item.active .sidebar-item-icon {
          color: #111827;
          transform: scale(1.05);
        }

        .sidebar-item-icon {
          font-size: 18px;
          min-width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-item-label {
          white-space: nowrap;
          opacity: ${isExpanded ? '1' : '0'};
          transform: ${isExpanded ? 'translateX(0)' : 'translateX(-10px)'};
          transition: opacity 0.25s ease 0.05s, transform 0.25s ease 0.05s;
          position: relative;
          z-index: 1;
        }

        .sidebar-item-tooltip {
          position: absolute;
          left: 100%;
          margin-left: 16px;
          padding: 10px 16px;
          background: linear-gradient(135deg, var(--gray-900) 0%, #1a1a1a 100%);
          color: white;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          transform: translateX(-10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .sidebar-item-tooltip::before {
          content: '';
          position: absolute;
          left: -6px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 6px 6px 6px 0;
          border-color: transparent var(--gray-900) transparent transparent;
        }

        .sidebar-item:hover .sidebar-item-tooltip {
          opacity: ${isExpanded ? '0' : '1'};
          transform: translateX(0);
        }

        .sidebar-expand-icon {
          margin-left: auto;
          font-size: 11px;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .sidebar-item.expanded .sidebar-expand-icon {
          color: #9ca3af;
        }

        .sidebar-submenu {
          display: flex;
          flex-direction: column;
          margin-left: ${isExpanded ? '40px' : '0'};
          padding-left: ${isExpanded ? '20px' : '0'};
          margin-top: 4px;
          margin-bottom: 4px;
          border-left: ${isExpanded ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
          position: relative;
        }

        .sidebar-subitem {
          padding: 10px 16px;
          margin: 2px 12px;
          font-size: 13px;
          position: relative;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          color: #9ca3af;
        }

        .sidebar-subitem:hover:not(.active) {
          background: #f9fafb;
          color: #111827;
          border-radius: ${isExpanded ? '10px 4px 4px 10px' : '10px'};
          margin-right: ${isExpanded ? '-8px' : '0'};
          padding-right: ${isExpanded ? '20px' : '16px'};
          transform: translateX(2px);
        }

        .sidebar-subitem::before {
          content: '';
          position: absolute;
          left: ${isExpanded ? '-20px' : '0'};
          top: 50%;
          width: ${isExpanded ? '12px' : '0'};
          height: 1px;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-subitem:hover::before {
          background: #9ca3af;
          width: ${isExpanded ? '14px' : '0'};
        }

        .sidebar-subitem .sidebar-item-icon {
          display: none;
        }

        .sidebar-subitem.active {
          background: linear-gradient(90deg, #ffffff 0%, #f9fafb 100%);
          color: #111827;
          font-weight: 600;
          border-radius: ${isExpanded ? '10px 4px 4px 10px' : '10px'};
          margin-right: ${isExpanded ? '-12px' : '0'};
          padding-right: ${isExpanded ? '24px' : '16px'};
          box-shadow: ${isExpanded ? '2px 0 8px rgba(0, 0, 0, 0.06)' : 'none'};
        }

        .sidebar-subitem.active::before {
          background: #6b7280;
          width: ${isExpanded ? '14px' : '0'};
        }

        .sidebar-footer {
          padding: 16px 12px;
          background: #111827;
          border: none;
          border-top: none;
          border-bottom: none;
          outline: none;
          box-shadow: none;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          transition: all 0.3s ease;
          border: none;
          box-shadow: none;
        }

        .user-profile:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, #34495e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary);
          font-size: 24px;
          flex-shrink: 0;
        }

        .user-avatar-compact {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, #34495e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary);
          font-size: 24px;
          margin: 0 auto;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .user-avatar-compact:hover {
          transform: scale(1.1);
        }

        .user-info {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          border: none;
          outline: none;
        }

        .user-email {
          font-size: 12px;
          color: #9ca3af;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          border: none;
          outline: none;
        }

        .user-menu-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        .user-menu-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <span className="sidebar-logo-text">AI 블로그</span>
          </Link>
          <button
            className="sidebar-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? '사이드바 축소' : '사이드바 확장'}
          >
            <i className={`fas fa-${isExpanded ? 'chevron-left' : 'chevron-right'}`}></i>
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <div key={item.href}>
              {item.children ? (
                <>
                  <div
                    className={`sidebar-item ${expandedSections.has(item.label) && isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleSection(item.label)}
                  >
                    <div className="sidebar-item-icon">
                      <i className={item.icon}></i>
                    </div>
                    <span className="sidebar-item-label">{item.label}</span>
                    {isExpanded && (
                      <i className={`fas fa-chevron-${expandedSections.has(item.label) ? 'down' : 'right'} sidebar-expand-icon`}></i>
                    )}
                    {!isExpanded && (
                      <span className="sidebar-item-tooltip">{item.label}</span>
                    )}
                  </div>
                  {expandedSections.has(item.label) && isExpanded && (
                    <div className="sidebar-submenu">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`sidebar-item sidebar-subitem ${pathname === child.href ? 'active' : ''}`}
                        >
                          <div className="sidebar-item-icon">
                            <i className={child.icon}></i>
                          </div>
                          <span className="sidebar-item-label">{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}
                >
                  <div className="sidebar-item-icon">
                    <i className={item.icon}></i>
                  </div>
                  <span className="sidebar-item-label">{item.label}</span>
                  {!isExpanded && (
                    <span className="sidebar-item-tooltip">{item.label}</span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {isExpanded ? (
            <div className="user-profile">
              <div className="user-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="user-info">
                <div className="user-name">AI 블로거</div>
                <div className="user-email">user@example.com</div>
              </div>
              <button className="user-menu-btn">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
          ) : (
            <div className="user-avatar-compact">
              <i className="fas fa-user-circle"></i>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

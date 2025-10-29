'use client';

import { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  subtitle?: string;
}

export default function PageHeader({ title, breadcrumbs, actions, subtitle }: PageHeaderProps) {
  return (
    <>
      <style jsx>{`
        .page-header {
          margin-bottom: 32px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 13px;
          color: #6b7280;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #6b7280;
          transition: color 0.2s ease;
        }

        .breadcrumb-item:hover {
          color: #111827;
        }

        .breadcrumb-separator {
          color: #d1d5db;
          font-size: 11px;
        }

        .breadcrumb-item.active {
          color: #111827;
          font-weight: 500;
        }

        .header-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .header-left {
          flex: 1;
          min-width: 0;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
          line-height: 1.2;
        }

        .page-subtitle {
          font-size: 15px;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .page-title {
            font-size: 24px;
          }

          .header-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>

      <div className="page-header">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="breadcrumb">
            {breadcrumbs.map((item, index) => (
              <div key={index}>
                {index > 0 && (
                  <span className="breadcrumb-separator">
                    <i className="fas fa-chevron-right"></i>
                  </span>
                )}
                {item.href ? (
                  <a href={item.href} className="breadcrumb-item">
                    {item.label}
                  </a>
                ) : (
                  <span className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}>
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        )}

        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="header-actions">{actions}</div>}
        </div>
      </div>
    </>
  );
}

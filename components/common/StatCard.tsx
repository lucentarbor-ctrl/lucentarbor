'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  loading?: boolean;
}

const colorMap = {
  blue: { bg: '#eff6ff', icon: '#3b82f6', border: '#3b82f6' },
  green: { bg: '#f0fdf4', icon: '#10b981', border: '#10b981' },
  purple: { bg: '#faf5ff', icon: '#a855f7', border: '#a855f7' },
  orange: { bg: '#fff7ed', icon: '#f59e0b', border: '#f59e0b' },
  red: { bg: '#fef2f2', icon: '#ef4444', border: '#ef4444' },
};

export default function StatCard({ title, value, icon, trend, color = 'blue', loading }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <>
      <style jsx>{`
        .stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card:hover {
          border-color: ${colors.border};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, ${colors.icon}, transparent);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .stat-title {
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          background: ${colors.bg};
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${colors.icon};
          font-size: 18px;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
          line-height: 1;
        }

        .stat-trend {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .stat-trend.positive {
          background: #f0fdf4;
          color: #10b981;
        }

        .stat-trend.negative {
          background: #fef2f2;
          color: #ef4444;
        }

        .stat-trend-icon {
          font-size: 10px;
        }

        .skeleton {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
          border-radius: 6px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .skeleton-title {
          width: 80px;
          height: 14px;
          margin-bottom: 16px;
        }

        .skeleton-value {
          width: 120px;
          height: 40px;
          margin-bottom: 8px;
        }

        .skeleton-trend {
          width: 60px;
          height: 20px;
        }

        @media (max-width: 768px) {
          .stat-card {
            padding: 20px;
          }

          .stat-value {
            font-size: 28px;
          }
        }
      `}</style>

      <div className="stat-card">
        {loading ? (
          <>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-value"></div>
            <div className="skeleton skeleton-trend"></div>
          </>
        ) : (
          <>
            <div className="stat-header">
              <h3 className="stat-title">{title}</h3>
              {icon && (
                <div className="stat-icon">
                  <i className={icon}></i>
                </div>
              )}
            </div>
            <div className="stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
            {trend && (
              <div className={`stat-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                <i className={`fas fa-arrow-${trend.isPositive ? 'up' : 'down'} stat-trend-icon`}></i>
                <span>{trend.value}</span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

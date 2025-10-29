'use client';

import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = '데이터가 없습니다',
  onRowClick,
}: DataTableProps<T>) {
  const renderCell = (column: Column<T>, item: T, index: number) => {
    if (column.render) {
      return column.render(item, index);
    }
    return item[column.key];
  };

  return (
    <>
      <style jsx>{`
        .data-table-container {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .table-header {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-header-cell {
          padding: 16px 20px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .table-header-cell.align-center {
          text-align: center;
        }

        .table-header-cell.align-right {
          text-align: right;
        }

        .table-body {
          background: #ffffff;
        }

        .table-row {
          border-bottom: 1px solid #f3f4f6;
          transition: all 0.15s ease;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row:hover {
          background: #f9fafb;
        }

        .table-row.clickable {
          cursor: pointer;
        }

        .table-row.clickable:hover {
          background: #eff6ff;
        }

        .table-cell {
          padding: 16px 20px;
          font-size: 14px;
          color: #374151;
          vertical-align: middle;
        }

        .table-cell.align-center {
          text-align: center;
        }

        .table-cell.align-right {
          text-align: right;
        }

        .loading-row {
          padding: 40px 20px;
          text-align: center;
          color: #9ca3af;
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f3f4f6;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 12px;
          vertical-align: middle;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
        }

        .empty-icon {
          font-size: 48px;
          color: #e5e7eb;
          margin-bottom: 16px;
        }

        .empty-message {
          font-size: 15px;
          color: #6b7280;
          margin: 0;
        }

        .skeleton-cell {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
          height: 20px;
          border-radius: 4px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (max-width: 768px) {
          .table-header-cell,
          .table-cell {
            padding: 12px 16px;
            font-size: 13px;
          }

          .empty-state {
            padding: 40px 20px;
          }

          .empty-icon {
            font-size: 36px;
          }
        }
      `}</style>

      <div className="data-table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead className="table-header">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`table-header-cell ${column.align ? `align-${column.align}` : ''}`}
                    style={column.width ? { width: column.width } : {}}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="table-body">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="loading-row">
                    <div className="loading-spinner"></div>
                    로딩 중...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="empty-state">
                      <div className="empty-icon">
                        <i className="far fa-folder-open"></i>
                      </div>
                      <p className="empty-message">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={index}
                    className={`table-row ${onRowClick ? 'clickable' : ''}`}
                    onClick={() => onRowClick?.(item, index)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`table-cell ${column.align ? `align-${column.align}` : ''}`}
                        style={column.width ? { width: column.width } : {}}
                      >
                        {renderCell(column, item, index)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

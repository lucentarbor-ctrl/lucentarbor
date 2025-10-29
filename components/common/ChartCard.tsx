'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ChartCardProps {
  title: string;
  type: 'line' | 'bar' | 'doughnut' | 'pie';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      tension?: number;
      fill?: boolean;
    }[];
  };
  height?: number;
  loading?: boolean;
  actions?: ReactNode;
}

export default function ChartCard({ title, type, data, height = 300, loading, actions }: ChartCardProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || loading) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create new chart
    chartInstanceRef.current = new Chart(ctx, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: type === 'doughnut' || type === 'pie',
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
                family: 'Pretendard, sans-serif',
              },
            },
          },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#1f2937',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            boxPadding: 6,
            titleFont: {
              size: 13,
              weight: '600',
            },
            bodyFont: {
              size: 12,
            },
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toLocaleString();
                } else if (context.parsed !== null) {
                  label += context.parsed.toLocaleString();
                }
                return label;
              }
            }
          },
        },
        scales: type !== 'doughnut' && type !== 'pie' ? {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 11,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#f3f4f6',
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 11,
              },
            },
          },
        } : undefined,
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [type, data, loading]);

  return (
    <>
      <style jsx>{`
        .chart-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
        }

        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .chart-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .chart-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chart-container {
          position: relative;
          height: ${height}px;
        }

        .chart-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: ${height}px;
          color: #9ca3af;
        }

        .loading-spinner {
          display: inline-block;
          width: 24px;
          height: 24px;
          border: 3px solid #f3f4f6;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 12px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .chart-card {
            padding: 20px;
          }

          .chart-title {
            font-size: 16px;
          }

          .chart-container {
            height: 250px;
          }

          .chart-loading {
            height: 250px;
          }
        }
      `}</style>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">{title}</h3>
          {actions && <div className="chart-actions">{actions}</div>}
        </div>
        {loading ? (
          <div className="chart-loading">
            <div className="loading-spinner"></div>
            차트 로딩 중...
          </div>
        ) : (
          <div className="chart-container">
            <canvas ref={chartRef}></canvas>
          </div>
        )}
      </div>
    </>
  );
}

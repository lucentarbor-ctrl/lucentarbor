import Link from 'next/link';

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export default function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px'
    }}>
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px'
          }}>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {index > 0 && <span>/</span>}
                <Link
                  href={crumb.href}
                  style={{
                    color: index === breadcrumbs.length - 1 ? '#111827' : '#6b7280',
                    textDecoration: 'none',
                    fontWeight: index === breadcrumbs.length - 1 ? 600 : 400
                  }}
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </div>
        )}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#111827',
          margin: 0
        }}>
          {title}
        </h1>
      </div>
      {actions && (
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          {actions}
        </div>
      )}
    </div>
  );
}

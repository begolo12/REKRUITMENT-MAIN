export function SkeletonLine({ width = '100%', height = 14, style }) {
  return (
    <div 
      data-testid="skeleton"
      className="skeleton-line"
      style={{
        width, 
        height, 
        borderRadius: 8,
        background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s ease-in-out infinite',
        ...style
      }} 
    />
  );
}

export function SkeletonCard({ lines = 3, style }) {
  return (
    <div 
      data-testid="skeleton-card"
      className="skeleton-card"
      style={{ 
        background: '#fff', 
        borderRadius: 20, 
        padding: 24, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
        border: '1px solid #f1f5f9', 
        ...style 
      }}
    >
      <SkeletonLine width="60%" height={18} style={{ marginBottom: 16 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine 
          key={i} 
          width={i === lines - 1 ? '80%' : '100%'} 
          style={{ marginBottom: i < lines - 1 ? 12 : 0 }} 
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div 
      data-testid="skeleton-table"
      className="skeleton-table"
      style={{ 
        background: '#fff', 
        borderRadius: 20, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
        border: '1px solid #f1f5f9', 
        overflow: 'hidden' 
      }}
    >
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <SkeletonLine width="220px" height={18} />
      </div>
      <div style={{ padding: '16px 24px' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div 
            key={i} 
            data-testid="skeleton-row"
            className="skeleton-row"
            style={{ 
              display: 'flex', 
              gap: 20, 
              padding: '14px 0', 
              borderBottom: i < rows - 1 ? '1px solid #f8fafc' : 'none',
              alignItems: 'center'
            }}
          >
            {Array.from({ length: cols }).map((_, j) => (
              <SkeletonLine 
                key={j} 
                width={j === 0 ? '25%' : j === cols - 1 ? '15%' : `${18 + Math.random() * 8}%`} 
                height={16} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div data-testid="skeleton-dashboard" className="skeleton-dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
      <SkeletonTable rows={4} cols={4} />
    </div>
  );
}

export function SkeletonList() {
  return <SkeletonTable rows={6} cols={5} />;
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div data-testid="skeleton-text" className="skeleton-text">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine 
          key={i}
          width={i === lines - 1 ? '75%' : '100%'}
          style={{ marginBottom: i < lines - 1 ? 12 : 0 }}
        />
      ))}
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <div 
      data-testid="skeleton-header"
      className="skeleton-header"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
        borderRadius: 24,
        padding: '40px 48px',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px -20px rgba(15, 23, 42, 0.3)'
      }}
    >
      <SkeletonLine width="40%" height={28} style={{ marginBottom: 12, background: 'rgba(255,255,255,0.1)' }} />
      <SkeletonLine width="60%" height={16} style={{ background: 'rgba(255,255,255,0.05)' }} />
    </div>
  );
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div 
      data-testid="skeleton-stats"
      className="skeleton-stats"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div 
      data-testid="skeleton-page"
      className="skeleton-page"
      style={{
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        minHeight: '100vh',
        background: '#f8fafc'
      }}
    >
      <SkeletonHeader />
      <SkeletonStats count={4} />
      <SkeletonTable rows={5} cols={5} />
    </div>
  );
}

// Add shimmer animation via style tag
if (typeof document !== 'undefined' && !document.getElementById('skeleton-style')) {
  const style = document.createElement('style');
  style.id = 'skeleton-style';
  style.textContent = `
    @keyframes shimmer { 
      0% { background-position: 200% 0; } 
      100% { background-position: -200% 0; } 
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton-line {
        animation: none !important;
        background-position: 0 0 !important;
      }
      .skeleton-pulse,
      .spin {
        animation: none !important;
      }
    }
    
    .skeleton-line {
      will-change: background-position;
      transform: translateZ(0);
      backface-visibility: hidden;
    }
    
    .skeleton-card {
      will-change: transform;
      transform: translateZ(0);
    }
    
    @media (max-width: 768px) {
      .skeleton-card {
        border-radius: 16px;
        padding: 16px;
      }
      
      .skeleton-table {
        border-radius: 16px;
        padding: 12px;
      }
      
      .skeleton-header {
        border-radius: 16px;
        padding: 20px 16px;
        margin-bottom: 16px;
      }
      
      .skeleton-stats {
        gap: 12px;
        margin-bottom: 16px;
      }
      
      .skeleton-dashboard {
        padding: 0;
      }
      
      .skeleton-page {
        padding: 16px;
      }
    }
    
    @media (max-width: 480px) {
      .skeleton-card {
        padding: 12px;
        border-radius: 12px;
      }
      
      .skeleton-table {
        padding: 8px;
      }
      
      .skeleton-header {
        padding: 16px 12px;
      }
    }
  `;
  document.head.appendChild(style);
}

export function SkeletonLine({ width = '100%', height = 14, style }) {
  return (
    <div style={{
      width, height, borderRadius: 6,
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style
    }} />
  );
}

export function SkeletonCard({ lines = 3, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.03)', ...style }}>
      <SkeletonLine width="40%" height={12} style={{ marginBottom: 14 }} />
      <SkeletonLine width="60%" height={28} style={{ marginBottom: 8 }} />
      <SkeletonLine width="30%" height={12} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.03)', overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
        <SkeletonLine width="200px" height={16} />
      </div>
      <div style={{ padding: '12px 22px' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: i < rows - 1 ? '1px solid #f8fafc' : 'none' }}>
            {Array.from({ length: cols }).map((_, j) => (
              <SkeletonLine key={j} width={j === 0 ? '30%' : `${15 + Math.random() * 10}%`} height={14} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
      <SkeletonTable rows={4} cols={4} />
    </>
  );
}

export function SkeletonList() {
  return <SkeletonTable rows={6} cols={5} />;
}

// Add shimmer animation via style tag
if (typeof document !== 'undefined' && !document.getElementById('skeleton-style')) {
  const style = document.createElement('style');
  style.id = 'skeleton-style';
  style.textContent = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
  document.head.appendChild(style);
}

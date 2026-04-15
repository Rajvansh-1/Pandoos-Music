export default function Skeleton({ type = 'card', count = 1 }) {
  if (type === 'card-grid') {
    return (
      <div className="card-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>
            <div className="skeleton" style={{ width:'100%', aspectRatio:'1', borderRadius:'var(--radius-md)', marginBottom:'var(--space-3)' }} />
            <div className="skeleton" style={{ height:13, width:'80%', marginBottom:6, borderRadius:'var(--radius-sm)' }} />
            <div className="skeleton" style={{ height:11, width:'55%', borderRadius:'var(--radius-sm)' }} />
          </div>
        ))}
      </div>
    );
  }
  if (type === 'list') {
    return (
      <div className="song-list">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'var(--space-3)', padding:'var(--space-2) var(--space-3)' }}>
            <div className="skeleton" style={{ width:40, height:40, borderRadius:'var(--radius-sm)', flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div className="skeleton" style={{ height:13, width:'60%', marginBottom:6, borderRadius:'var(--radius-sm)' }} />
              <div className="skeleton" style={{ height:11, width:'35%', borderRadius:'var(--radius-sm)' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <div className="skeleton" style={{ height:200, borderRadius:'var(--radius-lg)' }} />;
}

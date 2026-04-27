/**
 * Progress Bar Component
 * @param {Object} props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {number} props.current - Current question number
 * @param {number} props.total - Total questions
 * @param {string} props.sectionName - Current section name
 * @param {string} props.sectionColor - Section color
 */
export function ProgressBar({ progress, current, total, sectionName, sectionColor }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Progress Info */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: '600', 
            color: '#1e1b4b' 
          }}>
            Pertanyaan {current} dari {total}
          </span>
          {sectionName && (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '4px',
              background: sectionColor + '20',
              color: sectionColor,
              textTransform: 'uppercase',
            }}>
              {sectionName}
            </span>
          )}
        </div>
        <span style={{ 
          fontSize: '0.8rem', 
          fontWeight: '700', 
          color: sectionColor || '#6366f1' 
        }}>
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '8px',
        background: '#e2e8f0',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${sectionColor || '#6366f1'}, ${sectionColor ? sectionColor + 'aa' : '#818cf8'})`,
          borderRadius: '4px',
          transition: 'width 0.4s cubic-bezier(.4,0,.2,1)',
          boxShadow: progress > 0 ? `0 2px 8px ${sectionColor || '#6366f1'}40` : 'none',
        }} />
      </div>

      {/* Completion Badge */}
      {progress === 100 && (
        <div style={{
          marginTop: '8px',
          textAlign: 'center',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: '#dcfce7',
            color: '#166534',
            fontSize: '0.75rem',
            fontWeight: '600',
          }}>
            ✅ Semua pertanyaan telah dijawab
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Section Progress Component - untuk menampilkan progress per section
 * @param {Object} props
 * @param {Array} props.sections - Array of sections dengan { key, name, color, answered, total }
 */
export function SectionProgress({ sections }) {
  return (
    <div style={{ marginTop: '16px' }}>
      <h4 style={{
        fontSize: '0.7rem',
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '10px',
      }}>
        Progress per Section
      </h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sections.map((section) => {
          const progress = section.total > 0 ? (section.answered / section.total) * 100 : 0;
          const isComplete = section.answered === section.total && section.total > 0;
          
          return (
            <div key={section.key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: section.color,
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#475569',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {section.key} - {section.name}
              </span>
              <div style={{
                width: '60px',
                height: '4px',
                background: '#e2e8f0',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: section.color,
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: '600',
                color: isComplete ? '#10b981' : '#64748b',
                minWidth: '35px',
                textAlign: 'right',
              }}>
                {section.answered}/{section.total}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProgressBar;

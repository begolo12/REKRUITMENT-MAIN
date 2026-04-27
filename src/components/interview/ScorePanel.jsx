/**
 * Score Panel Component
 * @param {Object} props
 * @param {number} props.totalScore - Total skor
 * @param {number} props.maxScore - Skor maksimum
 * @param {Object} props.sectionScores - Skor per section { [key]: number }
 * @param {Object} props.sections - Data sections { [key]: Array of categories }
 * @param {Object} props.sectionColors - Warna per section { [key]: string }
 * @param {Object} props.sectionNames - Nama per section { [key]: string }
 * @param {boolean} props.isMobile - Apakah tampilan mobile
 */
export function ScorePanel({ 
  totalScore, 
  maxScore = 100, 
  sectionScores, 
  sections,
  sectionColors,
  sectionNames,
  isMobile = false,
}) {
  // Calculate percentage
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  
  // Get score color
  const getScoreColor = () => {
    if (percentage >= 70) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreBgColor = () => {
    if (percentage >= 70) return '#dcfce7';
    if (percentage >= 60) return '#fef3c7';
    return '#fee2e2';
  };

  const scoreColor = getScoreColor();
  const scoreBgColor = getScoreBgColor();

  // Get section keys that have questions
  const sectionKeys = Object.keys(sectionNames).filter(key => 
    sections[key] && sections[key].length > 0
  );

  if (isMobile) {
    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        padding: '16px',
        marginTop: '16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{
              fontSize: '0.7rem',
              fontWeight: '600',
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 4px 0',
            }}>
              Total Skor
            </p>
            <p style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              color: scoreColor,
              margin: 0,
              lineHeight: 1,
            }}>
              {totalScore.toFixed(1)}
            </p>
            <p style={{
              fontSize: '0.7rem',
              color: '#94a3b8',
              margin: '2px 0 0 0',
            }}>
              dari {maxScore} poin
            </p>
          </div>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: `4px solid ${scoreColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: scoreBgColor,
          }}>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: '700',
              color: scoreColor,
            }}>
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      padding: '24px',
      position: 'sticky',
      top: '20px',
    }}>
      {/* Total Score */}
      <div style={{
        textAlign: 'center',
        paddingBottom: '20px',
        borderBottom: '1px solid #f1f5f9',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: `4px solid ${scoreColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          background: scoreBgColor,
          boxShadow: `0 4px 15px ${scoreColor}30`,
        }}>
          <span style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            color: scoreColor,
          }}>
            {totalScore.toFixed(1)}
          </span>
        </div>
        <p style={{
          fontSize: '0.85rem',
          fontWeight: '700',
          color: '#1e1b4b',
          margin: '0 0 4px 0',
        }}>
          Total Skor
        </p>
        <p style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          margin: 0,
        }}>
          dari {maxScore} poin ({Math.round(percentage)}%)
        </p>
      </div>

      {/* Section Scores */}
      <div>
        <h4 style={{
          fontSize: '0.7rem',
          fontWeight: '600',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: '0 0 14px 0',
        }}>
          Skor per Kategori
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sectionKeys.map(key => {
            const sectionMaxScore = (sections[key] || []).reduce(
              (sum, c) => sum + c.bobot * 100, 0
            );
            const sectionScore = sectionScores[key] || 0;
            const sectionProgress = sectionMaxScore > 0 
              ? (sectionScore / sectionMaxScore) * 100 
              : 0;
            const isComplete = sectionScore >= sectionMaxScore && sectionMaxScore > 0;
            
            return (
              <div key={key}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '2px',
                      background: sectionColors[key],
                    }} />
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#475569',
                    }}>
                      {key}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: isComplete ? '#10b981' : sectionColors[key],
                  }}>
                    {sectionScore.toFixed(1)}/{sectionMaxScore.toFixed(0)}
                  </span>
                </div>
                <div style={{
                  height: '4px',
                  background: '#e2e8f0',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${sectionProgress}%`,
                    height: '100%',
                    background: sectionColors[key],
                    borderRadius: '2px',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Badge */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        borderRadius: '10px',
        background: scoreBgColor,
        textAlign: 'center',
      }}>
        <span style={{
          fontSize: '0.8rem',
          fontWeight: '700',
          color: scoreColor,
        }}>
          {percentage >= 70 ? '✅ Lulus' : percentage >= 60 ? '⚠️ Lulus dengan Catatan' : '❌ Tidak Lulus'}
        </span>
      </div>
    </div>
  );
}

export default ScorePanel;

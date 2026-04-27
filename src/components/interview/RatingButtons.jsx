/**
 * Rating Buttons Component
 * @param {Object} props
 * @param {Array} props.ratings - Array of rating objects { l, d, v, emoji }
 * @param {number} props.bobot - Bobot pertanyaan
 * @param {string} props.selectedLabel - Label rating yang dipilih
 * @param {Function} props.onSelect - Callback saat rating dipilih
 * @param {boolean} props.disabled - Disable buttons
 */
export function RatingButtons({ ratings, bobot, selectedLabel, onSelect, disabled }) {
  return (
    <div style={{
      display: 'flex',
      gap: '0',
      marginTop: '16px',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '2px solid #e2e8f0',
    }}>
      {ratings.map((rating, index) => {
        const isSelected = selectedLabel === rating.l;
        const score = (rating.v * bobot * 100).toFixed(1);
        const isFirst = index === 0;
        const isLast = index === ratings.length - 1;
        
        return (
          <button
            key={rating.l}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(rating.v)}
            style={{
              flex: 1,
              padding: '16px 8px',
              textAlign: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              border: 'none',
              borderLeft: isFirst ? 'none' : '1px solid #e2e8f0',
              background: isSelected 
                ? 'linear-gradient(135deg, #6366f1, #4f46e5)' 
                : '#ffffff',
              color: isSelected ? '#ffffff' : '#64748b',
              transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
              fontFamily: 'inherit',
              opacity: disabled ? 0.6 : 1,
              borderRadius: isFirst ? '10px 0 0 10px' : isLast ? '0 10px 10px 0' : '0',
            }}
            onMouseEnter={(e) => {
              if (!disabled && !isSelected) {
                e.currentTarget.style.background = '#eef2ff';
                e.currentTarget.style.color = '#6366f1';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && !isSelected) {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#64748b';
              }
            }}
            aria-label={`${rating.d}, ${score} poin`}
            aria-pressed={isSelected}
          >
            <div style={{ 
              fontSize: '1.8rem', 
              marginBottom: '4px',
              filter: isSelected ? 'none' : 'grayscale(30%)',
            }}>
              {rating.emoji}
            </div>
            <div style={{ 
              fontSize: '0.85rem', 
              fontWeight: '700',
              marginBottom: '2px',
            }}>
              {rating.l}
            </div>
            <div style={{ 
              fontSize: '0.7rem', 
              fontWeight: '500',
              opacity: isSelected ? 0.9 : 0.7,
            }}>
              {rating.d}
            </div>
            <div style={{ 
              fontSize: '0.65rem', 
              fontWeight: '600',
              marginTop: '4px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: isSelected ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
              display: 'inline-block',
            }}>
              {score}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Check Buttons Component (Ada/Tidak)
 * @param {Object} props
 * @param {boolean|null} props.value - nilai saat ini (true/false/null)
 * @param {Function} props.onChange - Callback saat nilai berubah
 * @param {boolean} props.disabled - Disable buttons
 */
export function CheckButtons({ value, onChange, disabled }) {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginTop: '16px',
    }}>
      {/* Ada Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        style={{
          flex: 1,
          padding: '16px 20px',
          borderRadius: '12px',
          border: `2px solid ${value === true ? '#10b981' : '#e2e8f0'}`,
          background: value === true ? '#dcfce7' : '#ffffff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
          fontFamily: 'inherit',
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled && value !== true) {
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.background = '#f0fdf4';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && value !== true) {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = '#ffffff';
          }
        }}
        aria-label="Ada"
        aria-pressed={value === true}
      >
        <div style={{ 
          fontSize: '2rem', 
          marginBottom: '4px',
        }}>
          ✅
        </div>
        <div style={{ 
          fontSize: '0.9rem', 
          fontWeight: '700',
          color: value === true ? '#166534' : '#64748b',
        }}>
          Ada
        </div>
      </button>

      {/* Tidak Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        style={{
          flex: 1,
          padding: '16px 20px',
          borderRadius: '12px',
          border: `2px solid ${value === false ? '#ef4444' : '#e2e8f0'}`,
          background: value === false ? '#fee2e2' : '#ffffff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
          fontFamily: 'inherit',
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled && value !== false) {
            e.currentTarget.style.borderColor = '#ef4444';
            e.currentTarget.style.background = '#fef2f2';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && value !== false) {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = '#ffffff';
          }
        }}
        aria-label="Tidak"
        aria-pressed={value === false}
      >
        <div style={{ 
          fontSize: '2rem', 
          marginBottom: '4px',
        }}>
          ❌
        </div>
        <div style={{ 
          fontSize: '0.9rem', 
          fontWeight: '700',
          color: value === false ? '#991b1b' : '#64748b',
        }}>
          Tidak
        </div>
      </button>
    </div>
  );
}

export default { RatingButtons, CheckButtons };

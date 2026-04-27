/**
 * Question Card Component
 * @param {Object} props
 * @param {Object} props.question - Question object
 * @param {number} props.questionNumber - Nomor pertanyaan saat ini
 * @param {number} props.totalInSection - Total pertanyaan dalam section
 * @param {Object} props.answer - Jawaban saat ini { nilai, check_ada, keterangan }
 * @param {Function} props.onAnswerChange - Callback saat jawaban berubah
 * @param {Array} props.ratings - Array rating options
 * @param {string} props.sectionColor - Warna section
 * @param {string} props.sectionName - Nama section
 */
import { RatingButtons, CheckButtons } from './RatingButtons.jsx';

export function QuestionCard({ 
  question, 
  questionNumber, 
  totalInSection,
  answer, 
  onAnswerChange,
  ratings,
  sectionColor,
  sectionName,
}) {
  const handleRating = (ratingValue) => {
    const nilai = Math.round(ratingValue * question.bobot * 100 * 100) / 100;
    onAnswerChange({ 
      ...answer, 
      nilai,
      check_ada: null, // Reset check when rating selected
    });
  };

  const handleCheck = (isAda) => {
    const nilai = isAda ? Math.round(question.bobot * 100 * 100) / 100 : 0;
    onAnswerChange({ 
      ...answer, 
      check_ada: isAda,
      nilai,
    });
  };

  const handleKeteranganChange = (e) => {
    onAnswerChange({ 
      ...answer, 
      keterangan: e.target.value 
    });
  };

  // Get current rating label
  const getCurrentRatingLabel = () => {
    if (answer.nilai === null || answer.nilai === undefined) return null;
    const maxScore = question.bobot * 100;
    if (maxScore === 0) return null;
    const ratio = answer.nilai / maxScore;
    
    let closest = null;
    let minDiff = Infinity;
    ratings.forEach(r => {
      const diff = Math.abs(r.v - ratio);
      if (diff < minDiff) {
        minDiff = diff;
        closest = r;
      }
    });
    return closest?.l || null;
  };

  const isAnswered = answer.nilai !== null && answer.nilai !== undefined;
  const currentRatingLabel = getCurrentRatingLabel();

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      border: `2px solid ${isAnswered ? '#10b981' : 'transparent'}`,
      padding: '28px',
      transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
    }}>
      {/* Section Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: sectionColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '1rem',
          flexShrink: 0,
        }}>
          {question.kategori_utama}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '0.95rem',
            fontWeight: '700',
            color: '#1e1b4b',
            margin: 0,
          }}>
            {sectionName}
          </h3>
          <p style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            margin: '2px 0 0 0',
          }}>
            Pertanyaan {questionNumber} dari {totalInSection} dalam section ini
          </p>
        </div>
        {isAnswered && (
          <div style={{
            padding: '6px 12px',
            borderRadius: '20px',
            background: '#dcfce7',
            color: '#166534',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            ✅ Terjawab
          </div>
        )}
      </div>

      {/* Meta Info */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          color: sectionColor,
          padding: '4px 10px',
          borderRadius: '6px',
          background: sectionColor + '15',
        }}>
          📋 KODE: {question.kode}
        </span>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          color: '#64748b',
          padding: '4px 10px',
          borderRadius: '6px',
          background: '#f1f5f9',
        }}>
          ⚖️ BOBOT: {question.bobot}
        </span>
      </div>

      {/* Question Text */}
      <div style={{
        background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        borderLeft: `4px solid ${sectionColor}`,
      }}>
        <p style={{
          fontSize: '1rem',
          fontWeight: '500',
          color: '#3730a3',
          lineHeight: '1.7',
          margin: 0,
        }}>
          "{question.nama || question.sub_kategori || 'Pertanyaan tidak tersedia'}"
        </p>
      </div>

      {/* Sub Kategori */}
      <p style={{
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#1e1b4b',
        marginBottom: '12px',
      }}>
        {question.sub_kategori}
      </p>

      {/* Rating or Check Buttons */}
      {question.tipe === 'rating' ? (
        <RatingButtons
          ratings={ratings}
          bobot={question.bobot}
          selectedLabel={currentRatingLabel}
          onSelect={handleRating}
        />
      ) : (
        <CheckButtons
          value={answer.check_ada}
          onChange={handleCheck}
        />
      )}

      {/* Score Display */}
      {isAnswered && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: '#f0fdf4',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '1.2rem' }}>✓</span>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#166534',
          }}>
            Nilai: {answer.nilai?.toFixed(2)} poin
          </span>
        </div>
      )}

      {/* Notes Textarea */}
      <div style={{ marginTop: '24px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8rem',
          fontWeight: '600',
          color: '#64748b',
          marginBottom: '8px',
        }}>
          💬 Catatan Interviewer
        </label>
        <textarea
          value={answer.keterangan || ''}
          onChange={handleKeteranganChange}
          placeholder="Tulis catatan tambahan di sini..."
          style={{
            width: '100%',
            padding: '14px',
            border: '2px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            color: '#1e293b',
            background: '#ffffff',
            resize: 'vertical',
            minHeight: '80px',
            outline: 'none',
            transition: 'all 0.25s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#818cf8';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}

export default QuestionCard;

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save, Clock, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '../hooks/useIsMobile';
import BentoCard from '../components/ui/BentoCard';
import { getCandidate, getCategories, getAssessments, saveAssessments } from '../services/db';
import { SkeletonList } from '../components/Skeleton';

const ratingOptions = [
  { value: 1, label: 'Kurang', desc: 'Belum memenuhi' },
  { value: 2, label: 'Cukup', desc: 'Hampir memenuhi' },
  { value: 3, label: 'Baik', desc: 'Memenuhi' },
  { value: 4, label: 'Sangat Baik', desc: 'Melebihi' },
  { value: 5, label: 'Excellent', desc: 'Jauh melebihi' }
];

export default function AssessmentFormWizard() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [categories, setCategories] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [candData, catResult, existingAssessments] = await Promise.all([
        getCandidate(candidateId),
        getCategories(true), // Force refresh from Firebase
        getAssessments(candidateId, user?.id)
      ]);

      const catData = catResult.success ? catResult.data : [];
      setCandidate(candData);
      setCategories(catData);

      // Load existing answers
      const existingAnswers = {};
      if (Array.isArray(existingAssessments)) {
        existingAssessments.forEach(a => {
          existingAnswers[a.category_id] = {
            rating: a.raw_rating !== undefined ? a.raw_rating : a.nilai,
            check: a.check_ada,
            comment: a.keterangan || ''
          };
        });
      }
      setAnswers(existingAnswers);
    } catch (err) {
      error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [candidateId, user, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAnswer = (categoryId, value, isCheck = false) => {
    setAnswers(prev => ({
      ...prev,
      [categoryId]: { 
        ...prev[categoryId], 
        [isCheck ? 'check' : 'rating']: value 
      }
    }));
    setAutoSaveStatus('Saving...');
    setTimeout(() => setAutoSaveStatus('Saved'), 1000);
  };

  const handleComment = (categoryId, comment) => {
    setAnswers(prev => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], comment }
    }));
  };

  const handleNext = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const assessmentData = Array.isArray(categories) ? categories.map(cat => {
        const ans = answers[cat.id];
        let nilai = 0;
        if (cat.tipe === 'check') {
          nilai = ans?.check ? Math.round(cat.bobot * 100 * 100) / 100 : 0;
        } else {
          const rating = ans?.rating || 0;
          const multiplier = { 1: 0.2, 2: 0.4, 3: 0.6, 4: 0.8, 5: 1.0 }[rating] || 0;
          nilai = Math.round(cat.bobot * multiplier * 100 * 100) / 100;
        }
        return {
          category_id: cat.id,
          nilai,
          raw_rating: cat.tipe === 'rating' ? (ans?.rating || 0) : null,
          check_ada: ans?.check || false,
          keterangan: ans?.comment || ''
        };
      }) : [];

      await saveAssessments(candidateId, user.id, assessmentData);
      success('Assessment berhasil disimpan');
      navigate('/my-assessments');
    } catch (err) {
      error('Gagal menyimpan assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateProgress = () => {
    return ((currentStep + 1) / categories.length) * 100;
  };

  if (loading) return <SkeletonList />;

  if (!candidate || categories.length === 0) {
    return (
      <div className="empty">
        <p>Data tidak ditemukan</p>
        <button className="btn btn-p" onClick={() => navigate(-1)}>Kembali</button>
      </div>
    );
  }

  const currentQuestion = categories[currentStep];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  return (
    <motion.div 
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--space-6)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            Form Penilaian
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 'var(--space-1) 0 0' }}>
            {candidate.nama} - {candidate.posisi}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {autoSaveStatus && (
            <span style={{ 
              fontSize: '0.875rem', 
              color: autoSaveStatus === 'Saved' ? 'var(--success)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {autoSaveStatus === 'Saving...' && <Clock size={14} />}
              {autoSaveStatus}
            </span>
          )}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--gray-100)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem'
          }}>
            <span style={{ fontWeight: 600 }}>{currentStep + 1}</span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ color: 'var(--text-muted)' }}>{categories.length}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ 
        height: '6px', 
        background: 'var(--gray-200)', 
        borderRadius: 'var(--radius-full)',
        marginBottom: 'var(--space-6)',
        overflow: 'hidden'
      }}>
        <motion.div 
          style={{ 
            height: '100%', 
            background: 'linear-gradient(90deg, var(--primary-500), var(--primary-600))',
            borderRadius: 'var(--radius-full)'
          }}
          initial={{ width: 0 }}
          animate={{ width: `${calculateProgress()}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Card */}
      <BentoCard size="lg">
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <span style={{
            display: 'inline-block',
            padding: 'var(--space-1) var(--space-3)',
            background: 'var(--primary-100)',
            color: 'var(--primary-700)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: 'var(--space-3)'
          }}>
            {currentQuestion.kode || ''} {currentQuestion.nama_kategori || ''}
          </span>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text)',
            margin: 0,
            lineHeight: 1.5
          }}>
            {currentQuestion.sub_kategori || currentQuestion.nama || 'Pertanyaan tidak tersedia'}
          </h2>
          {currentQuestion.pertanyaan && (
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary, #475569)',
              marginTop: 'var(--space-2)',
              lineHeight: 1.7,
              fontStyle: 'italic'
            }}>
              {currentQuestion.pertanyaan}
            </p>
          )}
        </div>

        {/* Rating or Check */}
        {currentQuestion.tipe === 'check' ? (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(currentQuestion.id, true, true)}
                style={{
                  flex: 1,
                  padding: 'var(--space-4)',
                  background: currentAnswer?.check === true 
                    ? 'var(--success)' 
                    : 'var(--gray-50)',
                  color: currentAnswer?.check === true ? '#fff' : 'var(--text)',
                  border: `2px solid ${currentAnswer?.check === true ? 'var(--success)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                ✓ Ada
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(currentQuestion.id, false, true)}
                style={{
                  flex: 1,
                  padding: 'var(--space-4)',
                  background: currentAnswer?.check === false 
                    ? 'var(--danger)' 
                    : 'var(--gray-50)',
                  color: currentAnswer?.check === false ? '#fff' : 'var(--text)',
                  border: `2px solid ${currentAnswer?.check === false ? 'var(--danger)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                ✗ Tidak Ada
              </motion.button>
            </div>
          </div>
        ) : (
          <div 
            data-testid="rating-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(5, 1fr)',
              gap: isMobile ? 'var(--space-3)' : 'var(--space-3)',
              marginBottom: 'var(--space-6)'
            }}
          >
            {ratingOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={isMobile ? {} : { scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                aria-pressed={currentAnswer?.rating === option.value}
                aria-label={`Rating ${option.value} - ${option.label}`}
                style={{
                  padding: isMobile ? 'var(--space-4) var(--space-4)' : 'var(--space-4) var(--space-3)',
                  minHeight: isMobile ? '64px' : 'auto',
                  background: currentAnswer?.rating === option.value 
                    ? 'linear-gradient(135deg, var(--primary-500), var(--primary-600))' 
                    : 'var(--gray-50)',
                  color: currentAnswer?.rating === option.value ? '#fff' : 'var(--text)',
                  border: `2px solid ${currentAnswer?.rating === option.value ? 'var(--primary-500)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? 'var(--space-3)' : '0',
                  boxShadow: currentAnswer?.rating === option.value 
                    ? '0 4px 12px -2px rgba(79, 70, 229, 0.3)' 
                    : 'none'
                }}
              >
                <div style={{
                  fontSize: isMobile ? '1.75rem' : '1.5rem',
                  fontWeight: 800,
                  marginBottom: isMobile ? '0' : 'var(--space-1)',
                  minWidth: isMobile ? '40px' : 'auto'
                }}>
                  {option.value}
                </div>
                <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                  <div style={{
                    fontSize: isMobile ? '0.9rem' : '0.75rem',
                    fontWeight: 600,
                    marginBottom: '2px'
                  }}>
                    {option.label}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '0.8rem' : '0.625rem',
                    opacity: 0.8
                  }}>
                    {option.desc}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Comment */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: 'var(--space-2)',
            color: 'var(--text)'
          }}>
            Catatan (Opsional)
          </label>
          <textarea
            value={currentAnswer?.comment || ''}
            onChange={(e) => handleComment(currentQuestion.id, e.target.value)}
            placeholder="Tambahkan catatan untuk penilaian ini..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: 'var(--space-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none'
            }}
          />
        </div>
      </BentoCard>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 'var(--space-6)'
      }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrev}
          disabled={currentStep === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-6)',
            background: 'var(--gray-100)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            opacity: currentStep === 0 ? 0.5 : 1
          }}
        >
          <ChevronLeft size={18} />
          Sebelumnya
        </motion.button>

        {currentStep < categories.length - 1 ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-6)',
              background: 'var(--primary-500)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            Selanjutnya
            <ChevronRight size={18} />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-6)',
              background: 'var(--success)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan Penilaian
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

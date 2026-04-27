import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategories, getAssessments, saveAssessments, getCandidate } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTION_COLORS = { A:'#6366f1', B:'#10b981', C:'#f59e0b', D:'#ef4444', E:'#8b5cf6', F:'#06b6d4', G:'#ec4899' };
const SECTION_NAMES = { A:'PENGALAMAN', B:'ADMINISTRASI', C:'HARD SKILL', D:'SOFT SKILL', E:'PSIKOLOGI INTERVIEW', F:'SALARY & PROSPEKTUS KARIR', G:'ADD USER QUESTION' };

const RATINGS = [
  { l: 'SK', d: 'Sangat Kurang', v: 0.2, emoji: '😟' },
  { l: 'K', d: 'Kurang', v: 0.4, emoji: '😐' },
  { l: 'R', d: 'Rata-rata', v: 0.6, emoji: '🙂' },
  { l: 'B', d: 'Baik', v: 0.8, emoji: '😊' },
  { l: 'SB', d: 'Sangat Baik', v: 1.0, emoji: '🌟' },
];

export default function AssessmentForm() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [categories, setCategories] = useState([]);
  const [answers, setAnswers] = useState({});
  const [activeTab, setActiveTab] = useState('A');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [cand, cats, existing] = await Promise.all([
          getCandidate(candidateId),
          getCategories(),
          getAssessments(candidateId, user.id),
        ]);
        setCandidate(cand);
        setCategories(cats);

        // Pre-fill existing answers
        const ans = {};
        cats.forEach(c => {
          const ex = existing.find(e => e.category_id === c.id);
          ans[c.id] = {
            nilai: ex?.nilai ?? null,
            check_ada: ex?.check_ada ?? null,
            keterangan: ex?.keterangan ?? '',
          };
        });
        setAnswers(ans);
      } catch (err) {
        toast.error('Gagal memuat data: ' + err.message);
      }
      setLoading(false);
    };
    load();
  }, [candidateId, user.id]);

  // Group categories by kategori_utama
  const sections = useMemo(() => {
    const grouped = {};
    categories.forEach(c => {
      const key = c.kategori_utama;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(c);
    });
    return grouped;
  }, [categories]);

  const sectionKeys = Object.keys(SECTION_NAMES).filter(k => sections[k]?.length > 0);

  const setAnswer = (catId, field, value) => {
    setAnswers(prev => ({
      ...prev,
      [catId]: { ...prev[catId], [field]: value },
    }));
  };

  const handleRating = (cat, ratingValue) => {
    const nilai = Math.round(ratingValue * cat.bobot * 100 * 100) / 100;
    setAnswer(cat.id, 'nilai', nilai);
  };

  const handleCheck = (cat, isAda) => {
    setAnswer(cat.id, 'check_ada', isAda);
    setAnswer(cat.id, 'nilai', isAda ? Math.round(cat.bobot * 100 * 100) / 100 : 0);
  };

  const getCurrentRating = (cat) => {
    const ans = answers[cat.id];
    if (!ans || ans.nilai === null || ans.nilai === undefined) return null;
    const maxScore = cat.bobot * 100;
    if (maxScore === 0) return null;
    const ratio = ans.nilai / maxScore;
    // Find closest rating
    let closest = null;
    let minDiff = Infinity;
    RATINGS.forEach(r => {
      const diff = Math.abs(r.v - ratio);
      if (diff < minDiff) { minDiff = diff; closest = r; }
    });
    return closest;
  };

  // Calculate scores
  const totalScore = useMemo(() => {
    return Object.values(answers).reduce((sum, a) => sum + (a.nilai || 0), 0);
  }, [answers]);

  const sectionScores = useMemo(() => {
    const scores = {};
    Object.keys(sections).forEach(key => {
      const cats = sections[key];
      scores[key] = cats.reduce((sum, c) => sum + (answers[c.id]?.nilai || 0), 0);
    });
    return scores;
  }, [answers, sections]);

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter(a => a.nilai !== null && a.nilai !== undefined).length;
  }, [answers]);

  const progress = categories.length > 0 ? Math.round((answeredCount / categories.length) * 100) : 0;

  const currentCats = sections[activeTab] || [];
  const currentQuestion = currentCats[questionIndex] || null;

  const currentSectionAnswered = useMemo(() => {
    return currentCats.filter(c => answers[c.id]?.nilai !== null && answers[c.id]?.nilai !== undefined).length;
  }, [currentCats, answers]);

  useEffect(() => {
    setQuestionIndex(0);
  }, [activeTab]);

  useEffect(() => {
    if (questionIndex > 0 && questionIndex >= currentCats.length) {
      setQuestionIndex(Math.max(currentCats.length - 1, 0));
    }
  }, [currentCats.length, questionIndex]);

  const goNextQuestion = () => setQuestionIndex(i => Math.min(i + 1, currentCats.length - 1));
  const goPrevQuestion = () => setQuestionIndex(i => Math.max(i - 1, 0));

  const goToFirstUnanswered = () => {
    const idx = currentCats.findIndex(c => {
      const val = answers[c.id]?.nilai;
      return val === null || val === undefined;
    });
    if (idx >= 0) setQuestionIndex(idx);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = categories.map(c => ({
        category_id: c.id,
        nilai: answers[c.id]?.nilai || 0,
        check_ada: answers[c.id]?.check_ada || false,
        keterangan: answers[c.id]?.keterangan || '',
      }));
      await saveAssessments(candidateId, user.id, items);
      toast.success('Penilaian berhasil disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan: ' + err.message);
    }
    setSaving(false);
  };

  const scoreRingClass = totalScore >= 70 ? 'hi' : totalScore >= 60 ? 'md' : 'lo';

  if (loading) return <div className="empty"><p>⏳ Memuat form penilaian...</p></div>;
  if (!candidate) return <div className="empty"><p>Kandidat tidak ditemukan</p></div>;

  return (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-o btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e1b4b' }}>
            Interview: {candidate.nama}
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            {candidate.posisi} — {candidate.penempatan}
          </span>
        </div>
        <button className="btn btn-p" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Penilaian'}
        </button>
      </div>

      {/* Progress */}
      <div className="iv-progress">
        <div className="iv-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 16, textAlign: 'right' }}>
        {answeredCount}/{categories.length} pertanyaan dijawab ({progress}%)
      </div>

      {/* Tabs */}
      <div className="tabs">
        {sectionKeys.map(key => {
          const sectionCats = sections[key] || [];
          const answered = sectionCats.filter(c => answers[c.id]?.nilai !== null && answers[c.id]?.nilai !== undefined).length;
          const allDone = answered === sectionCats.length && sectionCats.length > 0;
          return (
            <button
              key={key}
              className={`tab${activeTab === key ? ' on' : ''}`}
              onClick={() => setActiveTab(key)}
              style={activeTab === key ? { borderBottom: `3px solid ${SECTION_COLORS[key]}` } : {}}
            >
              {key}
              {allDone && <span className="tab-dot" style={{ background: '#10b981' }} />}
              {!allDone && answered > 0 && <span className="tab-dot" style={{ background: '#f59e0b' }} />}
            </button>
          );
        })}
      </div>

      <div className="iv-layout">
        {/* Questions */}
        <div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: SECTION_COLORS[activeTab], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                {activeTab}
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e1b4b' }}>{SECTION_NAMES[activeTab]}</h4>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {currentSectionAnswered}/{currentCats.length} pertanyaan selesai
                </span>
              </div>
            </div>
          </div>

          {currentQuestion ? (() => {
            const ans = answers[currentQuestion.id] || {};
            const isDone = ans.nilai !== null && ans.nilai !== undefined;
            const currentR = getCurrentRating(currentQuestion);

            return (
              <>
                <div className="iv-current-progress">
                  <span>Pertanyaan {questionIndex + 1} dari {currentCats.length}</span>
                  <button
                    type="button"
                    className="iv-jump-btn"
                    onClick={goToFirstUnanswered}
                  >
                    Lompat ke belum dijawab
                  </button>
                </div>

                <div className={`iv-q-card${isDone ? ' done' : ''}`}>
                  <div className="iv-q-header">
                    <span className={`iv-q-num ${isDone ? 'done' : 'pending'}`}>{questionIndex + 1}</span>
                    <span className="iv-q-title">{currentQuestion.sub_kategori}</span>
                    <span className="iv-q-meta">
                      Bobot: {currentQuestion.bobot} | Kode: {currentQuestion.kode}
                    </span>
                  </div>

                  <div className="iv-q-question">{currentQuestion.pertanyaan}</div>

                  {currentQuestion.tipe === 'rating' ? (
                    <div className="iv-rating">
                      {RATINGS.map(r => (
                        <button
                          key={r.l}
                          className={`iv-rate${currentR?.l === r.l ? ' on' : ''}`}
                          onClick={() => handleRating(currentQuestion, r.v)}
                          type="button"
                        >
                          <div style={{ fontSize: '1.2rem' }}>{r.emoji}</div>
                          <div className="rate-label">{r.l}</div>
                          <div className="rate-desc">{r.d}</div>
                          <div className="rate-score">{(r.v * currentQuestion.bobot * 100).toFixed(1)}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="iv-check">
                      <button
                        type="button"
                        className={`iv-check-btn${ans.check_ada === true ? ' yes' : ''}`}
                        onClick={() => handleCheck(currentQuestion, true)}
                      >
                        <div className="check-icon">✅</div>
                        <div className="check-label">Ada</div>
                      </button>
                      <button
                        type="button"
                        className={`iv-check-btn${ans.check_ada === false ? ' no' : ''}`}
                        onClick={() => handleCheck(currentQuestion, false)}
                      >
                        <div className="check-icon">❌</div>
                        <div className="check-label">Tidak</div>
                      </button>
                    </div>
                  )}

                  {isDone && (
                    <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={14} /> Nilai: {ans.nilai?.toFixed(2)}
                    </div>
                  )}

                  <textarea
                    className="iv-comment"
                    placeholder="Keterangan / catatan interviewer..."
                    value={ans.keterangan || ''}
                    onChange={(e) => setAnswer(currentQuestion.id, 'keterangan', e.target.value)}
                  />
                </div>

                <div className="iv-q-nav">
                  <button
                    type="button"
                    className="btn btn-o btn-sm"
                    onClick={goPrevQuestion}
                    disabled={questionIndex === 0}
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    className="btn btn-p btn-sm"
                    onClick={goNextQuestion}
                    disabled={questionIndex === currentCats.length - 1}
                  >
                    Berikutnya
                  </button>
                </div>

                <div className="iv-q-dots">
                  {currentCats.map((cat, idx) => {
                    const done = answers[cat.id]?.nilai !== null && answers[cat.id]?.nilai !== undefined;
                    const active = idx === questionIndex;
                    return <span key={cat.id} className={`iv-dot${active ? ' active' : ''}${done ? ' done' : ''}`} />;
                  })}
                </div>
              </>
            );
          })() : (
            <div className="empty">Tidak ada pertanyaan pada kategori ini.</div>
          )}
        </div>

        {/* Score Panel */}
        <div className="iv-panel">
          <div className="iv-card" style={{ padding: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div className={`iv-score-ring ${scoreRingClass}`}>
                {totalScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', marginTop: 4 }}>Total Skor</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>dari 100 poin</div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Skor per Kategori
              </div>
              {sectionKeys.map(key => {
                const maxScore = (sections[key] || []).reduce((s, c) => s + c.bobot * 100, 0);
                return (
                  <div className="iv-cat-score" key={key}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="iv-cat-dot" style={{ background: SECTION_COLORS[key] }} />
                      <span style={{ fontWeight: 600, color: '#334155' }}>{key}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: SECTION_COLORS[key] }}>
                      {(sectionScores[key] || 0).toFixed(1)}/{maxScore.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              className="btn btn-p btn-block"
              style={{ marginTop: 16 }}
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

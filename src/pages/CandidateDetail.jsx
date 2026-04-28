import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Briefcase, Calendar, MapPin, 
  Edit2, Trash2, FileText, ClipboardList, ArrowLeft,
  CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight
} from 'lucide-react';
import { getCandidate, getCandidateWithScores, deleteCandidate } from '../services/db';
import { useToast } from '../context/ToastContext';
import BentoCard from '../components/ui/BentoCard';
import ConfirmModal from '../components/ConfirmModal';
import { staggerContainer, staggerItem } from '../utils/animations';

const RATING_LABELS = { 1: 'SK', 2: 'K', 3: 'R', 4: 'B', 5: 'SB' };
const RATING_COLORS = { 1: '#ef4444', 2: '#f59e0b', 3: '#3b82f6', 4: '#10b981', 5: '#059669' };
const SECTION_NAMES = { A: 'Pengalaman', B: 'Administrasi', C: 'Hard Skill', D: 'Soft Skill', E: 'Psikologi Interview', F: 'Salary & Prospektus Karir', G: 'Additional Questions' };

const tabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'assessments', label: 'Assessments', icon: ClipboardList },
  { id: 'documents', label: 'Documents', icon: FileText }
];

const statusConfig = {
  'Lulus': { color: 'var(--success)', bg: 'var(--success-bg)', icon: CheckCircle },
  'Lulus dengan Catatan': { color: 'var(--warning)', bg: 'var(--warning-bg)', icon: AlertCircle },
  'Tidak Lulus': { color: 'var(--danger)', bg: 'var(--danger-bg)', icon: XCircle },
  'Dalam Proses': { color: 'var(--info)', bg: 'var(--info-bg)', icon: ClipboardList }
};

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedAssessor, setSelectedAssessor] = useState(null);

  useEffect(() => {
    loadCandidate();
  }, [id]);

  const loadCandidate = async () => {
    try {
      const data = await getCandidateWithScores(id);
      setCandidate(data);
      // Auto-select first assessor
      if (data?.detail_by_assessor) {
        const firstKey = Object.keys(data.detail_by_assessor)[0];
        if (firstKey) setSelectedAssessor(firstKey);
      }
    } catch (err) {
      error('Gagal memuat data kandidat');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCandidate(id);
      success('Kandidat berhasil dihapus');
      navigate('/candidates');
    } catch (err) {
      error('Gagal menghapus kandidat');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleStartAssessment = () => {
    navigate(`/assessment/${id}`);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '60vh'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid var(--border)', 
            borderTopColor: 'var(--primary-500)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto var(--space-4)'
          }} />
          Memuat data...
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Kandidat tidak ditemukan</p>
          <button 
            onClick={() => navigate('/candidates')}
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--primary-500)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const status = statusConfig[candidate.status] || statusConfig['Dalam Proses'];
  const StatusIcon = status.icon;

  return (
    <motion.div 
      className="page"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Back Button */}
      <motion.button
        variants={staggerItem}
        onClick={() => navigate('/candidates')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '0.875rem'
        }}
      >
        <ArrowLeft size={18} />
        Kembali ke Daftar
      </motion.button>

      {/* Profile Header */}
      <motion.div 
        variants={staggerItem}
        style={{ marginBottom: 'var(--space-6)' }}
      >
        <BentoCard size="lg">
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 'var(--space-6)',
            flexWrap: 'wrap'
          }}>
            {/* Avatar */}
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '2.5rem',
              fontWeight: 700,
              flexShrink: 0
            }}>
              {candidate.nama?.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-2)',
                flexWrap: 'wrap'
              }}>
                <h1 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 800, 
                  margin: 0,
                  color: 'var(--text)'
                }}>
                  {candidate.nama}
                </h1>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-1) var(--space-3)',
                  background: status.bg,
                  color: status.color,
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  <StatusIcon size={14} />
                  {candidate.status || 'Dalam Proses'}
                </span>
              </div>
              
              <p style={{ 
                fontSize: '1rem', 
                color: 'var(--text-muted)',
                margin: 0,
                marginBottom: 'var(--space-4)'
              }}>
                {candidate.posisi} • {candidate.divisi}
              </p>

              {/* Quick Info */}
              <div style={{
                display: 'flex',
                gap: 'var(--space-6)',
                flexWrap: 'wrap'
              }}>
                {candidate.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Mail size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{candidate.email}</span>
                  </div>
                )}
                {candidate.telepon && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Phone size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{candidate.telepon}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Calendar size={16} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>
                    {candidate.created_at?.toDate 
                      ? candidate.created_at.toDate().toLocaleDateString('id-ID')
                      : candidate.created_at 
                        ? new Date(candidate.created_at).toLocaleDateString('id-ID')
                        : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-2)',
              flexWrap: 'wrap'
            }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/candidates/${id}?edit=true`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--gray-100)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                <Edit2 size={16} />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartAssessment}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--primary-500)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                <ClipboardList size={16} />
                Assessment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                <Trash2 size={16} />
                Hapus
              </motion.button>
            </div>
          </div>
        </BentoCard>
      </motion.div>

      {/* Tabs */}
      <motion.div 
        variants={staggerItem}
        style={{ 
          display: 'flex', 
          gap: 'var(--space-1)',
          marginBottom: 'var(--space-6)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--primary-500)' : 'transparent'}`,
                color: activeTab === tab.id ? 'var(--primary-600)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '-1px',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={staggerItem}>
        {activeTab === 'overview' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-4)'
          }}>
            <BentoCard title="Informasi Pribadi" size="lg">
              <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Nama Lengkap
                  </label>
                  <p style={{ margin: 'var(--space-1) 0 0', fontSize: '1rem', fontWeight: 500 }}>{candidate.nama}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Email
                  </label>
                  <p style={{ margin: 'var(--space-1) 0 0', fontSize: '1rem' }}>{candidate.email || '-'}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Telepon
                  </label>
                  <p style={{ margin: 'var(--space-1) 0 0', fontSize: '1rem' }}>{candidate.telepon || '-'}</p>
                </div>
              </div>
            </BentoCard>

            <BentoCard title="Informasi Pekerjaan" size="lg">
              <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Posisi
                  </label>
                  <p style={{ margin: 'var(--space-1) 0 0', fontSize: '1rem', fontWeight: 500 }}>{candidate.posisi}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Divisi
                  </label>
                  <p style={{ margin: 'var(--space-1) 0 0', fontSize: '1rem' }}>{candidate.divisi}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Status
                  </label>
                  <p style={{ margin: 'var(--space-1) 0 0', fontSize: '1rem' }}>{candidate.status || 'Dalam Proses'}</p>
                </div>
              </div>
            </BentoCard>
          </div>
        )}

        {activeTab === 'assessments' && (
          <>
            {/* Score Summary Cards */}
            {candidate.scores_by_assessor && candidate.scores_by_assessor.length > 0 ? (
              <>
                {/* Average Score */}
                <div style={{
                  background: candidate.avg_score >= 70 ? 'linear-gradient(135deg, #059669, #10b981)' : candidate.avg_score >= 60 ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'linear-gradient(135deg, #dc2626, #ef4444)',
                  borderRadius: '20px',
                  padding: '28px 32px',
                  marginBottom: '20px',
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: '4px' }}>Rata-rata Skor</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{candidate.avg_score}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>dari 100</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {candidate.scores_by_assessor.map((s, i) => (
                      <div key={i} style={{
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        textAlign: 'center',
                        minWidth: '80px',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{s.total_score}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>
                          {s.assessor?.role || 'User'}
                        </div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>
                          {s.assessor?.full_name?.split(' ')[0] || ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assessor Tabs */}
                {candidate.detail_by_assessor && (
                  <>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      {Object.entries(candidate.detail_by_assessor).map(([aid, data]) => (
                        <button
                          key={aid}
                          onClick={() => setSelectedAssessor(aid)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: selectedAssessor === aid ? '2px solid var(--primary-500)' : '2px solid var(--border)',
                            background: selectedAssessor === aid ? 'var(--primary-50, #eef2ff)' : '#fff',
                            color: selectedAssessor === aid ? 'var(--primary-600)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                          }}
                        >
                          {data.assessor?.role?.toUpperCase()} — {data.total}
                          <div style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.7 }}>{data.assessor?.full_name}</div>
                        </button>
                      ))}
                    </div>

                    {/* Detail per Assessor */}
                    {selectedAssessor && candidate.detail_by_assessor[selectedAssessor] && (() => {
                      const detail = candidate.detail_by_assessor[selectedAssessor];
                      // Group items by kategori_utama
                      const grouped = {};
                      detail.items.forEach(item => {
                        const key = item.category?.kategori_utama || '?';
                        if (!grouped[key]) grouped[key] = { items: [], totalScore: 0, totalBobot: 0 };
                        grouped[key].items.push(item);
                        grouped[key].totalScore += item.score;
                        grouped[key].totalBobot += (item.category?.bobot || 0);
                      });

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([key, group]) => {
                            const isExpanded = expandedSections[`${selectedAssessor}_${key}`];
                            const sectionScore = Math.round(group.totalScore * 100) / 100;
                            const maxScore = Math.round(group.totalBobot * 100 * 100) / 100;

                            return (
                              <div key={key} style={{
                                background: '#fff',
                                borderRadius: '14px',
                                border: '1px solid var(--border)',
                                overflow: 'hidden'
                              }}>
                                {/* Section Header - Collapsible */}
                                <button
                                  onClick={() => toggleSection(`${selectedAssessor}_${key}`)}
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '14px 18px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {isExpanded ? <ChevronDown size={18} color="#64748b" /> : <ChevronRight size={18} color="#64748b" />}
                                    <span style={{
                                      width: '32px', height: '32px',
                                      borderRadius: '8px',
                                      background: 'var(--primary-50, #eef2ff)',
                                      color: 'var(--primary-600)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontWeight: 700, fontSize: '0.8rem'
                                    }}>{key}</span>
                                    <div style={{ textAlign: 'left' }}>
                                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                                        {SECTION_NAMES[key] || key}
                                      </div>
                                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                        {group.items.length} pertanyaan · Bobot: {Math.round(group.totalBobot * 100)}%
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    color: sectionScore > 0 ? '#0f172a' : '#cbd5e1'
                                  }}>
                                    {sectionScore}
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}> / {maxScore}</span>
                                  </div>
                                </button>

                                {/* Section Detail - Expandable */}
                                {isExpanded && (
                                  <div style={{ borderTop: '1px solid var(--border)' }}>
                                    {group.items.map((item, idx) => (
                                      <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 18px 12px 62px',
                                        borderBottom: idx < group.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                                        gap: '12px'
                                      }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                                              {item.category?.kode}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>
                                              {item.category?.sub_kategori || '-'}
                                            </span>
                                          </div>
                                          {item.keterangan && (
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', fontStyle: 'italic' }}>
                                              {item.keterangan}
                                            </div>
                                          )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                          {item.category?.tipe === 'check' ? (
                                            <span style={{
                                              padding: '4px 10px',
                                              borderRadius: '6px',
                                              fontSize: '0.75rem',
                                              fontWeight: 600,
                                              background: item.check_ada ? '#d1fae5' : '#fee2e2',
                                              color: item.check_ada ? '#059669' : '#dc2626'
                                            }}>
                                              {item.check_ada ? '✓ Ada' : '✗ Tidak'}
                                            </span>
                                          ) : (
                                            <span style={{
                                              padding: '4px 10px',
                                              borderRadius: '6px',
                                              fontSize: '0.75rem',
                                              fontWeight: 600,
                                              background: RATING_COLORS[item.nilai] ? `${RATING_COLORS[item.nilai]}15` : '#f1f5f9',
                                              color: RATING_COLORS[item.nilai] || '#94a3b8'
                                            }}>
                                              {RATING_LABELS[item.nilai] || '-'} ({item.nilai || 0})
                                            </span>
                                          )}
                                          <span style={{
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            color: item.score > 0 ? '#0f172a' : '#cbd5e1',
                                            minWidth: '40px',
                                            textAlign: 'right'
                                          }}>
                                            {Math.round(item.score * 100) / 100}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* Mulai Assessment Button */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartAssessment}
                    style={{
                      padding: '10px 24px',
                      background: 'var(--primary-500)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    <ClipboardList size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Tambah / Edit Assessment
                  </motion.button>
                </div>
              </>
            ) : (
              <BentoCard title="Riwayat Assessment" size="lg">
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                  <ClipboardList size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
                  <p>Belum ada assessment</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartAssessment}
                    style={{
                      marginTop: 'var(--space-4)',
                      padding: 'var(--space-2) var(--space-4)',
                      background: 'var(--primary-500)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    Mulai Assessment
                  </motion.button>
                </div>
              </BentoCard>
            )}
          </>
        )}

        {activeTab === 'documents' && (
          <BentoCard title="Dokumen" size="lg">
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
              <p>Belum ada dokumen</p>
            </div>
          </BentoCard>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Hapus Kandidat"
        message={`Apakah Anda yakin ingin menghapus kandidat "${candidate?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        loading={deleting}
      />
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyAssessments, getAllCandidatesWithScores } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { SkeletonList } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import MobileMyAssessments from '../components/mobile/MobileMyAssessments';

const staggerContainer = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }
  }
};

export default function MyAssessments() {
  const { user } = useAuth();
  const [assessed, setAssessed] = useState([]);
  const [notAssessed, setNotAssessed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('assessed');
  const isMobile = useIsMobile();

  useEffect(() => {
    const load = async () => {
      try {
        const [my, all] = await Promise.all([
          getMyAssessments(user.id),
          getAllCandidatesWithScores(),
        ]);
        const myIds = new Set(my.map(c => c.id));
        // Kandidat yang sudah dinilai oleh saya ATAU sudah punya status final
        const done = [];
        const notDone = [];
        for (const c of all) {
          const myEntry = my.find(m => m.id === c.id);
          if (myIds.has(c.id)) {
            done.push({ ...c, my_score: myEntry?.my_score || 0 });
          } else if (c.status === 'Lulus' || c.status === 'Tidak Lulus' || c.status === 'Lulus dengan Catatan') {
            done.push({ ...c, my_score: c.avg_score || 0 });
          } else {
            notDone.push(c);
          }
        }
        setAssessed(done);
        setNotAssessed(notDone);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [user.id]);

  // ≥70 Lulus (hijau), 60-69 Lulus dengan Catatan (kuning), <60 Tidak Lulus (merah)
  const scoreClass = (s) => s >= 70 ? 's-hi' : s >= 60 ? 's-md' : 's-lo';
  const statusBadge = (s) => {
    if (s === 'Lulus') return 'badge b-ok';
    if (s === 'Lulus dengan Catatan') return 'badge b-note';
    if (s === 'Tidak Lulus') return 'badge b-no';
    return 'badge b-wait';
  };

  if (loading) return <SkeletonList />;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      style={{ padding: 0 }}
    >
      {/* Premium Header */}
      <motion.div 
        variants={staggerItem}
        style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
          borderRadius: isMobile ? '16px' : '24px',
          padding: isMobile ? '20px' : '40px 48px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px -20px rgba(15, 23, 42, 0.3)'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: isMobile ? '1.25rem' : '1.75rem', 
            fontWeight: 800, 
            margin: '0 0 8px 0',
            color: '#fff',
            letterSpacing: '-0.02em'
          }}>
            Penilaian Saya
          </h1>
          <p style={{ 
            margin: 0, 
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.95rem'
          }}>
            Kelola dan tinjau penilaian kandidat yang telah Anda lakukan
          </p>
        </div>
      </motion.div>

      {/* Premium Tabs */}
      <motion.div 
        variants={staggerItem}
        style={{ 
          display: 'flex',
          gap: '12px',
          marginBottom: '28px',
          background: '#ffffff',
          padding: '8px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.06)',
          border: '1px solid #e2e8f0',
          width: 'fit-content'
        }}
      >
        <button 
          onClick={() => setTab('assessed')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            background: tab === 'assessed' ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'transparent',
            color: tab === 'assessed' ? '#fff' : '#64748b',
            boxShadow: tab === 'assessed' ? '0 4px 14px -2px rgba(79, 70, 229, 0.4)' : 'none'
          }}
        >
          <CheckCircle size={18} />
          Sudah Dinilai
          <span style={{
            background: tab === 'assessed' ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
            color: tab === 'assessed' ? '#fff' : '#64748b',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {assessed.length}
          </span>
        </button>
        <button 
          onClick={() => setTab('not-assessed')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            background: tab === 'not-assessed' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
            color: tab === 'not-assessed' ? '#fff' : '#64748b',
            boxShadow: tab === 'not-assessed' ? '0 4px 14px -2px rgba(245, 158, 11, 0.4)' : 'none'
          }}
        >
          <AlertCircle size={18} />
          Belum Dinilai
          <span style={{
            background: tab === 'not-assessed' ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
            color: tab === 'not-assessed' ? '#fff' : '#64748b',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {notAssessed.length}
          </span>
        </button>
      </motion.div>

      {/* Mobile View */}
      {isMobile ? (
        <MobileMyAssessments
          assessed={assessed}
          notAssessed={notAssessed}
          tab={tab}
          onTabChange={setTab}
          loading={loading}
        />
      ) : (
      <>
      {tab === 'assessed' && (
        <motion.div variants={staggerItem}>
          <div style={{
            background: '#ffffff',
            borderRadius: isMobile ? '16px' : '24px',
            padding: '28px',
            boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)',
            border: '1px solid rgba(226, 232, 240, 0.6)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <ClipboardList size={20} color="#4f46e5" />
                  Kandidat yang Sudah Anda Nilai
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0
                }}>{assessed.length} kandidat telah dinilai</p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'separate',
                borderSpacing: '0',
                fontSize: '0.875rem'
              }}>
                <thead>
                  <tr>
                    <th style={{ 
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #f1f5f9'
                    }}>#</th>
                    <th style={{ 
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #f1f5f9'
                    }}>Nama</th>
                    <th style={{ 
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #f1f5f9'
                    }}>Posisi</th>
                    <th style={{ 
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #f1f5f9'
                    }}>Penempatan</th>
                    <th style={{ 
                      padding: '14px 16px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #f1f5f9'
                    }}>Skor Saya</th>
                    <th style={{ 
                      padding: '14px 16px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #f1f5f9'
                    }}>Status</th>
                    <th style={{ 
                      padding: '14px 16px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #f1f5f9'
                    }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {assessed.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 0, border: 'none' }}>
                        <EmptyState
                          icon={ClipboardList}
                          title="Belum ada penilaian"
                          description="Anda belum menilai kandidat manapun. Mulai menilai kandidat untuk melihat hasilnya di sini."
                        />
                      </td>
                    </tr>
                  ) : assessed.map((c, i) => (
                    <motion.tr 
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ 
                        padding: '16px', 
                        borderBottom: '1px solid #f1f5f9',
                        color: '#64748b',
                        fontWeight: 600
                      }}>{i + 1}</td>
                      <td style={{ 
                        padding: '16px', 
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '0.875rem',
                            fontWeight: 700
                          }}>{c.nama?.charAt(0)}</div>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.nama}</span>
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        color: '#334155',
                        borderBottom: '1px solid #f1f5f9'
                      }}>{c.posisi}</td>
                      <td style={{ 
                        padding: '16px', 
                        color: '#334155',
                        borderBottom: '1px solid #f1f5f9'
                      }}>{c.penempatan}</td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center',
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px 14px',
                          borderRadius: '999px',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          background: c.my_score >= 70 ? '#d1fae5' : c.my_score >= 60 ? '#fef3c7' : '#fee2e2',
                          color: c.my_score >= 70 ? '#059669' : c.my_score >= 60 ? '#d97706' : '#dc2626'
                        }}>
                          {c.my_score.toFixed(1)}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center',
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '999px',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          background: c.status === 'Lulus' ? '#d1fae5' : c.status === 'Tidak Lulus' ? '#fee2e2' : '#fef3c7',
                          color: c.status === 'Lulus' ? '#059669' : c.status === 'Tidak Lulus' ? '#dc2626' : '#d97706'
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'currentColor'
                          }} />
                          {c.status}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center',
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <Link 
                            to={`/candidates/${c.id}`} 
                            style={{
                              padding: '8px',
                              background: '#f1f5f9',
                              borderRadius: '8px',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#e2e8f0';
                              e.currentTarget.style.color = '#334155';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f1f5f9';
                              e.currentTarget.style.color = '#64748b';
                            }}
                          >
                            <Eye size={16} />
                          </Link>
                          <Link 
                            to={`/assessment/${c.id}`}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                              borderRadius: '8px',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 8px -2px rgba(79, 70, 229, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(79, 70, 229, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px -2px rgba(79, 70, 229, 0.3)';
                            }}
                          >
                            <ClipboardList size={14} />
                            Edit
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'not-assessed' && (
        <motion.div variants={staggerItem}>
          <div style={{
            background: '#ffffff',
            borderRadius: isMobile ? '16px' : '24px',
            padding: '28px',
            boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)',
            border: '1px solid rgba(226, 232, 240, 0.6)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <AlertCircle size={20} color="#f59e0b" />
                  Kandidat yang Belum Anda Nilai
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: 0
                }}>{notAssessed.length} kandidat menunggu penilaian</p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'separate',
                borderSpacing: '0',
                fontSize: '0.875rem'
              }}>
                <thead>
                  <tr>
                    <th style={{ 
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #f1f5f9'
                    }}>#</th>
                    <th style={{ 
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #f1f5f9'
                    }}>Nama</th>
                    <th style={{ 
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #f1f5f9'
                    }}>Posisi</th>
                    <th style={{ 
                      padding: '14px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #f1f5f9'
                    }}>Penempatan</th>
                    <th style={{ 
                      padding: '14px 16px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #f1f5f9'
                    }}>Status</th>
                    <th style={{ 
                      padding: '14px 16px',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#64748b',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: '2px solid #f1f5f9'
                    }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {notAssessed.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 0, border: 'none' }}>
                        <EmptyState
                          icon={CheckCircle}
                          title="Semua kandidat sudah dinilai!"
                          description="🎉 Hebat! Anda telah menyelesaikan penilaian untuk semua kandidat yang tersedia."
                        />
                      </td>
                    </tr>
                  ) : notAssessed.map((c, i) => (
                    <motion.tr 
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ 
                        padding: '16px', 
                        borderBottom: '1px solid #f1f5f9',
                        color: '#64748b',
                        fontWeight: 600
                      }}>{i + 1}</td>
                      <td style={{ 
                        padding: '16px', 
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '0.875rem',
                            fontWeight: 700
                          }}>{c.nama?.charAt(0)}</div>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.nama}</span>
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        color: '#334155',
                        borderBottom: '1px solid #f1f5f9'
                      }}>{c.posisi}</td>
                      <td style={{ 
                        padding: '16px', 
                        color: '#334155',
                        borderBottom: '1px solid #f1f5f9'
                      }}>{c.penempatan}</td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center',
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '999px',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          background: c.status === 'Lulus' ? '#d1fae5' : c.status === 'Tidak Lulus' ? '#fee2e2' : '#fef3c7',
                          color: c.status === 'Lulus' ? '#059669' : c.status === 'Tidak Lulus' ? '#dc2626' : '#d97706'
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'currentColor'
                          }} />
                          {c.status}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center',
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <Link 
                          to={`/assessment/${c.id}`}
                          style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            borderRadius: '10px',
                            color: '#fff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px -2px rgba(245, 158, 11, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(245, 158, 11, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px -2px rgba(245, 158, 11, 0.3)';
                          }}
                        >
                          <ClipboardList size={16} />
                          Mulai Interview
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
      </>
      )}
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Briefcase, Calendar, MapPin, 
  Edit2, Trash2, FileText, ClipboardList, ArrowLeft,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { getCandidate, deleteCandidate } from '../services/db';
import { useToast } from '../context/ToastContext';
import BentoCard from '../components/ui/BentoCard';
import { staggerContainer, staggerItem } from '../utils/animations';

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

  useEffect(() => {
    loadCandidate();
  }, [id]);

  const loadCandidate = async () => {
    try {
      const data = await getCandidate(id);
      setCandidate(data);
    } catch (err) {
      error('Gagal memuat data kandidat');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus kandidat ini?')) return;
    
    try {
      await deleteCandidate(id);
      success('Kandidat berhasil dihapus');
      navigate('/candidates');
    } catch (err) {
      error('Gagal menghapus kandidat');
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
                onClick={handleDelete}
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

        {activeTab === 'documents' && (
          <BentoCard title="Dokumen" size="lg">
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
              <p>Belum ada dokumen</p>
            </div>
          </BentoCard>
        )}
      </motion.div>
    </motion.div>
  );
}

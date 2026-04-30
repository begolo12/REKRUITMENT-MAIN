import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, Eye, CheckCircle, AlertCircle, 
  User 
} from 'lucide-react';
import './MobileMyAssessments.css';

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.175, 0.885, 0.32, 1.275]
    }
  }
};

export default function MobileMyAssessments({ 
  assessed, 
  notAssessed, 
  tab, 
  onTabChange,
  loading 
}) {
  // Card component untuk assessed candidate
  const AssessedCard = ({ candidate, index }) => (
    <motion.div
      variants={cardVariants}
      className="mobile-assessment-card"
      role="article"
      aria-label={`Kandidat ${candidate.nama}`}
    >
      <div className="card-header">
        <div className="candidate-avatar" aria-hidden="true">
          {candidate.nama?.charAt(0).toUpperCase()}
        </div>
        <div className="candidate-info">
          <h4 className="candidate-name">{candidate.nama}</h4>
          <p className="candidate-position">{candidate.posisi}</p>
        </div>
        <div 
          className={`score-badge ${candidate.my_score >= 70 ? 'high' : candidate.my_score >= 60 ? 'medium' : 'low'}`}
          aria-label={`Skor ${candidate.my_score.toFixed(1)}`}
        >
          {candidate.my_score.toFixed(1)}
        </div>
      </div>
      
      <div className="card-details">
        <div className="detail-row">
          <span className="detail-label">Penempatan</span>
          <span className="detail-value">{candidate.penempatan || '-'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status</span>
          <span className={`status-badge ${candidate.status?.toLowerCase().replace(/\s+/g, '-')}`}>
            {candidate.status}
          </span>
        </div>
      </div>
      
      <div className="card-actions">
        <Link 
          to={`/candidates/${candidate.id}`} 
          className="action-btn view"
          aria-label={`Lihat detail ${candidate.nama}`}
        >
          <Eye size={18} />
          <span>Detail</span>
        </Link>
        <Link 
          to={`/assessment/${candidate.id}`} 
          className="action-btn edit"
          aria-label={`Edit penilaian ${candidate.nama}`}
        >
          <ClipboardList size={18} />
          <span>Edit</span>
        </Link>
      </div>
    </motion.div>
  );

  // Card component untuk not assessed candidate
  const NotAssessedCard = ({ candidate, index }) => (
    <motion.div
      variants={cardVariants}
      className="mobile-assessment-card not-assessed"
      role="article"
      aria-label={`Kandidat ${candidate.nama} - Belum dinilai`}
    >
      <div className="card-header">
        <div className="candidate-avatar pending" aria-hidden="true">
          {candidate.nama?.charAt(0).toUpperCase()}
        </div>
        <div className="candidate-info">
          <h4 className="candidate-name">{candidate.nama}</h4>
          <p className="candidate-position">{candidate.posisi}</p>
        </div>
      </div>
      
      <div className="card-details">
        <div className="detail-row">
          <span className="detail-label">Penempatan</span>
          <span className="detail-value">{candidate.penempatan || '-'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status</span>
          <span className={`status-badge ${(candidate.status || 'dalam-proses').toLowerCase().replace(/\s+/g, '-')}`}>
            {candidate.status || 'Dalam Proses'}
          </span>
        </div>
      </div>
      
      <div className="card-actions">
        <Link 
          to={`/assessment/${candidate.id}`} 
          className="action-btn primary"
          aria-label={`Mulai interview ${candidate.nama}`}
        >
          <ClipboardList size={18} />
          <span>Mulai Interview</span>
        </Link>
      </div>
    </motion.div>
  );

  return (
    <div className="mobile-my-assessments">
      {/* Tab Navigation */}
      <div className="tab-navigation" role="tablist" aria-label="Filter penilaian">
        <button 
          className={`tab-btn ${tab === 'assessed' ? 'active' : ''}`}
          onClick={() => onTabChange('assessed')}
          role="tab"
          aria-selected={tab === 'assessed'}
          aria-controls="assessed-panel"
          id="assessed-tab"
        >
          <CheckCircle size={18} aria-hidden="true" />
          <span>Sudah Dinilai</span>
          <span className="tab-count" aria-label={`${assessed.length} kandidat`}>
            {assessed.length}
          </span>
        </button>
        <button 
          className={`tab-btn ${tab === 'not-assessed' ? 'active' : ''}`}
          onClick={() => onTabChange('not-assessed')}
          role="tab"
          aria-selected={tab === 'not-assessed'}
          aria-controls="not-assessed-panel"
          id="not-assessed-tab"
        >
          <AlertCircle size={18} aria-hidden="true" />
          <span>Belum Dinilai</span>
          <span className="tab-count" aria-label={`${notAssessed.length} kandidat`}>
            {notAssessed.length}
          </span>
        </button>
      </div>

      {/* Content */}
      <motion.div 
        className="cards-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        role="tabpanel"
        id={tab === 'assessed' ? 'assessed-panel' : 'not-assessed-panel'}
        aria-labelledby={tab === 'assessed' ? 'assessed-tab' : 'not-assessed-tab'}
      >
        {tab === 'assessed' ? (
          assessed.length === 0 ? (
            <div className="empty-state" role="status">
              <ClipboardList size={48} aria-hidden="true" />
              <p>Belum ada penilaian</p>
              <span className="empty-hint">
                Anda belum menilai kandidat manapun
              </span>
            </div>
          ) : (
            assessed.map((candidate, index) => (
              <AssessedCard 
                key={candidate.id} 
                candidate={candidate} 
                index={index} 
              />
            ))
          )
        ) : (
          notAssessed.length === 0 ? (
            <div className="empty-state success" role="status">
              <CheckCircle size={48} aria-hidden="true" />
              <p>Semua kandidat sudah dinilai!</p>
              <span className="empty-hint">
                Hebat! Anda telah menyelesaikan semua penilaian
              </span>
            </div>
          ) : (
            notAssessed.map((candidate, index) => (
              <NotAssessedCard 
                key={candidate.id} 
                candidate={candidate} 
                index={index} 
              />
            ))
          )
        )}
      </motion.div>
    </div>
  );
}

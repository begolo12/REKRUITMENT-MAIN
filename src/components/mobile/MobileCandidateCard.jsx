import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import './MobileCandidateCard.css';

export default function MobileCandidateCard({ 
  candidate, 
  onClick, 
  onEdit, 
  onDelete,
  expandable = false 
}) {
  const [expanded, setExpanded] = useState(false);

  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Lulus':
        return 'badge-success';
      case 'Tidak Lulus':
        return 'badge-danger';
      case 'Lulus dengan Catatan':
        return 'badge-warning';
      case 'Dalam Proses':
      default:
        return 'badge-warning';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(candidate);
    }
  };

  const handleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <article 
      className="mobile-candidate-card"
      onClick={handleClick}
      role="article"
      aria-label={`Kandidat ${candidate.nama}`}
    >
      <div className="card-header">
        <div className="candidate-avatar">
          {candidate.nama.charAt(0).toUpperCase()}
        </div>
        
        <div className="candidate-info">
          <h3 className="candidate-name">{candidate.nama}</h3>
          <p className="candidate-meta">
            {candidate.divisi} · {candidate.posisi}
          </p>
        </div>
        
        <div className="card-actions">
          {expandable && (
            <button 
              className="expand-btn"
              onClick={handleExpand}
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
              aria-expanded={expanded}
            >
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
        </div>
      </div>
      
      <div className="card-stats">
        <div className="stat-item">
          <span className="stat-label">Skor</span>
          <span className={`stat-value ${getScoreClass(candidate.avg_score)}`}>
            {candidate.avg_score?.toFixed(1) || '-'}
          </span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Status</span>
          <span className={`status-badge ${getStatusBadgeClass(candidate.status)}`}>
            {candidate.status || 'Dalam Proses'}
          </span>
        </div>
      </div>
      
      {expanded && (
        <div className="card-detail">
          {candidate.penempatan && (
            <div className="detail-item">
              <span className="detail-label">Penempatan</span>
              <span className="detail-value">{candidate.penempatan}</span>
            </div>
          )}
          
          {candidate.budget_salary && (
            <div className="detail-item">
              <span className="detail-label">Budget Salary</span>
              <span className="detail-value">{candidate.budget_salary}</span>
            </div>
          )}
        </div>
      )}
      
      {(onEdit || onDelete) && (
        <div className="card-footer">
          {onEdit && (
            <button 
              className="action-btn edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(candidate);
              }}
              aria-label="Edit kandidat"
            >
              <Edit2 size={16} />
              <span>Edit</span>
            </button>
          )}
          
          {onDelete && (
            <button 
              className="action-btn delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(candidate);
              }}
              aria-label="Hapus kandidat"
            >
              <Trash2 size={16} />
              <span>Hapus</span>
            </button>
          )}
        </div>
      )}
    </article>
  );
}

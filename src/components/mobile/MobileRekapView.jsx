import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, 
  Filter, 
  FileText, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Users,
  CheckCircle
} from 'lucide-react';
import MobileDataList from './MobileDataList';
import './MobileRekapView.css';

// Summary Card Component
function SummaryCard({ icon: Icon, label, value, subtitle, color }) {
  const colorClasses = {
    blue: { bg: '#eef2ff', icon: '#4f46e5' },
    emerald: { bg: '#ecfdf5', icon: '#059669' },
    amber: { bg: '#fffbeb', icon: '#d97706' },
    purple: { bg: '#f5f3ff', icon: '#7c3aed' },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      className="mobile-rekap-summary-card"
      style={{ background: colors.bg }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="mobile-rekap-summary-icon" style={{ background: colors.icon }}>
        <Icon size={20} />
      </div>
      <div className="mobile-rekap-summary-content">
        <span className="mobile-rekap-summary-value">{value}</span>
        <span className="mobile-rekap-summary-label">{label}</span>
        {subtitle && <span className="mobile-rekap-summary-subtitle">{subtitle}</span>}
      </div>
    </motion.div>
  );
}

// Rekap Item Component
function RekapItem({ rekap, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Lulus': return { bg: '#dcfce7', color: '#166534' };
      case 'Lulus dengan Catatan': return { bg: '#fef3c7', color: '#92400e' };
      case 'Tidak Lulus': return { bg: '#fee2e2', color: '#991b1b' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const statusStyle = getStatusColor(rekap.status);

  return (
    <motion.div
      className="mobile-rekap-item"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <div className="mobile-rekap-item-header">
        <div className="mobile-rekap-item-avatar">
          {rekap.nama?.charAt(0)}
        </div>
        <div className="mobile-rekap-item-info">
          <h4 className="mobile-rekap-item-name">{rekap.nama}</h4>
          <p className="mobile-rekap-item-position">{rekap.posisi}</p>
        </div>
        <ChevronRight size={18} className="mobile-rekap-item-arrow" />
      </div>
      
      <div className="mobile-rekap-item-details">
        <div className="mobile-rekap-item-detail">
          <span className="mobile-rekap-item-detail-label">Divisi</span>
          <span className="mobile-rekap-item-detail-value">{rekap.divisi}</span>
        </div>
        <div className="mobile-rekap-item-detail">
          <span className="mobile-rekap-item-detail-label">Tanggal</span>
          <span className="mobile-rekap-item-detail-value">{rekap.tanggal}</span>
        </div>
        <div className="mobile-rekap-item-detail">
          <span className="mobile-rekap-item-detail-label">Skor</span>
          <span className={`mobile-rekap-item-score ${rekap.avg_score >= 70 ? 'high' : rekap.avg_score >= 60 ? 'medium' : 'low'}`}>
            {rekap.avg_score?.toFixed(1) || '-'}
          </span>
        </div>
      </div>

      <div className="mobile-rekap-item-footer">
        <span 
          className="mobile-rekap-item-status"
          style={{ 
            background: statusStyle.bg, 
            color: statusStyle.color 
          }}
        >
          {rekap.status || 'Dalam Proses'}
        </span>
        {rekap.hasReport && (
          <span className="mobile-rekap-item-report-badge">
            <FileText size={12} />
            Report
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Filter Chip Component
function FilterChip({ label, active, onClick }) {
  return (
    <button
      className={`mobile-rekap-filter-chip ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function MobileRekapView({ 
  rekapData, 
  summary,
  loading,
  onRefresh,
  onExport,
  filters,
  onFilterChange,
  availableFilters
}) {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const handleRekapClick = (rekap) => {
    navigate(`/candidates/${rekap.candidateId}`);
  };

  const renderRekapItem = (rekap) => (
    <RekapItem 
      rekap={rekap} 
      onClick={() => handleRekapClick(rekap)}
    />
  );

  return (
    <div className="mobile-rekap-view">
      {/* Header */}
      <motion.div 
        className="mobile-rekap-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mobile-rekap-title">Rekap Penilaian</h1>
        <p className="mobile-rekap-subtitle">
          Ringkasan hasil penilaian kandidat
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="mobile-rekap-summary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <SummaryCard
          icon={Users}
          label="Total Kandidat"
          value={summary?.totalCandidates || 0}
          color="blue"
        />
        <SummaryCard
          icon={CheckCircle}
          label="Lulus"
          value={summary?.passed || 0}
          subtitle={`${summary?.passRate || 0}%`}
          color="emerald"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Rata-rata Skor"
          value={summary?.avgScore?.toFixed(1) || '0.0'}
          color="amber"
        />
        <SummaryCard
          icon={Calendar}
          label="Periode"
          value={summary?.period || 'All'}
          color="purple"
        />
      </motion.div>

      {/* Actions Bar */}
      <motion.div 
        className="mobile-rekap-actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button 
          className="mobile-rekap-filter-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filter
          {Object.values(filters || {}).some(f => f) && (
            <span className="mobile-rekap-filter-badge">!</span>
          )}
        </button>
        <button 
          className="mobile-rekap-export-btn"
          onClick={onExport}
        >
          <Download size={18} />
          Export
        </button>
      </motion.div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div 
          className="mobile-rekap-filter-panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          {availableFilters?.map((filter) => (
            <div key={filter.key} className="mobile-rekap-filter-group">
              <label className="mobile-rekap-filter-label">{filter.label}</label>
              <div className="mobile-rekap-filter-options">
                <FilterChip
                  label="Semua"
                  active={!filters[filter.key]}
                  onClick={() => onFilterChange(filter.key, '')}
                />
                {filter.options.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    active={filters[filter.key] === option.value}
                    onClick={() => onFilterChange(filter.key, option.value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Active Filters */}
      {Object.entries(filters || {}).some(([_, value]) => value) && (
        <motion.div 
          className="mobile-rekap-active-filters"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Object.entries(filters).map(([key, value]) => (
            value && (
              <span key={key} className="mobile-rekap-active-filter">
                {availableFilters?.find(f => f.key === key)?.label}: {value}
                <button 
                  className="mobile-rekap-remove-filter"
                  onClick={() => onFilterChange(key, '')}
                >
                  ×
                </button>
              </span>
            )
          ))}
          <button 
            className="mobile-rekap-clear-all"
            onClick={() => Object.keys(filters).forEach(key => onFilterChange(key, ''))}
          >
            Hapus Semua
          </button>
        </motion.div>
      )}

      {/* Rekap List */}
      <motion.div 
        className="mobile-rekap-list-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mobile-rekap-list-header">
          <h2 className="mobile-rekap-list-title">Daftar Penilaian</h2>
          <span className="mobile-rekap-list-count">
            {rekapData?.length || 0} data
          </span>
        </div>

        <MobileDataList
          items={rekapData || []}
          renderItem={renderRekapItem}
          keyExtractor={(item) => item.id}
          loading={loading}
          onRefresh={onRefresh}
          emptyMessage="Belum ada data penilaian"
          emptyAction={{
            label: "Lihat Kandidat",
            onClick: () => navigate('/candidates')
          }}
        />
      </motion.div>
    </div>
  );
}

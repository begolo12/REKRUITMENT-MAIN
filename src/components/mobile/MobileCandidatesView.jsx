import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileCandidateCard from './MobileCandidateCard';
import MobileDataList from './MobileDataList';
import './MobileCandidatesView.css';

export default function MobileCandidatesView({ 
  candidates, 
  loading, 
  onRefresh,
  onDelete,
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onAddCandidate
}) {
  const navigate = useNavigate();
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handleCandidateClick = (candidate) => {
    navigate(`/candidates/${candidate.id}`);
  };

  const handleEditCandidate = (candidate) => {
    navigate(`/candidates/${candidate.id}?edit=true`);
  };

  const renderCandidateCard = (candidate) => (
    <MobileCandidateCard
      candidate={candidate}
      onClick={handleCandidateClick}
      onEdit={handleEditCandidate}
      onDelete={onDelete}
      expandable={true}
    />
  );

  return (
    <div className="mobile-candidates-view">
      {/* Search & Filter Bar */}
      <motion.div 
        className="mobile-search-bar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Cari kandidat..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mobile-search-input"
          />
        </div>
        <button 
          className={`filter-btn ${Object.keys(filters).length > 0 ? 'active' : ''}`}
          onClick={() => setShowFilterModal(true)}
          aria-label="Filter"
        >
          <Filter size={20} />
          {Object.keys(filters).length > 0 && (
            <span className="filter-badge">{Object.keys(filters).length}</span>
          )}
        </button>
      </motion.div>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <motion.div 
          className="active-filters"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Object.entries(filters).map(([key, value]) => (
            value && (
              <span key={key} className="filter-chip">
                {key}: {value}
                <button 
                  className="remove-filter"
                  onClick={() => onFilterChange(key, '')}
                  aria-label={`Hapus filter ${key}`}
                >
                  ×
                </button>
              </span>
            )
          ))}
          <button 
            className="clear-all-filters"
            onClick={() => Object.keys(filters).forEach(key => onFilterChange(key, ''))}
          >
            Hapus semua
          </button>
        </motion.div>
      )}

      {/* Candidates List */}
      <MobileDataList
        items={candidates}
        renderItem={renderCandidateCard}
        keyExtractor={(item) => item.id}
        loading={loading}
        onRefresh={onRefresh}
        emptyMessage="Belum ada kandidat"
        emptyAction={{
          label: "Tambah Kandidat",
          onClick: onAddCandidate
        }}
      />

      {/* Floating Action Button */}
      <motion.button
        className="mobile-fab"
        onClick={onAddCandidate}
        whileTap={{ scale: 0.95 }}
        aria-label="Tambah kandidat"
      >
        <Plus size={24} />
      </motion.button>
    </div>
  );
}

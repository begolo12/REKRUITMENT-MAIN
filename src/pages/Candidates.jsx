import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Trash2, FileDown, MoreHorizontal, Loader2, X } from 'lucide-react';
import { getCandidates, deleteCandidate, createCandidate } from '../services/db';
import { useToast } from '../context/ToastContext';
import DataTable from '../components/ui/DataTable';
import FilterPanel from '../components/ui/FilterPanel';
import BentoCard from '../components/ui/BentoCard';
import ModernModal from '../components/ModernModal';
import ConfirmModal from '../components/ConfirmModal';
import { staggerContainer, staggerItem } from '../utils/animations';
import { exportCandidatesToExcel } from '../utils/exportUtils';
import { formatSalary, parseSalary } from '../utils/helpers';

const columns = [
  { key: 'nama', title: 'Nama', render: (val, row) => (
    <Link to={`/candidates/${row.id}`} style={{ color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 600 }}>
      {val}
    </Link>
  )},
  { key: 'divisi', title: 'Divisi' },
  { key: 'posisi', title: 'Posisi' },
  { key: 'avg_score', title: 'Skor Rata-rata', align: 'center', render: (val) => (
    <span className={`score ${val >= 70 ? 's-hi' : val >= 60 ? 's-md' : 's-lo'}`}>
      {val?.toFixed(1) || '-'}
    </span>
  )},
  { key: 'status', title: 'Status', align: 'center', render: (val) => {
    const badges = {
      'Lulus': 'badge b-ok',
      'Lulus dengan Catatan': 'badge b-note',
      'Tidak Lulus': 'badge b-no'
    };
    return <span className={badges[val] || 'badge b-wait'}>{val || 'Dalam Proses'}</span>;
  }}
];

const filterDefinitions = [
  { key: 'search', type: 'text', label: 'Search', placeholder: 'Cari nama, divisi, posisi...' },
  { key: 'divisi', type: 'select', label: 'Divisi', options: [
    { value: 'Busdev', label: 'Busdev' },
    { value: 'Keuangan', label: 'Keuangan' },
    { value: 'Operasi', label: 'Operasi' }
  ]},
  { key: 'status', type: 'select', label: 'Status', options: [
    { value: 'Lulus', label: 'Lulus' },
    { value: 'Lulus dengan Catatan', label: 'Lulus dengan Catatan' },
    { value: 'Tidak Lulus', label: 'Tidak Lulus' },
    { value: 'Dalam Proses', label: 'Dalam Proses' }
  ]}
];

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    posisi: '',
    penempatan: '',
    divisi: '',
    budget_salary: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Premium styling
  const headerStyle = {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
    borderRadius: '24px',
    padding: '40px 48px',
    marginBottom: '32px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 60px -20px rgba(15, 23, 42, 0.3)'
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const data = await getCandidates();
      setCandidates(data);
    } catch (err) {
      error('Gagal memuat data kandidat');
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = !searchQuery || 
        c.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.divisi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.posisi?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value || value === '') return true;
        if (key === 'search') return true;
        return c[key] === value;
      });
      
      return matchesSearch && matchesFilters;
    });
  }, [candidates, searchQuery, filters]);

  const handleDelete = async (candidate) => {
    setShowDeleteConfirm(candidate);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    setDeleting(true);
    try {
      await deleteCandidate(showDeleteConfirm.id);
      setCandidates(prev => prev.filter(c => c.id !== showDeleteConfirm.id));
      success('Kandidat berhasil dihapus');
    } catch (err) {
      error('Gagal menghapus kandidat');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleBulkDelete = async () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    setDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => deleteCandidate(id)));
      setCandidates(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      success(`${selectedIds.length} kandidat berhasil dihapus`);
    } catch (err) {
      error('Gagal menghapus kandidat');
    } finally {
      setDeleting(false);
      setShowBulkDeleteConfirm(false);
    }
  };

  const handleExport = () => {
    const dataToExport = selectedIds.length > 0 
      ? candidates.filter(c => selectedIds.includes(c.id))
      : filteredCandidates;
    
    exportCandidatesToExcel(dataToExport);
    success(`Export ${dataToExport.length} kandidat berhasil`);
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    
    if (!formData.nama || !formData.posisi) {
      error('Nama dan Posisi wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const newCandidate = await createCandidate(formData);
      setCandidates(prev => [newCandidate, ...prev]);
      success('Kandidat berhasil ditambahkan');
      setShowAddModal(false);
      setFormData({
        nama: '',
        posisi: '',
        penempatan: '',
        divisi: '',
        budget_salary: ''
      });
    } catch (err) {
      error('Gagal menambahkan kandidat');
    } finally {
      setSubmitting(false);
    }
  };

  const rowActions = [
    { label: 'View', onClick: (row) => navigate(`/candidates/${row.id}`) },
    { label: 'Edit', onClick: (row) => navigate(`/candidates/${row.id}?edit=true`) },
    { label: 'Delete', onClick: handleDelete, danger: true }
  ];

  return (
    <motion.div 
      className="page"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      style={{ padding: '0' }}
    >
      {/* Premium Header */}
      <motion.div 
        variants={staggerItem}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
          padding: '32px 40px',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px -20px rgba(15, 23, 42, 0.3)'
        }}
      >
        {/* Decorative elements */}
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
            fontSize: '1.75rem', 
            fontWeight: 800, 
            margin: '0 0 8px 0',
            color: '#fff',
            letterSpacing: '-0.02em'
          }}>
            Daftar Kandidat
          </h1>
          <p style={{ 
            margin: 0, 
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.95rem'
          }}>
            Kelola dan pantau semua kandidat rekrutmen
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            boxShadow: '0 8px 24px -6px rgba(245, 158, 11, 0.4)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Plus size={20} strokeWidth={2.5} />
          Tambah Kandidat
        </motion.button>
      </motion.div>

      {/* Premium Search & Filter Bar */}
      <motion.div 
        variants={staggerItem}
        style={{ 
          display: 'flex', 
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div style={{ 
          flex: 1,
          position: 'relative'
        }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '18px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }} 
          />
          <input
            type="text"
            placeholder="Cari kandidat berdasarkan nama, divisi, atau posisi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px 16px 52px',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              fontSize: '0.95rem',
              outline: 'none',
              background: '#ffffff',
              boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.06)',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4f46e5';
              e.target.style.boxShadow = '0 4px 20px -4px rgba(79, 70, 229, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = '0 4px 20px -4px rgba(15, 23, 42, 0.06)';
            }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setFilterPanelOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 24px',
            background: Object.keys(filters).length > 0 ? '#eef2ff' : '#ffffff',
            color: Object.keys(filters).length > 0 ? '#4f46e5' : '#334155',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.06)'
          }}
        >
          <Filter size={20} />
          Filter
          {Object.keys(filters).length > 0 && (
            <span style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff',
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '999px',
              fontWeight: 700
            }}>
              {Object.keys(filters).length}
            </span>
          )}
        </motion.button>
      </motion.div>

      {/* Premium Active Filters */}
      {Object.keys(filters).length > 0 && (
        <motion.div 
          variants={staggerItem}
          style={{ 
            display: 'flex', 
            gap: '10px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Filter aktif:</span>
          {Object.entries(filters).map(([key, value]) => (
            value && (
              <motion.span
                key={key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                  color: '#4f46e5',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  border: '1px solid rgba(79, 70, 229, 0.2)'
                }}
              >
                {key}: {value}
                <button
                  onClick={() => setFilters(prev => { const next = { ...prev }; delete next[key]; return next; })}
                  style={{
                    background: 'rgba(79, 70, 229, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(79, 70, 229, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)';
                  }}
                >
                  <X size={14} />
                </button>
              </motion.span>
            )
          ))}
          <button
            onClick={() => setFilters({})}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#dc2626',
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: '999px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Hapus semua
          </button>
        </motion.div>
      )}

      {/* Premium Bulk Actions */}
      {selectedIds.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
            borderRadius: '16px',
            marginBottom: '24px',
            border: '1px solid rgba(79, 70, 229, 0.15)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 18px',
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <span style={{ 
              fontWeight: 700, 
              color: '#4f46e5',
              fontSize: '1rem'
            }}>{selectedIds.length}</span>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>kandidat terpilih</span>
          </div>
          <div style={{ flex: 1 }} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#334155',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <FileDown size={18} />
            Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBulkDelete}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px -2px rgba(220, 38, 38, 0.3)'
            }}
          >
            <Trash2 size={18} />
            Hapus
          </motion.button>
        </motion.div>
      )}

      {/* Premium Data Table */}
      <motion.div variants={staggerItem}>
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)',
          border: '1px solid rgba(226, 232, 240, 0.6)',
          overflow: 'hidden'
        }}>
          <DataTable
            columns={columns}
            data={filteredCandidates}
            keyExtractor={(row) => row.id}
            selectable={true}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            loading={loading}
            emptyMessage="Tidak ada kandidat ditemukan"
            rowActions={rowActions}
          />
        </div>
      </motion.div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        filters={filters}
        onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
        onClearFilters={() => setFilters({})}
        filterDefinitions={filterDefinitions}
      />

      {/* Add Candidate Modal */}
      <ModernModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({
            nama: '',
            posisi: '',
            penempatan: '',
            divisi: '',
            budget_salary: ''
          });
        }}
        title="Tambah Kandidat Baru"
        size="md"
      >
        <form onSubmit={handleAddCandidate} className="modal-section">
          <div className="modal-section-header">
            <h4 className="modal-section-title">Informasi Kandidat</h4>
            <p className="modal-section-hint">Pastikan data utama sudah lengkap sebelum menyimpan.</p>
          </div>
          <div className="modal-field-grid">
            <div className="modal-field">
              <label>Nama Lengkap <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                className="modal-input"
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="Masukkan nama kandidat"
                required
              />
              <span className="modal-helper">Gunakan nama sesuai KTP / identitas resmi.</span>
            </div>
            <div className="modal-field">
              <label>Posisi <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select
                className="modal-select"
                value={formData.posisi}
                onChange={(e) => setFormData(prev => ({ ...prev, posisi: e.target.value }))}
                required
              >
                <option value="">Pilih Posisi</option>
                <option value="Staff Operasi">Staff Operasi</option>
                <option value="Staff Keuangan">Staff Keuangan</option>
                <option value="General Affair">General Affair</option>
                <option value="Dapur">Dapur</option>
              </select>
            </div>
            <div className="modal-field">
              <label>Penempatan</label>
              <select
                className="modal-select"
                value={formData.penempatan}
                onChange={(e) => setFormData(prev => ({ ...prev, penempatan: e.target.value }))}
              >
                <option value="">Pilih Penempatan</option>
                <option value="Jabodetabek">Jabodetabek</option>
                <option value="IKN">IKN</option>
              </select>
            </div>
            <div className="modal-field">
              <label>Divisi</label>
              <select
                className="modal-select"
                value={formData.divisi}
                onChange={(e) => setFormData(prev => ({ ...prev, divisi: e.target.value }))}
              >
                <option value="">Pilih Divisi</option>
                <option value="Busdev">Busdev</option>
                <option value="Keuangan">Keuangan</option>
                <option value="Operasi">Operasi</option>
              </select>
            </div>
          </div>

          <div className="modal-divider" />

          <div className="modal-field-grid">
            <div className="modal-field" style={{ gridColumn: '1 / -1' }}>
              <label>Budget Salary</label>
              <input
                className="modal-input"
                type="text"
                value={formData.budget_salary}
                onChange={(e) => setFormData(prev => ({ ...prev, budget_salary: formatSalary(e.target.value) }))}
                placeholder="Contoh: 5.000.000 - 7.000.000"
              />
              <span className="modal-helper">Rentang gaji yang disepakati dengan hiring manager. Format: 5.000.000 - 7.000.000</span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              disabled={submitting}
              className="btn btn-o"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-p"
              style={{ minWidth: 140, justifyContent: 'center' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Menyimpan...
                </>
              ) : (
                'Simpan Kandidat'
              )}
            </button>
          </div>
        </form>
      </ModernModal>

      {/* Delete Single Confirmation Modal */}
      <ConfirmModal
        isOpen={!!showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(null)}
        title="Hapus Kandidat"
        message={`Apakah Anda yakin ingin menghapus kandidat "${showDeleteConfirm?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        loading={deleting}
      />

      {/* Delete Bulk Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        onConfirm={confirmBulkDelete}
        onCancel={() => setShowBulkDeleteConfirm(false)}
        title="Hapus Kandidat Terpilih"
        message={`Apakah Anda yakin ingin menghapus ${selectedIds.length} kandidat terpilih? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Semua"
        cancelText="Batal"
        type="danger"
        loading={deleting}
      />
    </motion.div>
  );
}

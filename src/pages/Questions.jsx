import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { motion } from 'framer-motion';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/db';
import { HelpCircle, Plus, Edit3, Trash2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { SkeletonList } from '../components/Skeleton';

// Elegant muted color palette
const SECTION_COLORS = { 
  A: '#64748b', // Slate
  B: '#059669', // Emerald (muted)
  C: '#d97706', // Amber (muted)
  D: '#dc2626', // Red (muted)
  E: '#7c3aed', // Violet (muted)
  F: '#0891b2', // Cyan (muted)
  G: '#db2777'  // Pink (muted)
};

const SECTION_NAMES = { 
  A: 'Pengalaman',
  B: 'Administrasi', 
  C: 'Hard Skill',
  D: 'Soft Skill',
  E: 'Psikologi Interview',
  F: 'Salary & Prospektus Karir',
  G: 'Additional Questions'
};

export default function Questions() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    kode: '', kategori_utama: 'A', nama_kategori: 'PENGALAMAN',
    sub_kategori: '', pertanyaan: '', bobot: 0.05, tipe: 'rating',
  });
  const [showDelete, setShowDelete] = useState(null);
  const isMobile = useIsMobile();

  const load = async () => {
    try {
      const result = await getCategories();
      const data = result.success ? result.data : [];
      setCategories(data);
      // Auto-expand all sections
      const exp = {};
      Object.keys(SECTION_NAMES).forEach(k => { exp[k] = true; });
      setExpanded(exp);
    } catch (err) {
      toast.error('Gagal memuat data');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Group by kategori_utama
  const grouped = {};
  if (Array.isArray(categories)) {
    categories.forEach(c => {
      const key = c.kategori_utama;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(c);
    });
  }

  const toggleSection = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditForm({
      kode: cat.kode,
      sub_kategori: cat.sub_kategori,
      pertanyaan: cat.pertanyaan,
      bobot: cat.bobot,
      tipe: cat.tipe,
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateCategory(id, editForm);
      toast.success('Pertanyaan diperbarui');
      setEditingId(null);
      load();
    } catch (err) {
      toast.error('Gagal memperbarui: ' + err.message);
    }
  };

  const handleAdd = async () => {
    if (!addForm.kode.trim() || !addForm.sub_kategori.trim()) {
      toast.error('Kode dan Sub Kategori wajib diisi');
      return;
    }
    try {
      await createCategory({
        ...addForm,
        nama_kategori: SECTION_NAMES[addForm.kategori_utama] || addForm.kategori_utama,
      });
      toast.success('Pertanyaan berhasil ditambahkan');
      setShowAdd(false);
      setAddForm({ kode: '', kategori_utama: 'A', nama_kategori: 'PENGALAMAN', sub_kategori: '', pertanyaan: '', bobot: 0.05, tipe: 'rating' });
      load();
    } catch (err) {
      toast.error('Gagal menambahkan: ' + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(showDelete.id);
      toast.success('Pertanyaan dihapus');
      setShowDelete(null);
      load();
    } catch (err) {
      toast.error('Gagal menghapus: ' + err.message);
    }
  };

  const totalBobot = Array.isArray(categories) ? categories.reduce((s, c) => s + (c.bobot || 0), 0) : 0;

  if (loading) return <SkeletonList />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
      style={{ padding: 0 }}
    >
      {/* Elegant Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        borderRadius: isMobile ? '16px' : '24px',
        padding: isMobile ? '20px' : '40px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px -20px rgba(30, 41, 59, 0.3)'
      }}>
        {/* Subtle background decoration */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? '16px' : '0' }}>
          <div>
            <h1 style={{ 
              fontSize: isMobile ? '1.25rem' : '2rem', 
              fontWeight: 700, 
              margin: '0 0 8px 0',
              color: '#f8fafc',
              letterSpacing: '-0.01em'
            }}>
              Kelola Soal Assessment
            </h1>
            <p style={{ 
              margin: 0, 
              color: 'rgba(248, 250, 252, 0.65)',
              fontSize: '1rem'
            }}>
              {categories.length} pertanyaan · Total Bobot: {' '}
              <span style={{ 
                color: totalBobot > 1.01 ? '#fca5a5' : '#86efac',
                fontWeight: 600 
              }}>
                {totalBobot.toFixed(2)}
              </span>
              {' '}/ 1.00
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAdd(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: isMobile ? '12px 16px' : '14px 24px',
              width: isMobile ? '100%' : 'auto',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Plus size={20} strokeWidth={2} />
            Tambah Soal
          </motion.button>
        </div>
      </div>

      {Object.keys(SECTION_NAMES).map(key => {
        const items = grouped[key] || [];
        if (items.length === 0 && !showAdd) return null;
        const isOpen = expanded[key];
        const sectionBobot = items.reduce((s, c) => s + (c.bobot || 0), 0);

        return (
          <div className="a-section" key={key}>
            <div className="a-head" onClick={() => toggleSection(key)} style={{ cursor: 'pointer' }}>
              <div className="a-badge" style={{ background: SECTION_COLORS[key] }}>{key}</div>
              <div style={{ flex: 1 }}>
                <h4>{SECTION_NAMES[key]}</h4>
                <span>{items.length} pertanyaan · Bobot: {sectionBobot.toFixed(2)}</span>
              </div>
              {isOpen ? <ChevronDown size={18} color="#94a3b8" /> : <ChevronRight size={18} color="#94a3b8" />}
            </div>

            {isOpen && (
              <div className="a-body">
                {items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: '0.85rem' }}>
                    Belum ada pertanyaan di kategori ini
                  </div>
                ) : items.map((cat) => (
                  <div className="a-item" key={cat.id}>
                    {editingId === cat.id ? (
                      <div>
                        <div className="form-row" style={{ marginBottom: 10 }}>
                          <div className="fg">
                            <label>Kode</label>
                            <input className="fi" value={editForm.kode} onChange={e => setEditForm({ ...editForm, kode: e.target.value })} />
                          </div>
                          <div className="fg">
                            <label>Sub Kategori</label>
                            <input className="fi" value={editForm.sub_kategori} onChange={e => setEditForm({ ...editForm, sub_kategori: e.target.value })} />
                          </div>
                        </div>
                        <div className="fg">
                          <label>Pertanyaan</label>
                          <textarea className="fi" rows={2} value={editForm.pertanyaan} onChange={e => setEditForm({ ...editForm, pertanyaan: e.target.value })} style={{ resize: 'vertical' }} />
                        </div>
                        <div className="form-row" style={{ marginBottom: 10 }}>
                          <div className="fg">
                            <label>Bobot</label>
                            <input className="fi" type="number" step="0.005" min="0" max="1" value={editForm.bobot} onChange={e => setEditForm({ ...editForm, bobot: parseFloat(e.target.value) || 0 })} />
                          </div>
                          <div className="fg">
                            <label>Tipe</label>
                            <select className="fi fi-select" value={editForm.tipe} onChange={e => setEditForm({ ...editForm, tipe: e.target.value })}>
                              <option value="rating">Rating</option>
                              <option value="check">Check (Ada/Tidak)</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-s btn-sm" onClick={() => handleSaveEdit(cat.id)}><Save size={14} /> Simpan</button>
                          <button className="btn btn-o btn-sm" onClick={() => setEditingId(null)}><X size={14} /> Batal</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div className="a-label">
                            <span style={{ color: SECTION_COLORS[key], fontWeight: 700, marginRight: 8 }}>{cat.kode}</span>
                            {cat.sub_kategori}
                          </div>
                          <div className="a-q">{cat.pertanyaan}</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span className="badge b-info">Bobot: {cat.bobot}</span>
                            <span className={`badge ${cat.tipe === 'rating' ? 'b-wait' : 'b-ok'}`}>
                              {cat.tipe === 'rating' ? '⭐ Rating' : '✅ Check'}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <button className="btn btn-o btn-sm" onClick={() => startEdit(cat)} title="Edit">
                            <Edit3 size={14} />
                          </button>
                          <button className="btn btn-d btn-sm" onClick={() => setShowDelete(cat)} title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-bg" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 20, color: '#1e1b4b' }}>
              ➕ Tambah Pertanyaan Baru
            </h3>

            <div className="form-row">
              <div className="fg">
                <label>Kode *</label>
                <input className="fi" value={addForm.kode} onChange={e => setAddForm({ ...addForm, kode: e.target.value })} placeholder="Contoh: C150" />
              </div>
              <div className="fg">
                <label>Kategori Utama *</label>
                <select
                  className="fi fi-select"
                  value={addForm.kategori_utama}
                  onChange={e => setAddForm({ ...addForm, kategori_utama: e.target.value, nama_kategori: SECTION_NAMES[e.target.value] || '' })}
                >
                  {Object.keys(SECTION_NAMES).map(k => (
                    <option key={k} value={k}>{k} - {SECTION_NAMES[k]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="fg">
              <label>Sub Kategori *</label>
              <input className="fi" value={addForm.sub_kategori} onChange={e => setAddForm({ ...addForm, sub_kategori: e.target.value })} placeholder="Contoh: Skill Mengemudi" />
            </div>

            <div className="fg">
              <label>Pertanyaan</label>
              <textarea className="fi" rows={3} value={addForm.pertanyaan} onChange={e => setAddForm({ ...addForm, pertanyaan: e.target.value })} placeholder="Masukkan pertanyaan interview..." style={{ resize: 'vertical' }} />
            </div>

            <div className="form-row">
              <div className="fg">
                <label>Bobot</label>
                <input className="fi" type="number" step="0.005" min="0" max="1" value={addForm.bobot} onChange={e => setAddForm({ ...addForm, bobot: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="fg">
                <label>Tipe</label>
                <select className="fi fi-select" value={addForm.tipe} onChange={e => setAddForm({ ...addForm, tipe: e.target.value })}>
                  <option value="rating">Rating (SK/K/R/B/SB)</option>
                  <option value="check">Check (Ada/Tidak)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-p" onClick={handleAdd}>
                <Plus size={14} /> Tambah
              </button>
              <button className="btn btn-o" onClick={() => setShowAdd(false)}>
                <X size={14} /> Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div className="modal-bg" onClick={() => setShowDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-c">
              <h3>🗑️ Hapus Pertanyaan?</h3>
              <p>Apakah Anda yakin ingin menghapus <strong>{showDelete.kode} - {showDelete.sub_kategori}</strong>? Semua data penilaian terkait juga akan dihapus.</p>
              <div className="modal-acts">
                <button className="btn btn-o" onClick={() => setShowDelete(null)}>Batal</button>
                <button className="btn btn-d" onClick={handleDelete}><Trash2 size={14} /> Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

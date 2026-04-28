import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { motion } from 'framer-motion';
import { getUsers, createUser, updateUser, deleteUser } from '../services/db';
import { Users as UsersIcon, UserPlus, Edit3, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { SkeletonList } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'user' });
  const [saving, setSaving] = useState(false);
  const isMobile = useIsMobile();
  // Ref untuk melacak apakah komponen masih mounted
  const isMountedRef = useRef(true);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      // Cek apakah komponen masih mounted sebelum update state
      if (isMountedRef.current) {
        setUsers(data);
      }
    } catch (err) {
      // Cek apakah komponen masih mounted sebelum update state
      if (isMountedRef.current) {
        setError(err.message || 'Gagal memuat data pengguna');
        toast.error('Gagal memuat data user');
      }
    } finally {
      // Cek apakah komponen masih mounted sebelum update state
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Reset mounted flag saat komponen mount
    isMountedRef.current = true;
    load();

    // Cleanup function untuk mencegah memory leak
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const openAdd = () => {
    setEditingUser(null);
    setForm({ username: '', password: '', full_name: '', role: 'user' });
    setShowPw(false);
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ username: u.username, password: '', full_name: u.full_name, role: u.role });
    setShowPw(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.username.trim()) {
      toast.error('Nama dan username wajib diisi');
      return;
    }
    if (!editingUser && !form.password.trim()) {
      toast.error('Password wajib diisi untuk user baru');
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        const updateData = {
          full_name: form.full_name.trim(),
          role: form.role,
        };
        if (form.password.trim()) {
          updateData.password = form.password;
        }
        await updateUser(editingUser.id, updateData);
        toast.success('User berhasil diperbarui');
      } else {
        await createUser(form);
        toast.success('User berhasil ditambahkan');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error('Gagal menyimpan: ' + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await deleteUser(showDelete.id);
      toast.success('User berhasil dihapus');
      setShowDelete(null);
      load();
    } catch (err) {
      toast.error('Gagal menghapus: ' + err.message);
    }
  };

  const roleBadge = (r) => {
    const role = r?.toLowerCase();
    if (role === 'admin') return 'badge b-no';
    if (role === 'hr') return 'badge b-info';
    if (role === 'direktur') return 'badge b-wait';
    if (role === 'manager') return 'badge b-wait';
    return 'badge b-ok';
  };

  if (loading) return <SkeletonList />;

  if (error) return (
    <div style={{ padding: '20px' }}>
      <ErrorState 
        error={error}
        onRetry={load}
        title="Gagal Memuat Pengguna"
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
      style={{ padding: 0 }}
    >
      {/* Premium Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
        borderRadius: isMobile ? '16px' : '24px',
        padding: isMobile ? '20px' : '40px 48px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px -20px rgba(15, 23, 42, 0.3)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '16px' : '0'
      }}>
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
            Kelola User
          </h1>
          <p style={{ 
            margin: 0, 
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.95rem'
          }}>
            {users.length} user terdaftar dalam sistem
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: isMobile ? '12px 16px' : '14px 28px',
            width: isMobile ? '100%' : 'auto',
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
          <UserPlus size={20} strokeWidth={2.5} />
          Tambah User
        </motion.button>
      </div>

      {/* Premium Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: isMobile ? '16px' : '24px',
        padding: '28px',
        boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)',
        border: '1px solid rgba(226, 232, 240, 0.6)'
      }}>
        {users.length === 0 ? (
          <EmptyState
            variant="no-data"
            icon={UsersIcon}
            title="Belum ada user"
            description="Mulai tambahkan user pertama untuk mengelola akses sistem rekrutmen."
            action={{
              label: "Tambah User",
              onClick: openAdd
            }}
          />
        ) : (
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
                }}>Nama Lengkap</th>
                <th style={{ 
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#64748b',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '2px solid #f1f5f9'
                }}>Username</th>
                <th style={{ 
                  padding: '14px 16px',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#64748b',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '2px solid #f1f5f9'
                }}>Role</th>
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
              {users.map((u, i) => (
                <motion.tr 
                  key={u.id}
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
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '1rem',
                        fontWeight: 700
                      }}>{u.full_name?.charAt(0)}</div>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{u.full_name}</span>
                    </div>
                  </td>
                  <td style={{ 
                    padding: '16px', 
                    borderBottom: '1px solid #f1f5f9'
                  }}>
                    <code style={{ 
                      background: '#f1f5f9', 
                      padding: '6px 12px', 
                      borderRadius: '8px', 
                      fontSize: '0.8rem',
                      color: '#475569',
                      fontWeight: 600,
                      fontFamily: 'monospace'
                    }}>{u.username}</code>
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
                      background: u.role?.toLowerCase() === 'admin' ? '#fee2e2' : u.role?.toLowerCase() === 'hr' ? '#dbeafe' : u.role?.toLowerCase() === 'direktur' ? '#f3e8ff' : u.role?.toLowerCase() === 'manager' ? '#fef3c7' : '#d1fae5',
                      color: u.role?.toLowerCase() === 'admin' ? '#dc2626' : u.role?.toLowerCase() === 'hr' ? '#2563eb' : u.role?.toLowerCase() === 'direktur' ? '#7c3aed' : u.role?.toLowerCase() === 'manager' ? '#d97706' : '#059669'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'currentColor'
                      }} />
                      {u.role?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '16px', 
                    textAlign: 'center',
                    borderBottom: '1px solid #f1f5f9'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => openEdit(u)}
                        style={{
                          padding: '10px',
                          background: '#f1f5f9',
                          borderRadius: '10px',
                          color: '#64748b',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e0e7ff';
                          e.currentTarget.style.color = '#4f46e5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f1f5f9';
                          e.currentTarget.style.color = '#64748b';
                        }}
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => setShowDelete(u)}
                        style={{
                          padding: '10px',
                          background: '#f1f5f9',
                          borderRadius: '10px',
                          color: '#64748b',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fee2e2';
                          e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f1f5f9';
                          e.currentTarget.style.color = '#64748b';
                        }}
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 20, color: '#1e1b4b' }}>
              {editingUser ? '✏️ Edit User' : '➕ Tambah User Baru'}
            </h3>

            <div className="fg">
              <label>Nama Lengkap *</label>
              <input className="fi" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Masukkan nama lengkap" />
            </div>

            <div className="fg">
              <label>Username *</label>
              <input
                className="fi"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Masukkan username"
                disabled={!!editingUser}
                style={editingUser ? { opacity: 0.6 } : {}}
              />
            </div>

            <div className="fg">
              <label>{editingUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password *'}</label>
              <div className="pw-wrap">
                <input
                  className="fi"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'Masukkan password'}
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="fg">
              <label>Role *</label>
              <select className="fi fi-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="user">User</option>
                <option value="hr">HR</option>
                <option value="direktur">Direktur</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-p" onClick={handleSave} disabled={saving}>
                <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button className="btn btn-o" onClick={() => setShowModal(false)}>
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
              <h3>🗑️ Hapus User?</h3>
              <p>Apakah Anda yakin ingin menghapus user <strong>{showDelete.full_name}</strong> ({showDelete.username})?</p>
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

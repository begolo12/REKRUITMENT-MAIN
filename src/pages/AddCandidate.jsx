import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCandidate } from '../services/db';
import { UserPlus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddCandidate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: '',
    posisi: '',
    penempatan: '',
    divisi: '',
    budget_salary: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.posisi.trim()) {
      toast.error('Nama dan Posisi wajib diisi');
      return;
    }
    setLoading(true);
    try {
      await createCandidate(form);
      toast.success('Kandidat berhasil ditambahkan');
      navigate('/candidates');
    } catch (err) {
      toast.error('Gagal menambahkan kandidat: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn btn-o btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Kembali
      </button>

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-h">
          <h3><UserPlus size={18} /> Tambah Kandidat Baru</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="fg">
              <label>Nama Lengkap *</label>
              <input className="fi" name="nama" value={form.nama} onChange={handleChange} placeholder="Masukkan nama lengkap" />
            </div>

            <div className="form-row">
              <div className="fg">
                <label>Posisi *</label>
                <input className="fi" name="posisi" value={form.posisi} onChange={handleChange} placeholder="Contoh: Staff Operasi" />
              </div>
              <div className="fg">
                <label>Divisi</label>
                <input className="fi" name="divisi" value={form.divisi} onChange={handleChange} placeholder="Contoh: Operasi" />
              </div>
            </div>

            <div className="form-row">
              <div className="fg">
                <label>Penempatan</label>
                <input className="fi" name="penempatan" value={form.penempatan} onChange={handleChange} placeholder="Contoh: IKN - Kalimantan Timur" />
              </div>
              <div className="fg">
                <label>Budget Salary</label>
                <input className="fi" name="budget_salary" value={form.budget_salary} onChange={handleChange} placeholder="Contoh: Range 4 JT - 4,8 JT" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-p" type="submit" disabled={loading}>
                <UserPlus size={16} /> {loading ? 'Menyimpan...' : 'Simpan Kandidat'}
              </button>
              <button className="btn btn-o" type="button" onClick={() => navigate('/candidates')}>
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCandidate } from '../services/db';
import { UserPlus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatSalary } from '../utils/helpers';

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
                <select className="fi fi-select" name="posisi" value={form.posisi} onChange={handleChange} required>
                  <option value="">Pilih Posisi</option>
                  <option value="Staff Operasi">Staff Operasi</option>
                  <option value="Staff Keuangan">Staff Keuangan</option>
                  <option value="General Affair">General Affair</option>
                  <option value="Dapur">Dapur</option>
                </select>
              </div>
              <div className="fg">
                <label>Divisi</label>
                <select className="fi fi-select" name="divisi" value={form.divisi} onChange={handleChange}>
                  <option value="">Pilih Divisi</option>
                  <option value="Busdev">Busdev</option>
                  <option value="Keuangan">Keuangan</option>
                  <option value="Operasi">Operasi</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="fg">
                <label>Penempatan</label>
                <select className="fi fi-select" name="penempatan" value={form.penempatan} onChange={handleChange}>
                  <option value="">Pilih Penempatan</option>
                  <option value="Jabodetabek">Jabodetabek</option>
                  <option value="IKN">IKN</option>
                </select>
              </div>
              <div className="fg">
                <label>Budget Salary</label>
                <input className="fi" name="budget_salary" value={form.budget_salary} onChange={(e) => setForm({ ...form, budget_salary: formatSalary(e.target.value) })} placeholder="Contoh: 5.000.000 - 7.000.000" />
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

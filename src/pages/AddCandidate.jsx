import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCandidate } from '../services/db';
import { UserPlus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatSalary } from '../utils/helpers';

// Validation helper functions
const validateBudgetSalary = (value) => {
  if (!value) return true; // Optional field
  // Accept formats like: 5.000.000 - 7.000.000, 5000000, 5.000.000
  const pattern = /^(\d{1,3}(\.\d{3})*|\d+)(\s*-\s*(\d{1,3}(\.\d{3})*|\d+))?$/;
  return pattern.test(value.trim());
};

export default function AddCandidate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: '',
    posisi: '',
    penempatan: '',
    divisi: '',
    budget_salary: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // Validate a single field
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'nama':
        if (!value || !value.trim()) {
          return 'Nama wajib diisi';
        }
        return '';
      case 'posisi':
        if (!value) {
          return 'Posisi wajib dipilih';
        }
        return '';
      case 'budget_salary':
        if (value && !validateBudgetSalary(value)) {
          return 'Format budget salary tidak valid';
        }
        return '';
      default:
        return '';
    }
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    const namaError = validateField('nama', form.nama);
    if (namaError) newErrors.nama = namaError;
    
    const posisiError = validateField('posisi', form.posisi);
    if (posisiError) newErrors.posisi = posisiError;
    
    const budgetError = validateField('budget_salary', form.budget_salary);
    if (budgetError) newErrors.budget_salary = budgetError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, validateField]);

  // Check if form has any validation errors
  const hasErrors = Object.keys(errors).length > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Real-time validation: clear error when user starts typing
    if (touched[name] && errors[name]) {
      const error = validateField(name, value);
      setErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[name] = error;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    const error = validateField(name, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      nama: true,
      posisi: true,
      penempatan: true,
      divisi: true,
      budget_salary: true,
    });
    
    // Validate all fields
    if (!validateForm()) {
      toast.error('Mohon perbaiki kesalahan pada form');
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

  // Helper to get input class with error state
  const getInputClass = (fieldName) => {
    const baseClass = 'fi';
    if (touched[fieldName] && errors[fieldName]) {
      return `${baseClass} fi-error`;
    }
    return baseClass;
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
              <input 
                className={getInputClass('nama')} 
                name="nama" 
                value={form.nama} 
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Masukkan nama lengkap" 
              />
              {touched.nama && errors.nama && (
                <span className="field-error">{errors.nama}</span>
              )}
            </div>

            <div className="form-row">
              <div className="fg">
                <label>Posisi *</label>
                <select 
                  className={`${getInputClass('posisi')} fi-select`} 
                  name="posisi" 
                  value={form.posisi} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Pilih Posisi</option>
                  <option value="Staff Operasi">Staff Operasi</option>
                  <option value="Staff Keuangan">Staff Keuangan</option>
                  <option value="General Affair">General Affair</option>
                  <option value="Dapur">Dapur</option>
                </select>
                {touched.posisi && errors.posisi && (
                  <span className="field-error">{errors.posisi}</span>
                )}
              </div>
              <div className="fg">
                <label>Divisi</label>
                <select 
                  className="fi fi-select" 
                  name="divisi" 
                  value={form.divisi} 
                  onChange={handleChange}
                >
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
                <select 
                  className="fi fi-select" 
                  name="penempatan" 
                  value={form.penempatan} 
                  onChange={handleChange}
                >
                  <option value="">Pilih Penempatan</option>
                  <option value="Jabodetabek">Jabodetabek</option>
                  <option value="IKN">IKN</option>
                </select>
              </div>
              <div className="fg">
                <label>Budget Salary</label>
                <input 
                  className={getInputClass('budget_salary')} 
                  name="budget_salary" 
                  value={form.budget_salary} 
                  onChange={(e) => setForm({ ...form, budget_salary: formatSalary(e.target.value) })}
                  onBlur={handleBlur}
                  placeholder="Contoh: 5.000.000 - 7.000.000" 
                />
                {touched.budget_salary && errors.budget_salary && (
                  <span className="field-error">{errors.budget_salary}</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button 
                className="btn btn-p" 
                type="submit" 
                disabled={loading || hasErrors}
              >
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

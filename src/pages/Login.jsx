import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Eye, EyeOff, CheckCircle, Shield, Users, BarChart3, Sparkles, Zap } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const validateInput = () => {
    const errors = [];
    
    if (!username.trim()) {
      errors.push('Username harus diisi');
    } else if (username.trim().length < 3) {
      errors.push('Username minimal 3 karakter');
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      errors.push('Username hanya boleh huruf, angka, dan underscore');
    }
    
    if (!password.trim()) {
      errors.push('Password harus diisi');
    } else if (password.length < 6) {
      errors.push('Password minimal 6 karakter');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validasi input
    const validationErrors = validateInput();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }
    
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <CheckCircle size={18} />, text: 'Penilaian kandidat terstruktur' },
    { icon: <Shield size={18} />, text: 'Multi-role assessment' },
    { icon: <Users size={18} />, text: 'Kolaborasi tim interviewer' },
    { icon: <BarChart3 size={18} />, text: 'Rekap & laporan otomatis' },
  ];

  return (
    <div className="login-page">
      <motion.div 
        className="login-box"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div 
          className="login-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div 
            className="login-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <Briefcase size={32} />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Daniswara Group
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Recruitment Management System
          </motion.p>
          
          <div className="login-features">
            {features.map((feat, index) => (
              <motion.div 
                key={index}
                className="login-feat"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                >
                  {feat.icon}
                </motion.div>
                <span>{feat.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Decorative elements */}
          <motion.div
            className="login-decoration"
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles size={60} color="rgba(255,255,255,0.1)" />
          </motion.div>
        </motion.div>

        <motion.div 
          className="login-right"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.form 
            className="login-form" 
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3>Selamat Datang</h3>
              <p>Masuk ke akun Anda untuk melanjutkan</p>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  className="alert alert-err"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="fg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label>Username</label>
              <input
                className="fi input-modern"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </motion.div>

            <motion.div 
              className="fg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label>Password</label>
              <div className="pw-wrap">
                <input
                  className="fi input-modern"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="pw-toggle" 
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.button 
              className="btn btn-p btn-lg btn-block btn-modern btn-modern-primary" 
              type="submit" 
              disabled={loading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ⏳ Memproses...
                </motion.span>
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="btn-content"
                >
                  <Zap size={18} />
                  Masuk
                </motion.span>
              )}
            </motion.button>

            {/* Security badge */}
            <motion.div 
              className="login-security"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Shield size={14} />
              <span>Sistem terenkripsi & aman</span>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  );
}

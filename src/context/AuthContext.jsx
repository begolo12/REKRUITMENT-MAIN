import { createContext, useContext, useState, useEffect } from 'react';
import { getUserByUsername, validateUser, preloadAll, fixAllStatuses, ensureDefaultAdmin, seedDefaultCategories } from '../services/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Ensure default admin user exists & seed default categories
        await ensureDefaultAdmin();
        await seedDefaultCategories();
        
        // Restore session from localStorage
        const saved = localStorage.getItem('recruitment_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setUser(parsed);
            // Clear any previous errors on successful session restore
            setError(null);
            // Preload all data + fix any wrong statuses
            preloadAll().then(() => fixAllStatuses()).catch(() => {});
          } catch { 
            localStorage.removeItem('recruitment_user'); 
            setError('Gagal memuat sesi. Silakan login kembali.');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Gagal menginisialisasi aplikasi. Silakan refresh halaman.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Clear error when user changes (successful login/logout)
  useEffect(() => {
    if (user) {
      setError(null);
    }
  }, [user]);

  const login = async (username, password) => {
    // Clear previous errors before attempting login
    setError(null);
    
    try {
      // Validasi input
      if (!username || !password) {
        const errorMsg = 'Username dan password wajib diisi';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      if (username.length < 3) {
        const errorMsg = 'Username minimal 3 karakter';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      if (password.length < 6) {
        const errorMsg = 'Password minimal 6 karakter';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Sanitasi input
      const sanitizedUsername = username.toLowerCase().trim();
      
      console.log('🔐 Login attempt:', { username: sanitizedUsername, passwordLength: password.length });
      
      // Gunakan validateUser dengan password hashing
      const u = await validateUser(sanitizedUsername, password);
      
      console.log('🔍 Validate result:', u ? 'User found' : 'User not found or password mismatch');
      
      if (!u) {
        const errorMsg = 'Username atau password salah';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      const userData = { id: u.id, username: u.username, full_name: u.full_name, role: u.role };
      setUser(userData);
      setError(null); // Clear error on successful login
      localStorage.setItem('recruitment_user', JSON.stringify(userData));
      // Preload all data after login for instant navigation
      preloadAll().catch(() => {});
      return userData;
    } catch (err) {
      // Error already set in specific checks above, but set generic error if not set
      if (!error) {
        setError(err.message || 'Terjadi kesalahan saat login');
      }
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const logout = () => {
    setUser(null);
    setError(null); // Clear error on logout
    localStorage.removeItem('recruitment_user');
  };

  const refreshUser = async () => {
    if (user) {
      const u = await getUserByUsername(user.username);
      if (u) {
        const userData = { id: u.id, username: u.username, full_name: u.full_name, role: u.role };
        setUser(userData);
        localStorage.setItem('recruitment_user', JSON.stringify(userData));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

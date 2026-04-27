import { createContext, useContext, useState, useEffect } from 'react';
import { getUserByUsername, validateUser, preloadAll, fixAllStatuses } from '../services/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Restore session from localStorage
      const saved = localStorage.getItem('recruitment_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          // Preload all data + fix any wrong statuses
          preloadAll().then(() => fixAllStatuses()).catch(() => {});
        } catch { localStorage.removeItem('recruitment_user'); }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (username, password) => {
    // Validasi input
    if (!username || !password) {
      throw new Error('Username dan password wajib diisi');
    }
    if (username.length < 3) {
      throw new Error('Username minimal 3 karakter');
    }
    if (password.length < 6) {
      throw new Error('Password minimal 6 karakter');
    }
    
    // Sanitasi input
    const sanitizedUsername = username.toLowerCase().trim();
    
    // Gunakan validateUser dengan password hashing
    const u = await validateUser(sanitizedUsername, password);
    if (!u) throw new Error('Username atau password salah');
    
    const userData = { id: u.id, username: u.username, full_name: u.full_name, role: u.role };
    setUser(userData);
    localStorage.setItem('recruitment_user', JSON.stringify(userData));
    // Preload all data after login for instant navigation
    preloadAll().catch(() => {});
    return userData;
  };

  const logout = () => {
    setUser(null);
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
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

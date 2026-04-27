import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-simple"
      title={isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
    >
      {isDark ? (
        <Moon size={18} className="theme-icon-dark" />
      ) : (
        <Sun size={18} className="theme-icon-light" />
      )}
    </button>
  );
}

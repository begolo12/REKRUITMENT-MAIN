import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, ClipboardList, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './BottomNav.css';

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isAdminOrHR = isAdmin || user?.role?.toLowerCase() === 'hr';
  const isAdminOrHROrDirekturOrManager = isAdminOrHR || 
    user?.role?.toLowerCase() === 'direktur' || 
    user?.role?.toLowerCase() === 'manager';

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard', show: true },
    { to: '/candidates', icon: Users, label: 'Kandidat', show: true },
    { to: '/my-assessments', icon: ClipboardList, label: 'Penilaian', show: true },
    { to: '/rekap', icon: BarChart3, label: 'Rekap', show: isAdminOrHROrDirekturOrManager },
    { to: '/settings', icon: Settings, label: 'Pengaturan', show: isAdmin },
  ];

  const visibleItems = navItems.filter(item => item.show);

  return (
    <nav className="bottom-nav mobile-only" role="navigation" aria-label="Mobile navigation">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to || 
          (item.to !== '/' && location.pathname.startsWith(item.to));
        
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={20} className="bottom-nav-icon" />
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

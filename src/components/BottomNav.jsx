import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    { to: '/settings', icon: Settings, label: 'Pengaturan', show: isAdminOrHROrDirekturOrManager },
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
            <motion.div
              className="bottom-nav-icon-wrapper"
              animate={{
                scale: isActive ? 1.1 : 1,
                y: isActive ? -2 : 0
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
            >
              <Icon 
                size={22} 
                className="bottom-nav-icon" 
                strokeWidth={isActive ? 2.5 : 2}
              />
            </motion.div>
            <motion.span 
              className="bottom-nav-label"
              animate={{
                opacity: isActive ? 1 : 0.7,
                fontWeight: isActive ? 600 : 500
              }}
            >
              {item.label}
            </motion.span>
            {isActive && (
              <motion.div
                className="active-indicator"
                layoutId="activeTab"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35
                }}
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

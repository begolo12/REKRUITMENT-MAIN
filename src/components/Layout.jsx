import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, ClipboardList,
  BarChart3, HelpCircle, LogOut, Pin, PinOff, Menu, X, Briefcase
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const [routeKey, setRouteKey] = useState(location.pathname);

  const expanded = hovered || pinned || mobOpen;

  useEffect(() => { 
    setMobOpen(false); 
    setRouteKey(location.pathname);
  }, [location.pathname]);

  const role = user?.role?.toLowerCase();
  const isAdmin = role === 'admin';
  const isHR = role === 'hr';
  const isAdminOrHR = isAdmin || isHR;

  const menu = [
    { label: 'MENU', items: [
      { to: '/', icon: <LayoutDashboard size={20} />, text: 'Dashboard' },
      { to: '/candidates', icon: <Users size={20} />, text: 'Kandidat' },
      { to: '/my-assessments', icon: <ClipboardList size={20} />, text: 'Penilaian Saya' },
    ]},
    { label: 'LAPORAN', items: [
      { to: '/rekap', icon: <BarChart3 size={20} />, text: 'Rekap Nilai', show: isAdminOrHR },
    ]},
    { label: 'PENGATURAN', items: [
      { to: '/users', icon: <Briefcase size={20} />, text: 'Kelola User', show: isAdmin },
      { to: '/questions', icon: <HelpCircle size={20} />, text: 'Kelola Soal', show: isAdminOrHR },
    ]},
  ];

  const pageTitle = () => {
    const p = location.pathname;
    if (p === '/') return 'Dashboard';
    if (p.startsWith('/candidates/')) return 'Detail Kandidat';
    if (p === '/candidates') return 'Daftar Kandidat';
    if (p.startsWith('/assessment/')) return 'Form Penilaian';
    if (p === '/my-assessments') return 'Penilaian Saya';
    if (p === '/rekap') return 'Rekap Nilai';
    if (p === '/users') return 'Kelola User';
    if (p === '/questions') return 'Kelola Soal';
    return 'Halaman';
  };

  return (
    <div className="app">
      {mobOpen && <div className="sb-overlay show" onClick={() => setMobOpen(false)} />}
      
      <aside
        className={`sidebar${expanded ? ' expanded' : ''}${mobOpen ? ' mob-open' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="navigation"
        aria-label="Menu navigasi utama"
      >
        <div className="sb-brand">
          <div className="sb-logo" aria-hidden="true">
            <Briefcase size={20} />
          </div>
          <div className="sb-brand-text text">
            <h4 id="app-title">Daniswara</h4>
            <small id="app-subtitle">Recruitment System</small>
          </div>
        </div>

        <div className="sb-user" role="region" aria-label="Informasi pengguna">
          <div className="sb-avatar" aria-hidden="true">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="sb-user-info text">
            <h6 id="user-name">{user?.full_name}</h6>
            <span id="user-role">{user?.role}</span>
          </div>
        </div>

        <nav className="sb-menu" role="menubar" aria-label="Menu aplikasi">
          {menu.map((group) => {
            const visibleItems = group.items.filter(i => i.show !== false);
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label}>
                <div className="sb-label">{group.label}</div>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
                    role="menuitem"
                    aria-label={item.text}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    <span className="text">{item.text}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
          <div className="sb-label">AKUN</div>
          <button 
            className="sb-link" 
            onClick={logout}
            role="menuitem"
            aria-label="Keluar dari aplikasi"
          >
            <span aria-hidden="true"><LogOut size={20} /></span>
            <span className="text">Logout</span>
          </button>
        </nav>

        <div className="sb-pin">
          <button
            className={pinned ? 'active' : ''}
            onClick={() => setPinned(!pinned)}
            title={pinned ? 'Lepas pin sidebar' : 'Pin sidebar'}
            aria-label={pinned ? 'Lepas pin sidebar' : 'Pin sidebar'}
            aria-pressed={pinned}
          >
            <span aria-hidden="true">{pinned ? <PinOff size={18} /> : <Pin size={18} />}</span>
          </button>
        </div>
      </aside>

      <div className={`main${pinned ? ' shifted' : ''}`}>
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="mob-toggle" onClick={() => setMobOpen(!mobOpen)}>
              {mobOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <h2>{pageTitle()}</h2>
          </div>
          <div className="topbar-right">
            <span className="user-name">{user?.full_name}</span>
          </div>
        </header>
        <main className="content" key={routeKey}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

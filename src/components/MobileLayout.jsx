import { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronLeft, Briefcase } from 'lucide-react';
import BottomNav from './BottomNav';
import './MobileLayout.css';

function MobileHeader({ showBack, onBack, title }) {
  const { user } = useAuth();
  const location = useLocation();
  
  const isHome = location.pathname === '/';
  
  return (
    <header className="mobile-header safe-area-top">
      <div className="mobile-header-content">
        <div className="mobile-header-left">
          {showBack || !isHome ? (
            <button 
              className="mobile-header-btn"
              onClick={onBack || (() => window.history.back())}
              aria-label="Kembali"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <div className="mobile-logo">
              <Briefcase size={20} />
            </div>
          )}
        </div>
        
        <h1 className="mobile-header-title">
          {title || 'Daniswara'}
        </h1>
        
        <div className="mobile-header-right">
          <span className="mobile-user-name">{user?.full_name}</span>
        </div>
      </div>
    </header>
  );
}

export default function MobileLayout({ children, showBack, onBack, title }) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  
  useEffect(() => {
    // Handle keyboard appearance on mobile
    const handleResize = () => {
      const isKeyboardOpen = window.innerHeight < window.screen.height * 0.75;
      setKeyboardOpen(isKeyboardOpen);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="mobile-layout">
      <MobileHeader 
        showBack={showBack} 
        onBack={onBack}
        title={title}
      />
      
      <main className={`mobile-layout-content ${keyboardOpen ? 'keyboard-open' : ''}`}>
        {children}
      </main>
      
      {!keyboardOpen && <BottomNav />}
    </div>
  );
}

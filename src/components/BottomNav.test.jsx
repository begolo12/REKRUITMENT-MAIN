import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BottomNav from './BottomNav';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      role: 'admin',
      full_name: 'Test User'
    }
  })
}));

describe('BottomNav Component', () => {
  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should render navigation items', () => {
    renderWithRouter(<BottomNav />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Kandidat')).toBeInTheDocument();
    expect(screen.getByText('Penilaian')).toBeInTheDocument();
  });

  it('should only show on mobile viewport', () => {
    const { container } = renderWithRouter(<BottomNav />);
    const nav = container.querySelector('.bottom-nav');
    
    expect(nav).toHaveClass('mobile-only');
  });

  it('should highlight active route', () => {
    renderWithRouter(<BottomNav />);
    
    const links = screen.getAllByLabelText(/Dashboard|Kandidat|Penilaian/);
    expect(links.length).toBeGreaterThan(0);
    
    // Check if first link has active class
    expect(links[0]).toHaveClass('active');
  });

  it('should have proper accessibility attributes', () => {
    const { container } = renderWithRouter(<BottomNav />);
    
    // Use container.querySelector since element might be hidden by CSS
    const nav = container.querySelector('nav[role="navigation"]');
    expect(nav).toHaveAttribute('aria-label', 'Mobile navigation');
    
    // Check if nav items have aria-label
    const dashboardLink = container.querySelector('[aria-label="Dashboard"]');
    expect(dashboardLink).toBeInTheDocument();
  });
});

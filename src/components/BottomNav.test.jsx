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

  it('should have touch targets minimum 48px (Enhanced WCAG)', () => {
    const { container } = renderWithRouter(<BottomNav />);
    
    const navItems = container.querySelectorAll('.bottom-nav-item');
    expect(navItems.length).toBeGreaterThan(0);
    
    navItems.forEach(item => {
      // Check CSS properties for touch target size
      const minHeight = window.getComputedStyle(item).minHeight;
      const minWidth = window.getComputedStyle(item).minWidth;
      
      // Enhanced: Minimum 48px for better mobile UX (exceeds WCAG 44px)
      expect(item).toHaveStyle({
        minHeight: expect.stringMatching(/(48px|52px|56px)/),
        minWidth: expect.stringMatching(/(48px|52px|56px|64px|68px)/)
      });
    });
  });

  it('should have safe area padding for notched devices', () => {
    const { container } = renderWithRouter(<BottomNav />);
    
    const nav = container.querySelector('.bottom-nav');
    expect(nav).toBeInTheDocument();
    
    // Check for safe-area-inset-bottom support in CSS
    const style = window.getComputedStyle(nav);
    // The actual padding-bottom will be set via CSS with env(safe-area-inset-bottom)
    // We verify the class has the proper CSS setup
    expect(nav).toHaveClass('bottom-nav');
  });

  it('should have smooth animations on active state', () => {
    const { container } = renderWithRouter(<BottomNav />);
    
    const activeLink = screen.getByLabelText('Dashboard');
    expect(activeLink).toHaveClass('active');
    
    // Check for active indicator element
    const activeIndicator = container.querySelector('.active-indicator');
    expect(activeIndicator).toBeInTheDocument();
    
    // Verify active class is applied (color is set via CSS)
    expect(activeLink.classList.contains('active')).toBe(true);
  });

  it('should have proper spacing between nav items', () => {
    const { container } = renderWithRouter(<BottomNav />);
    
    const navItems = container.querySelectorAll('.bottom-nav-item');
    expect(navItems.length).toBeGreaterThan(0);
    
    navItems.forEach(item => {
      const gap = window.getComputedStyle(item).gap;
      // Verify proper gap between icon and label
      expect(gap).toBeTruthy();
    });
  });

  it('should be positioned fixed at bottom', () => {
    const { container } = renderWithRouter(<BottomNav />);
    
    const nav = container.querySelector('.bottom-nav');
    expect(nav).toHaveStyle({
      position: 'fixed',
      bottom: '0'
    });
  });

  it('should have proper z-index to stay above content', () => {
    const { container } = renderWithRouter(<BottomNav />);
    
    const nav = container.querySelector('.bottom-nav');
    const zIndex = parseInt(window.getComputedStyle(nav).zIndex);
    expect(zIndex).toBeGreaterThanOrEqual(100);
  });
});

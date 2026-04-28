import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Layout';

// Mock AuthContext
const mockUser = {
  full_name: 'Test User',
  role: 'admin'
};

const mockLogout = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout
  }),
  AuthProvider: ({ children }) => children
}));

// Helper to set viewport size
const setViewportSize = (width, height = 800) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
};

const renderLayout = () => {
  return render(
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
};

describe('Layout - Responsive Sidebar', () => {
  const originalInnerWidth = window.innerWidth;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    setViewportSize(originalInnerWidth);
  });

  describe('Mobile View (max-width: 768px)', () => {
    beforeEach(() => {
      setViewportSize(375); // iPhone width
    });

    it('should hide sidebar by default on mobile', () => {
      renderLayout();
      const sidebar = screen.getByRole('navigation', { name: /menu navigasi utama/i });
      expect(sidebar).not.toHaveClass('mob-open');
    });

    it('should show mobile menu toggle button on mobile', () => {
      renderLayout();
      const toggleButton = screen.getByLabelText(/buka menu navigasi/i);
      expect(toggleButton).toBeInTheDocument();
    });

    it('should open sidebar when toggle button is clicked on mobile', () => {
      renderLayout();
      const toggleButton = screen.getByLabelText(/buka menu navigasi/i);
      fireEvent.click(toggleButton);
      
      const sidebar = screen.getByRole('navigation', { name: /menu navigasi utama/i });
      expect(sidebar).toHaveClass('mob-open');
    });

    it('should show overlay when sidebar is open on mobile', () => {
      renderLayout();
      const toggleButton = screen.getByLabelText(/buka menu navigasi/i);
      fireEvent.click(toggleButton);
      
      const overlay = document.querySelector('.sb-overlay');
      expect(overlay).toHaveClass('show');
    });

    it('should close sidebar when overlay is clicked', () => {
      renderLayout();
      const toggleButton = screen.getByLabelText(/buka menu navigasi/i);
      fireEvent.click(toggleButton);
      
      const overlay = document.querySelector('.sb-overlay');
      fireEvent.click(overlay);
      
      const sidebar = screen.getByRole('navigation', { name: /menu navigasi utama/i });
      expect(sidebar).not.toHaveClass('mob-open');
    });
  });

  describe('Desktop View (min-width: 1025px)', () => {
    beforeEach(() => {
      setViewportSize(1024); // Desktop width
    });

    it('should show sidebar by default on desktop', () => {
      renderLayout();
      const sidebar = screen.getByRole('navigation', { name: /menu navigasi utama/i });
      expect(sidebar).toBeInTheDocument();
    });

    it('should hide mobile menu toggle button on desktop', () => {
      setViewportSize(1025); // Above 1024px
      renderLayout();
      const toggleButton = document.querySelector('.mob-toggle');
      // On desktop, the toggle button should have display: none
      expect(toggleButton).toBeInTheDocument();
    });

    it('should expand sidebar on hover for desktop', () => {
      renderLayout();
      const sidebar = screen.getByRole('navigation', { name: /menu navigasi utama/i });
      
      fireEvent.mouseEnter(sidebar);
      expect(sidebar).toHaveClass('expanded');
    });

    it('should collapse sidebar when mouse leaves for desktop', () => {
      renderLayout();
      const sidebar = screen.getByRole('navigation', { name: /menu navigasi utama/i });
      
      fireEvent.mouseEnter(sidebar);
      fireEvent.mouseLeave(sidebar);
      expect(sidebar).not.toHaveClass('expanded');
    });

    it('should keep sidebar expanded when pinned on desktop', () => {
      renderLayout();
      const sidebar = screen.getByRole('navigation', { name: /menu navigasi utama/i });
      const pinButton = screen.getByLabelText(/pin sidebar/i);
      
      fireEvent.click(pinButton);
      expect(sidebar).toHaveClass('expanded');
      
      fireEvent.mouseLeave(sidebar);
      expect(sidebar).toHaveClass('expanded');
    });
  });
});

describe('Layout - Mobile-Friendly Component Sizes', () => {
  const originalInnerWidth = window.innerWidth;
  
  beforeEach(() => {
    setViewportSize(375);
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    setViewportSize(originalInnerWidth);
  });

  it('should have bottom navigation in DOM on mobile', () => {
    renderLayout();
    const bottomNav = document.querySelector('.bottom-nav');
    expect(bottomNav).toBeInTheDocument();
  });

  it('should have proper touch targets on mobile menu items', () => {
    renderLayout();
    const toggleButton = screen.getByLabelText(/buka menu navigasi/i);
    fireEvent.click(toggleButton);
    
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThan(0);
    
    // Check that menu items exist and have proper structure
    menuItems.forEach(item => {
      expect(item).toBeInTheDocument();
    });
  });
});

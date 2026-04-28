import { describe, it, expect, vi, beforeEach } from 'vitest';
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

// Mock window.matchMedia
const mockMatchMedia = (matches) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

const renderLayout = () => {
  return render(
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
};

describe('Layout - Responsive Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mobile View (max-width: 768px)', () => {
    beforeEach(() => {
      mockMatchMedia(true); // Mobile view
      window.innerWidth = 375; // iPhone width
    });

    it('should hide sidebar by default on mobile', () => {
      renderLayout();
      const sidebar = screen.getByRole('navigation');
      expect(sidebar).not.toHaveClass('mob-open');
    });

    it('should show mobile menu toggle button on mobile', () => {
      renderLayout();
      const toggleButton = screen.getByLabelText(/buka menu navigasi/i);
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toBeVisible();
    });

    it('should open sidebar when toggle button is clicked on mobile', () => {
      renderLayout();
      const toggleButton = screen.getByLabelText(/buka menu navigasi/i);
      fireEvent.click(toggleButton);
      
      const sidebar = screen.getByRole('navigation');
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
      
      const sidebar = screen.getByRole('navigation');
      expect(sidebar).not.toHaveClass('mob-open');
    });
  });

  describe('Desktop View (min-width: 769px)', () => {
    beforeEach(() => {
      mockMatchMedia(false); // Desktop view
      window.innerWidth = 1024; // Desktop width
    });

    it('should show sidebar by default on desktop', () => {
      renderLayout();
      const sidebar = screen.getByRole('navigation');
      expect(sidebar).toBeVisible();
    });

    it('should hide mobile menu toggle button on desktop', () => {
      renderLayout();
      const toggleButton = document.querySelector('.mob-toggle');
      expect(toggleButton).not.toBeVisible();
    });

    it('should expand sidebar on hover for desktop', () => {
      renderLayout();
      const sidebar = screen.getByRole('navigation');
      
      fireEvent.mouseEnter(sidebar);
      expect(sidebar).toHaveClass('expanded');
    });

    it('should collapse sidebar when mouse leaves for desktop', () => {
      renderLayout();
      const sidebar = screen.getByRole('navigation');
      
      fireEvent.mouseEnter(sidebar);
      fireEvent.mouseLeave(sidebar);
      expect(sidebar).not.toHaveClass('expanded');
    });

    it('should keep sidebar expanded when pinned on desktop', () => {
      renderLayout();
      const sidebar = screen.getByRole('navigation');
      const pinButton = screen.getByLabelText(/pin sidebar/i);
      
      fireEvent.click(pinButton);
      expect(sidebar).toHaveClass('expanded');
      
      fireEvent.mouseLeave(sidebar);
      expect(sidebar).toHaveClass('expanded');
    });
  });
});

describe('Layout - Mobile-Friendly Component Sizes', () => {
  beforeEach(() => {
    mockMatchMedia(true);
    window.innerWidth = 375;
  });

  it('should have compact header on mobile', () => {
    renderLayout();
    const topbar = document.querySelector('.topbar');
    const styles = window.getComputedStyle(topbar);
    
    // Header should not be too tall on mobile
    expect(parseInt(styles.padding)).toBeLessThanOrEqual(16);
  });

  it('should have bottom navigation visible on mobile', () => {
    renderLayout();
    const bottomNav = document.querySelector('.bottom-nav');
    expect(bottomNav).toBeInTheDocument();
    expect(bottomNav).toBeVisible();
  });

  it('should have proper touch targets on mobile', () => {
    renderLayout();
    const menuItems = screen.getAllByRole('menuitem');
    
    menuItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      // Touch targets should be at least 44px
      expect(rect.height).toBeGreaterThanOrEqual(44);
    });
  });
});

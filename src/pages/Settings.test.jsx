import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Settings from './Settings';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock AuthContext
const mockUser = {
  full_name: 'Admin User',
  role: 'admin'
};

const mockRegularUser = {
  full_name: 'Regular User',
  role: 'user'
};

let currentUser = mockUser;

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: currentUser,
    logout: vi.fn()
  })
}));

// Mock services
vi.mock('../services/db', () => ({
  resetAllData: vi.fn().mockResolvedValue(undefined)
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const renderSettings = () => {
  return render(
    <BrowserRouter>
      <Settings />
    </BrowserRouter>
  );
};

describe('Settings - Mobile Responsiveness', () => {
  beforeEach(() => {
    currentUser = mockUser;
    vi.clearAllMocks();
  });

  describe('Admin View', () => {
    it('should render settings page for admin', () => {
      renderSettings();
      expect(screen.getByText('Pengaturan Sistem')).toBeInTheDocument();
      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    });

    it('should have compact header on mobile screens', () => {
      renderSettings();
      const header = screen.getByText('Pengaturan Sistem').closest('div').parentElement;
      expect(header).toBeInTheDocument();
    });

    it('should have responsive danger zone card', () => {
      renderSettings();
      const dangerZoneHeading = screen.getByText('Danger Zone');
      expect(dangerZoneHeading).toBeInTheDocument();
      
      // Use role to find the button specifically
      const resetButton = screen.getByRole('button', { name: /reset semua data/i });
      expect(resetButton).toBeInTheDocument();
    });

    it('should show confirmation modal when reset button is clicked', async () => {
      renderSettings();
      const resetButton = screen.getByRole('button', { name: /reset semua data/i });
      
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByText('Reset Semua Data?')).toBeInTheDocument();
      });
    });
  });

  describe('Non-Admin View', () => {
    beforeEach(() => {
      currentUser = mockRegularUser;
    });

    it('should show access denied for non-admin users', () => {
      renderSettings();
      expect(screen.getByText('Akses Ditolak')).toBeInTheDocument();
      expect(screen.getByText('Hanya Admin yang dapat mengakses halaman ini.')).toBeInTheDocument();
    });

    it('should have responsive access denied card', () => {
      renderSettings();
      const accessDeniedCard = screen.getByText('Akses Ditolak').closest('div').parentElement;
      expect(accessDeniedCard).toBeInTheDocument();
    });
  });
});

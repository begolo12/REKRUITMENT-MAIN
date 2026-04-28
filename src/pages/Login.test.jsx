import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock the auth context
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Login Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Username validation', () => {
    it('shows validation error for empty username on blur', async () => {
      renderWithRouter(<Login />);
      
      const usernameInput = screen.getByPlaceholderText('Masukkan username');
      fireEvent.blur(usernameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Username harus diisi')).toBeInTheDocument();
      });
    });

    it('shows validation error for username less than 3 characters on blur', async () => {
      renderWithRouter(<Login />);
      
      const usernameInput = screen.getByPlaceholderText('Masukkan username');
      fireEvent.change(usernameInput, { target: { value: 'ab' } });
      fireEvent.blur(usernameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Username minimal 3 karakter')).toBeInTheDocument();
      });
    });

    it('shows validation error for username with invalid characters on blur', async () => {
      renderWithRouter(<Login />);
      
      const usernameInput = screen.getByPlaceholderText('Masukkan username');
      fireEvent.change(usernameInput, { target: { value: 'user@name' } });
      fireEvent.blur(usernameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Username hanya boleh huruf, angka, dan underscore')).toBeInTheDocument();
      });
    });

    it('clears username error when valid input is entered', async () => {
      renderWithRouter(<Login />);
      
      const usernameInput = screen.getByPlaceholderText('Masukkan username');
      fireEvent.change(usernameInput, { target: { value: 'ab' } });
      fireEvent.blur(usernameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Username minimal 3 karakter')).toBeInTheDocument();
      });
      
      fireEvent.change(usernameInput, { target: { value: 'validuser' } });
      fireEvent.blur(usernameInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Username minimal 3 karakter')).not.toBeInTheDocument();
      });
    });
  });

  describe('Password validation', () => {
    it('shows validation error for empty password on blur', async () => {
      renderWithRouter(<Login />);
      
      const passwordInput = screen.getByPlaceholderText('Masukkan password');
      fireEvent.blur(passwordInput);
      
      await waitFor(() => {
        expect(screen.getByText('Password harus diisi')).toBeInTheDocument();
      });
    });

    it('shows validation error for password less than 6 characters on blur', async () => {
      renderWithRouter(<Login />);
      
      const passwordInput = screen.getByPlaceholderText('Masukkan password');
      fireEvent.change(passwordInput, { target: { value: '12345' } });
      fireEvent.blur(passwordInput);
      
      await waitFor(() => {
        expect(screen.getByText('Password minimal 6 karakter')).toBeInTheDocument();
      });
    });

    it('clears password error when valid input is entered', async () => {
      renderWithRouter(<Login />);
      
      const passwordInput = screen.getByPlaceholderText('Masukkan password');
      fireEvent.change(passwordInput, { target: { value: '12345' } });
      fireEvent.blur(passwordInput);
      
      await waitFor(() => {
        expect(screen.getByText('Password minimal 6 karakter')).toBeInTheDocument();
      });
      
      fireEvent.change(passwordInput, { target: { value: 'validpassword123' } });
      fireEvent.blur(passwordInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Password minimal 6 karakter')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form submission', () => {
    it('calls login function with valid credentials', async () => {
      mockLogin.mockResolvedValueOnce();
      renderWithRouter(<Login />);
      
      const usernameInput = screen.getByPlaceholderText('Masukkan username');
      const passwordInput = screen.getByPlaceholderText('Masukkan password');
      
      fireEvent.change(usernameInput, { target: { value: 'validuser' } });
      fireEvent.change(passwordInput, { target: { value: 'validpassword123' } });
      
      const submitButton = screen.getByText('Masuk');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('validuser', 'validpassword123');
      });
    });

    it('shows error message on login failure', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Username atau password salah'));
      renderWithRouter(<Login />);
      
      const usernameInput = screen.getByPlaceholderText('Masukkan username');
      const passwordInput = screen.getByPlaceholderText('Masukkan password');
      
      fireEvent.change(usernameInput, { target: { value: 'validuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      
      const submitButton = screen.getByText('Masuk');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Username atau password salah/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password visibility toggle', () => {
    it('toggles password visibility', async () => {
      renderWithRouter(<Login />);
      
      const passwordInput = screen.getByPlaceholderText('Masukkan password');
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Find and click the toggle button (Eye icon)
      const toggleButton = screen.getByRole('button', { name: '' });
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('type', 'text');
      });
    });
  });
});

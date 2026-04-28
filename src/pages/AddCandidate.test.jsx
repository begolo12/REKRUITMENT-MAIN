import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddCandidate from './AddCandidate';

// Mock the services
vi.mock('../services/db', () => ({
  createCandidate: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
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

describe('AddCandidate Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Nama validation', () => {
    it('shows validation error for empty nama on blur', async () => {
      renderWithRouter(<AddCandidate />);
      const namaInput = screen.getByPlaceholderText('Masukkan nama lengkap');
      
      fireEvent.blur(namaInput);
      
      await waitFor(() => {
        expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument();
      });
    });

    it('shows validation error for nama with only whitespace', async () => {
      renderWithRouter(<AddCandidate />);
      const namaInput = screen.getByPlaceholderText('Masukkan nama lengkap');
      
      fireEvent.change(namaInput, { target: { value: '   ' } });
      fireEvent.blur(namaInput);
      
      await waitFor(() => {
        expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument();
      });
    });

    it('clears nama error when valid input is entered', async () => {
      renderWithRouter(<AddCandidate />);
      const namaInput = screen.getByPlaceholderText('Masukkan nama lengkap');
      
      fireEvent.blur(namaInput);
      await waitFor(() => {
        expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument();
      });
      
      fireEvent.change(namaInput, { target: { value: 'John Doe' } });
      fireEvent.blur(namaInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Nama wajib diisi')).not.toBeInTheDocument();
      });
    });
  });

  describe('Posisi validation', () => {
    it('shows validation error when posisi is not selected on blur', async () => {
      renderWithRouter(<AddCandidate />);
      // Use getByDisplayValue to find the select element
      const posisiSelect = screen.getByDisplayValue('Pilih Posisi');
      
      fireEvent.blur(posisiSelect);
      
      await waitFor(() => {
        expect(screen.getByText('Posisi wajib dipilih')).toBeInTheDocument();
      });
    });

    it('clears posisi error when valid option is selected', async () => {
      renderWithRouter(<AddCandidate />);
      const posisiSelect = screen.getByDisplayValue('Pilih Posisi');
      
      fireEvent.blur(posisiSelect);
      await waitFor(() => {
        expect(screen.getByText('Posisi wajib dipilih')).toBeInTheDocument();
      });
      
      fireEvent.change(posisiSelect, { target: { value: 'Staff Operasi' } });
      fireEvent.blur(posisiSelect);
      
      await waitFor(() => {
        expect(screen.queryByText('Posisi wajib dipilih')).not.toBeInTheDocument();
      });
    });
  });

  describe('Budget Salary validation', () => {
    it('accepts valid budget salary format', async () => {
      renderWithRouter(<AddCandidate />);
      const budgetInput = screen.getByPlaceholderText('Contoh: 5.000.000 - 7.000.000');
      
      fireEvent.change(budgetInput, { target: { value: '5.000.000 - 7.000.000' } });
      fireEvent.blur(budgetInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Format budget salary tidak valid')).not.toBeInTheDocument();
      });
    });

    it('accepts empty budget salary (optional field)', async () => {
      renderWithRouter(<AddCandidate />);
      const budgetInput = screen.getByPlaceholderText('Contoh: 5.000.000 - 7.000.000');
      
      // Clear any existing value
      fireEvent.change(budgetInput, { target: { value: '' } });
      fireEvent.blur(budgetInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Format budget salary tidak valid')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form submission', () => {
    it('disables submit button when there are validation errors', async () => {
      renderWithRouter(<AddCandidate />);
      const namaInput = screen.getByPlaceholderText('Masukkan nama lengkap');
      
      fireEvent.blur(namaInput);
      
      await waitFor(() => {
        const submitButton = screen.getByText('Simpan Kandidat');
        expect(submitButton).toBeDisabled();
      });
    });

    it('shows all validation errors on submit with empty form', async () => {
      renderWithRouter(<AddCandidate />);
      const submitButton = screen.getByText('Simpan Kandidat');
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument();
        expect(screen.getByText('Posisi wajib dipilih')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time validation', () => {
    it('validates nama in real-time as user types', async () => {
      renderWithRouter(<AddCandidate />);
      const namaInput = screen.getByPlaceholderText('Masukkan nama lengkap');
      
      // Initially no error
      expect(screen.queryByText('Nama wajib diisi')).not.toBeInTheDocument();
      
      // Trigger validation on blur first
      fireEvent.blur(namaInput);
      await waitFor(() => {
        expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument();
      });
      
      // Clear error when user starts typing
      fireEvent.change(namaInput, { target: { value: 'J' } });
      await waitFor(() => {
        expect(screen.queryByText('Nama wajib diisi')).not.toBeInTheDocument();
      });
    });
  });
});

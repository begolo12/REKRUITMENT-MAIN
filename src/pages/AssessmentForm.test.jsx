import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AssessmentForm from './AssessmentForm';

// Mock the services
vi.mock('../services/db', () => ({
  getCategories: vi.fn(),
  getAssessments: vi.fn(),
  saveAssessments: vi.fn(),
  getCandidate: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user1', name: 'Test User' } }),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock useParams
const mockParams = { candidateId: 'cand1' };
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockParams,
    useNavigate: () => vi.fn(),
  };
});

import { getCategories, getAssessments, getCandidate } from '../services/db';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AssessmentForm Validation', () => {
  const mockCandidate = { id: 'cand1', nama: 'John Doe', posisi: 'Staff', penempatan: 'Jakarta' };
  const mockCategories = [
    { id: 'cat1', kategori_utama: 'A', sub_kategori: 'Pengalaman', pertanyaan: 'Berapa tahun pengalaman?', tipe: 'rating', bobot: 0.2, kode: 'A1' },
    { id: 'cat2', kategori_utama: 'A', sub_kategori: 'Pendidikan', pertanyaan: 'Pendidikan terakhir?', tipe: 'rating', bobot: 0.2, kode: 'A2' },
    { id: 'cat3', kategori_utama: 'B', sub_kategori: 'Dokumen', pertanyaan: 'Apakah dokumen lengkap?', tipe: 'check', bobot: 0.1, kode: 'B1' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    getCandidate.mockResolvedValue(mockCandidate);
    getCategories.mockResolvedValue(mockCategories);
    getAssessments.mockResolvedValue([]);
  });

  describe('Initial load', () => {
    it('renders loading state initially', () => {
      renderWithRouter(<AssessmentForm />);
      expect(screen.getByText(/Memuat form penilaian/i)).toBeInTheDocument();
    });

    it('renders candidate information after loading', async () => {
      renderWithRouter(<AssessmentForm />);
      
      await waitFor(() => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      });
    });
  });

  describe('Rating validation', () => {
    it('shows validation warning when not all questions are answered on save', async () => {
      renderWithRouter(<AssessmentForm />);
      
      await waitFor(() => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      });

      // Click save without answering any questions
      const saveButton = screen.getByText('Simpan Penilaian');
      fireEvent.click(saveButton);

      // Should show warning about incomplete assessment
      await waitFor(() => {
        expect(screen.getByText(/Belum semua pertanyaan dijawab/i)).toBeInTheDocument();
      });
    });

    it('shows warning for extreme ratings without comments', async () => {
      renderWithRouter(<AssessmentForm />);
      
      await waitFor(() => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      });

      // Click on "Sangat Kurang" (SK - extreme low rating)
      const skButton = screen.getByText('SK');
      fireEvent.click(skButton);

      // Should show warning about comment required for extreme rating
      await waitFor(() => {
        expect(screen.getByText(/Nilai ekstrem memerlukan komentar/i)).toBeInTheDocument();
      });
    });

    it('clears extreme rating warning when comment is added', async () => {
      renderWithRouter(<AssessmentForm />);
      
      await waitFor(() => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      });

      // Click on extreme rating
      const skButton = screen.getByText('SK');
      fireEvent.click(skButton);

      await waitFor(() => {
        expect(screen.getByText(/Nilai ekstrem memerlukan komentar/i)).toBeInTheDocument();
      });

      // Add comment
      const commentInput = screen.getByPlaceholderText(/Keterangan \/ catatan interviewer/i);
      fireEvent.change(commentInput, { target: { value: 'Kandidat kurang pengalaman' } });

      await waitFor(() => {
        expect(screen.queryByText(/Nilai ekstrem memerlukan komentar/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Progress tracking', () => {
    it('shows correct progress percentage', async () => {
      renderWithRouter(<AssessmentForm />);
      
      await waitFor(() => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      });

      // Initial progress should be 0%
      expect(screen.getByText(/0\/3 pertanyaan dijawab \(0%\)/i)).toBeInTheDocument();

      // Answer one question
      const ratingButton = screen.getByText('R'); // Rata-rata
      fireEvent.click(ratingButton);

      await waitFor(() => {
        expect(screen.getByText(/1\/3 pertanyaan dijawab \(33%\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Check type questions', () => {
    it('validates check type questions (Ada/Tidak)', async () => {
      renderWithRouter(<AssessmentForm />);
      
      await waitFor(() => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      });

      // Navigate to section B (which has check type question)
      // Use getAllByText and filter for the tab button
      const allBElements = screen.getAllByText('B');
      const sectionBTab = allBElements.find(el => el.tagName === 'BUTTON');
      fireEvent.click(sectionBTab);

      await waitFor(() => {
        expect(screen.getByText(/Apakah dokumen lengkap/i)).toBeInTheDocument();
      });

      // Click "Ada"
      const adaButton = screen.getByText('Ada');
      fireEvent.click(adaButton);

      // Should update the answer - check that progress updates
      await waitFor(() => {
        expect(screen.getByText(/1\/3 pertanyaan dijawab \(33%\)/i)).toBeInTheDocument();
      });
    });
  });
});

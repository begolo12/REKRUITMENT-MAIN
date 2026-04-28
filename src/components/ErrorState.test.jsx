import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  it('renders with default title', () => {
    render(<ErrorState error="Gagal memuat data" />);
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(
      <ErrorState 
        error="Gagal memuat data"
        title="Gagal Memuat Dashboard"
      />
    );
    expect(screen.getByText('Gagal Memuat Dashboard')).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', () => {
    const onRetry = vi.fn();
    render(
      <ErrorState 
        error="Gagal memuat data"
        onRetry={onRetry}
      />
    );
    fireEvent.click(screen.getByText('Coba Lagi'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('does not show retry button when onRetry not provided', () => {
    render(<ErrorState error="Gagal memuat data" />);
    expect(screen.queryByText('Coba Lagi')).not.toBeInTheDocument();
  });

  it('renders network variant with correct title', () => {
    render(
      <ErrorState 
        variant="network"
        error="Koneksi internet terputus"
      />
    );
    expect(screen.getByText('Koneksi Terputus')).toBeInTheDocument();
  });

  it('renders warning variant with correct title', () => {
    render(
      <ErrorState 
        variant="warning"
        error="Data tidak lengkap"
      />
    );
    expect(screen.getByText('Perhatian')).toBeInTheDocument();
  });

  it('renders server variant with correct title', () => {
    render(
      <ErrorState 
        variant="server"
        error="Server sedang maintenance"
      />
    );
    expect(screen.getByText('Server Error')).toBeInTheDocument();
  });

  it('renders info variant with correct title', () => {
    render(
      <ErrorState 
        variant="info"
        error="Informasi penting"
      />
    );
    expect(screen.getByText('Informasi')).toBeInTheDocument();
  });

  it('renders auth variant with correct title', () => {
    render(
      <ErrorState 
        variant="auth"
        error="Anda tidak memiliki akses"
      />
    );
    expect(screen.getByText('Akses Ditolak')).toBeInTheDocument();
  });

  it('does not show support button when showSupport is false', () => {
    render(
      <ErrorState 
        error="Gagal memuat data"
        showSupport={false}
      />
    );
    expect(screen.queryByText('Hubungi Support')).not.toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders with default title and description', () => {
    render(<EmptyState />);
    expect(screen.getByText('Tidak ada data')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<EmptyState title="Belum ada kandidat" />);
    expect(screen.getByText('Belum ada kandidat')).toBeInTheDocument();
  });

  it('calls onAction when action button clicked', () => {
    const onAction = vi.fn();
    render(
      <EmptyState 
        actionLabel="Tambah Kandidat"
        onAction={onAction}
      />
    );
    fireEvent.click(screen.getByText('Tambah Kandidat'));
    expect(onAction).toHaveBeenCalled();
  });

  it('renders with variant no-data', () => {
    render(<EmptyState variant="no-data" />);
    expect(screen.getByText('Tidak ada data')).toBeInTheDocument();
  });

  it('renders with variant no-results', () => {
    render(<EmptyState variant="no-results" />);
    expect(screen.getByText('Tidak ada hasil')).toBeInTheDocument();
  });

  it('renders with variant error', () => {
    render(<EmptyState variant="error" />);
    expect(screen.getByText('Terjadi kesalahan')).toBeInTheDocument();
  });

  it('renders with custom description', () => {
    render(<EmptyState description="Custom description text" />);
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });

  it('does not render action button when onAction is not provided', () => {
    render(<EmptyState actionLabel="Tambah" />);
    expect(screen.queryByText('Tambah')).not.toBeInTheDocument();
  });

  it('does not render action button when actionLabel is not provided', () => {
    const onAction = vi.fn();
    render(<EmptyState onAction={onAction} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

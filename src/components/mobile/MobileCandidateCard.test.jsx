import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MobileCandidateCard from './MobileCandidateCard';

describe('MobileCandidateCard', () => {
  const mockCandidate = {
    id: '1',
    nama: 'John Doe',
    divisi: 'IT',
    posisi: 'Developer',
    avg_score: 85,
    status: 'Lulus',
    penempatan: 'Jakarta',
    budget_salary: '5.000.000 - 7.000.000'
  };

  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('renders candidate data correctly', () => {
    renderWithRouter(<MobileCandidateCard candidate={mockCandidate} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    // Divisi and Posisi are combined with " · " in the component
    expect(screen.getByText(/IT/)).toBeInTheDocument();
    expect(screen.getByText(/Developer/)).toBeInTheDocument();
    expect(screen.getByText('85.0')).toBeInTheDocument();
    expect(screen.getByText('Lulus')).toBeInTheDocument();
  });

  it('displays correct status badge color for Lulus', () => {
    renderWithRouter(<MobileCandidateCard candidate={mockCandidate} />);
    
    const badge = screen.getByText('Lulus');
    expect(badge).toHaveClass('badge-success');
  });

  it('displays correct status badge color for Tidak Lulus', () => {
    const failedCandidate = { ...mockCandidate, status: 'Tidak Lulus' };
    renderWithRouter(<MobileCandidateCard candidate={failedCandidate} />);
    
    const badge = screen.getByText('Tidak Lulus');
    expect(badge).toHaveClass('badge-danger');
  });

  it('displays correct status badge color for Dalam Proses', () => {
    const pendingCandidate = { ...mockCandidate, status: 'Dalam Proses' };
    renderWithRouter(<MobileCandidateCard candidate={pendingCandidate} />);
    
    const badge = screen.getByText('Dalam Proses');
    expect(badge).toHaveClass('badge-warning');
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    renderWithRouter(<MobileCandidateCard candidate={mockCandidate} onClick={onClick} />);
    
    const card = screen.getByRole('article');
    fireEvent.click(card);
    
    expect(onClick).toHaveBeenCalledWith(mockCandidate);
  });

  it('expands to show detail when expand button clicked', () => {
    renderWithRouter(<MobileCandidateCard candidate={mockCandidate} expandable />);
    
    // Initially detail should be hidden
    expect(screen.queryByText('Jakarta')).not.toBeInTheDocument();
    
    // Click expand button
    const expandBtn = screen.getByLabelText('Expand details');
    fireEvent.click(expandBtn);
    
    // Detail should now be visible
    expect(screen.getByText('Jakarta')).toBeInTheDocument();
    expect(screen.getByText('5.000.000 - 7.000.000')).toBeInTheDocument();
  });

  it('has minimum touch target of 44px', () => {
    const { container } = renderWithRouter(<MobileCandidateCard candidate={mockCandidate} />);
    
    const card = container.querySelector('.mobile-candidate-card');
    expect(card).toHaveStyle({
      minHeight: expect.stringMatching(/(44px|48px|56px|64px)/)
    });
  });

  it('shows avatar with candidate initial', () => {
    renderWithRouter(<MobileCandidateCard candidate={mockCandidate} />);
    
    const avatar = screen.getByText('J');
    expect(avatar).toBeInTheDocument();
  });

  it('displays score with correct color for high score', () => {
    renderWithRouter(<MobileCandidateCard candidate={mockCandidate} />);
    
    const score = screen.getByText('85.0');
    expect(score).toHaveClass('score-high');
  });

  it('displays score with correct color for medium score', () => {
    const mediumCandidate = { ...mockCandidate, avg_score: 65 };
    renderWithRouter(<MobileCandidateCard candidate={mediumCandidate} />);
    
    const score = screen.getByText('65.0');
    expect(score).toHaveClass('score-medium');
  });

  it('displays score with correct color for low score', () => {
    const lowCandidate = { ...mockCandidate, avg_score: 55 };
    renderWithRouter(<MobileCandidateCard candidate={lowCandidate} />);
    
    const score = screen.getByText('55.0');
    expect(score).toHaveClass('score-low');
  });

  it('does not show expandable button when expandable is false', () => {
    renderWithRouter(<MobileCandidateCard candidate={mockCandidate} expandable={false} />);
    
    expect(screen.queryByLabelText('Expand details')).not.toBeInTheDocument();
  });

  it('shows action buttons when provided', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    
    renderWithRouter(
      <MobileCandidateCard 
        candidate={mockCandidate} 
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
    
    const editBtn = screen.getByLabelText('Edit kandidat');
    const deleteBtn = screen.getByLabelText('Hapus kandidat');
    
    expect(editBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();
    
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(mockCandidate);
    
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(mockCandidate);
  });
});

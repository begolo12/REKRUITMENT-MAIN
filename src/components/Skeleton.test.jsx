import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonDashboard, SkeletonCard, SkeletonTable, SkeletonLine, SkeletonList } from './Skeleton';

describe('Skeleton', () => {
  it('renders dashboard skeleton', () => {
    render(<SkeletonDashboard />);
    expect(screen.getByTestId('skeleton-dashboard')).toBeInTheDocument();
  });

  it('renders card skeleton', () => {
    render(<SkeletonCard />);
    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
  });

  it('renders table skeleton with correct number of rows', () => {
    render(<SkeletonTable rows={5} />);
    expect(screen.getAllByTestId('skeleton-row')).toHaveLength(5);
  });

  it('renders skeleton line', () => {
    render(<SkeletonLine />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders skeleton list', () => {
    render(<SkeletonList />);
    expect(screen.getByTestId('skeleton-table')).toBeInTheDocument();
  });

  it('renders table skeleton with custom columns', () => {
    render(<SkeletonTable rows={3} cols={4} />);
    const rows = screen.getAllByTestId('skeleton-row');
    expect(rows).toHaveLength(3);
  });
});

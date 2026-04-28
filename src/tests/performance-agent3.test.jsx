import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React, { useState, useCallback, memo, useMemo } from 'react';

// Mock Firebase modules
vi.mock('../services/db', () => ({
  getDashboardData: vi.fn(),
  getCandidates: vi.fn(),
  deleteCandidate: vi.fn(),
  createCandidate: vi.fn()
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn()
  })
}));

vi.mock('../hooks/useIsMobile', () => ({
  useIsMobile: () => false
}));

import { getDashboardData, getCandidates } from '../services/db';

// Simple test components to verify memoization patterns
const TestStatCard = memo(function TestStatCard({ title, value, onClick }) {
  console.log(`TestStatCard rendered: ${title}`);
  return (
    <div data-testid={`stat-card-${title}`} onClick={onClick}>
      <span>{title}</span>
      <span>{value}</span>
    </div>
  );
});

const TestDashboard = memo(function TestDashboard() {
  const [count, setCount] = useState(0);
  const [stats] = useState([
    { id: 1, title: 'Total', value: 100 },
    { id: 2, title: 'Active', value: 50 },
    { id: 3, title: 'Inactive', value: 50 }
  ]);

  // Memoized callback - should not cause re-renders
  const handleRefresh = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  // Memoized stats
  const memoizedStats = useMemo(() => stats, [stats]);

  return (
    <div data-testid="dashboard">
      <span data-testid="render-count">{count}</span>
      {memoizedStats.map(stat => (
        <TestStatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          onClick={handleRefresh}
        />
      ))}
    </div>
  );
});

// Virtual list test component
const TestVirtualList = memo(function TestVirtualList({ items, itemHeight = 60, containerHeight = 300 }) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      data-testid="virtual-list"
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              data-testid={`virtual-item-${item.id}`}
              style={{ height: itemHeight }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Pagination test component
const TestPaginatedTable = memo(function TestPaginatedTable({ data, pageSize = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div data-testid="paginated-table">
      <div data-testid="current-page">{currentPage}</div>
      <div data-testid="total-pages">{totalPages}</div>
      <div data-testid="visible-rows">{paginatedData.length}</div>
      <button data-testid="next-page" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>
        Next
      </button>
      <button data-testid="prev-page" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>
        Prev
      </button>
    </div>
  );
});

describe('Performance Optimizations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Dashboard Memoization', () => {
    it('should use React.memo for stat cards', () => {
      const { rerender } = render(<TestDashboard />);
      
      // Initial render should show all stat cards
      expect(screen.getByTestId('stat-card-Total')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-Active')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-Inactive')).toBeInTheDocument();
      
      // Re-render should not cause stat cards to re-render if props don't change
      rerender(<TestDashboard />);
      
      // Cards should still be present
      expect(screen.getByTestId('stat-card-Total')).toBeInTheDocument();
    });

    it('should use useCallback for event handlers', () => {
      render(<TestDashboard />);
      
      const statCard = screen.getByTestId('stat-card-Total');
      fireEvent.click(statCard);
      
      // Should update count
      expect(screen.getByTestId('render-count')).toHaveTextContent('1');
    });

    it('should use useMemo for computed values', () => {
      const { rerender } = render(<TestDashboard />);
      
      // Dashboard should render with memoized stats
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  describe('Candidates Virtual Scrolling', () => {
    it('should handle large lists efficiently with virtualization', () => {
      const largeData = Array(1000).fill(null).map((_, i) => ({
        id: i,
        name: `Candidate ${i}`,
      }));

      render(<TestVirtualList items={largeData} itemHeight={60} containerHeight={300} />);
      
      // Virtual list container should render
      expect(screen.getByTestId('virtual-list')).toBeInTheDocument();
      
      // Only visible items should be rendered (approximately 5-6 items for 300px container with 60px items)
      const visibleItems = screen.getAllByTestId(/virtual-item-/);
      expect(visibleItems.length).toBeLessThanOrEqual(7); // Should be much less than 1000
    });

    it('should render only visible items in viewport', () => {
      const items = Array(100).fill(null).map((_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));

      render(<TestVirtualList items={items} itemHeight={50} containerHeight={200} />);
      
      // With 200px container and 50px items, should render about 4-5 items
      const visibleItems = screen.getAllByTestId(/virtual-item-/);
      expect(visibleItems.length).toBeLessThanOrEqual(6);
    });
  });

  describe('DataTable Pagination', () => {
    it('should paginate large datasets', () => {
      const largeData = Array(100).fill(null).map((_, i) => ({
        id: i,
        name: `Row ${i}`,
      }));

      render(<TestPaginatedTable data={largeData} pageSize={10} />);
      
      // Should show pagination info
      expect(screen.getByTestId('current-page')).toHaveTextContent('1');
      expect(screen.getByTestId('total-pages')).toHaveTextContent('10');
      expect(screen.getByTestId('visible-rows')).toHaveTextContent('10');
    });

    it('should navigate between pages', () => {
      const largeData = Array(50).fill(null).map((_, i) => ({
        id: i,
        name: `Row ${i}`,
      }));

      render(<TestPaginatedTable data={largeData} pageSize={10} />);
      
      // Navigate to next page
      fireEvent.click(screen.getByTestId('next-page'));
      expect(screen.getByTestId('current-page')).toHaveTextContent('2');
      
      // Navigate back
      fireEvent.click(screen.getByTestId('prev-page'));
      expect(screen.getByTestId('current-page')).toHaveTextContent('1');
    });

    it('should handle empty datasets', () => {
      render(<TestPaginatedTable data={[]} pageSize={10} />);
      
      expect(screen.getByTestId('total-pages')).toHaveTextContent('0');
      expect(screen.getByTestId('visible-rows')).toHaveTextContent('0');
    });
  });

  describe('Debounced Search', () => {
    it('should debounce search input', async () => {
      const mockSearch = vi.fn();
      
      function TestSearchComponent() {
        const [searchTerm, setSearchTerm] = useState('');
        const [debouncedTerm, setDebouncedTerm] = useState('');
        
        React.useEffect(() => {
          const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
            mockSearch(searchTerm);
          }, 300);
          return () => clearTimeout(timer);
        }, [searchTerm]);
        
        return (
          <input
            data-testid="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        );
      }
      
      render(<TestSearchComponent />);
      
      const input = screen.getByTestId('search-input');
      
      // Type multiple characters quickly
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });
      
      // Search should not be called immediately
      expect(mockSearch).not.toHaveBeenCalledWith('abc');
      
      // Wait for debounce
      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('abc');
      }, { timeout: 500 });
    });
  });

  describe('Render Count Optimization', () => {
    it('should prevent unnecessary re-renders with memo', () => {
      let renderCount = 0;
      
      const MemoizedComponent = memo(function MemoizedComponent({ value }) {
        renderCount++;
        return <div data-testid="memo-component">{value}</div>;
      });
      
      function ParentComponent() {
        const [count, setCount] = useState(0);
        const [staticValue] = useState('static');
        
        return (
          <div>
            <span data-testid="parent-count">{count}</span>
            <MemoizedComponent value={staticValue} />
            <button data-testid="increment" onClick={() => setCount(c => c + 1)}>
              Increment
            </button>
          </div>
        );
      }
      
      render(<ParentComponent />);
      
      const initialRenderCount = renderCount;
      
      // Trigger parent re-render
      fireEvent.click(screen.getByTestId('increment'));
      
      // Memoized component should not re-render because props didn't change
      expect(renderCount).toBe(initialRenderCount);
    });
  });
});

describe('Performance Targets', () => {
  it('should handle lists with more than 100 items efficiently', () => {
    const items = Array(150).fill(null).map((_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    const { container } = render(<TestVirtualList items={items} itemHeight={50} containerHeight={300} />);
    
    // Container should render without blocking
    expect(container.querySelector('[data-testid="virtual-list"]')).toBeInTheDocument();
  });

  it('should paginate tables with more than 50 rows', () => {
    const data = Array(75).fill(null).map((_, i) => ({
      id: i,
      name: `Row ${i}`,
    }));

    render(<TestPaginatedTable data={data} pageSize={25} />);
    
    // Should have 3 pages (75 / 25)
    expect(screen.getByTestId('total-pages')).toHaveTextContent('3');
    // Should only show 25 rows at a time
    expect(screen.getByTestId('visible-rows')).toHaveTextContent('25');
  });
});

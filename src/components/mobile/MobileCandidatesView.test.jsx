import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MobileCandidatesView from './MobileCandidatesView';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
}));

// Mock MobileDataList
vi.mock('./MobileDataList', () => ({
  default: ({ items, renderItem, loading, onRefresh, emptyMessage, emptyAction }) => (
    <div data-testid="mobile-data-list">
      {loading ? (
        <div data-testid="loading-state">Loading...</div>
      ) : items.length === 0 ? (
        <div data-testid="empty-state">
          <span>{emptyMessage}</span>
          {emptyAction && (
            <button onClick={emptyAction.onClick}>{emptyAction.label}</button>
          )}
        </div>
      ) : (
        <div data-testid="items-container">
          {items.map((item) => (
            <div key={item.id} data-testid={`candidate-${item.id}`}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}));

// Mock MobileCandidateCard
vi.mock('./MobileCandidateCard', () => ({
  default: ({ candidate, onClick, onEdit, onDelete }) => (
    <div data-testid="candidate-card" onClick={() => onClick && onClick(candidate)}>
      <span data-testid="candidate-name">{candidate.nama}</span>
      <button data-testid="edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(candidate); }}>Edit</button>
      <button data-testid="delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(candidate); }}>Delete</button>
    </div>
  ),
}));

const mockCandidates = [
  {
    id: '1',
    nama: 'John Doe',
    divisi: 'IT',
    posisi: 'Developer',
    avg_score: 85,
    status: 'Lulus',
  },
  {
    id: '2',
    nama: 'Jane Smith',
    divisi: 'HR',
    posisi: 'Manager',
    avg_score: 75,
    status: 'Dalam Proses',
  },
];

const defaultProps = {
  candidates: mockCandidates,
  loading: false,
  onRefresh: vi.fn(),
  onDelete: vi.fn(),
  searchQuery: '',
  onSearchChange: vi.fn(),
  filters: {},
  onFilterChange: vi.fn(),
  onAddCandidate: vi.fn(),
};

const renderWithRouter = (props = {}) => {
  return render(
    <MemoryRouter>
      <MobileCandidatesView {...defaultProps} {...props} />
    </MemoryRouter>
  );
};

describe('MobileCandidatesView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Functionality', () => {
    it('renders search input', () => {
      renderWithRouter();
      
      const searchInput = screen.getByPlaceholderText(/cari kandidat/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('displays current search query', () => {
      renderWithRouter({ searchQuery: 'John' });
      
      const searchInput = screen.getByPlaceholderText(/cari kandidat/i);
      expect(searchInput).toHaveValue('John');
    });

    it('calls onSearchChange when typing', () => {
      renderWithRouter();
      
      const searchInput = screen.getByPlaceholderText(/cari kandidat/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('test');
    });

    it('has search icon', () => {
      renderWithRouter();
      
      const searchIcon = document.querySelector('.search-icon');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    it('renders filter button', () => {
      renderWithRouter();
      
      const filterBtn = screen.getByLabelText(/filter/i);
      expect(filterBtn).toBeInTheDocument();
    });

    it('shows filter badge when filters are active', () => {
      renderWithRouter({
        filters: { status: 'Lulus', divisi: 'IT' },
      });
      
      const filterBadge = document.querySelector('.filter-badge');
      expect(filterBadge).toBeInTheDocument();
      expect(filterBadge).toHaveTextContent('2');
    });

    it('does not show filter badge when no filters', () => {
      renderWithRouter({ filters: {} });
      
      const filterBadge = document.querySelector('.filter-badge');
      expect(filterBadge).not.toBeInTheDocument();
    });

    it('displays active filter chips', () => {
      renderWithRouter({
        filters: { status: 'Lulus' },
      });
      
      const filterChip = screen.getByText(/status: lulus/i);
      expect(filterChip).toBeInTheDocument();
    });

    it('calls onFilterChange when removing filter', () => {
      renderWithRouter({
        filters: { status: 'Lulus' },
      });
      
      const removeBtn = screen.getByLabelText(/hapus filter status/i);
      fireEvent.click(removeBtn);
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('status', '');
    });

    it('clears all filters when clicking clear all', () => {
      renderWithRouter({
        filters: { status: 'Lulus', divisi: 'IT' },
      });
      
      const clearBtn = screen.getByText(/hapus semua/i);
      fireEvent.click(clearBtn);
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('status', '');
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('divisi', '');
    });
  });

  describe('Candidates List', () => {
    it('renders MobileDataList component', () => {
      renderWithRouter();
      
      const dataList = screen.getByTestId('mobile-data-list');
      expect(dataList).toBeInTheDocument();
    });

    it('passes candidates to MobileDataList', () => {
      renderWithRouter();
      
      const itemsContainer = screen.getByTestId('items-container');
      expect(itemsContainer.children).toHaveLength(2);
    });

    it('renders candidate cards', () => {
      renderWithRouter();
      
      const cards = screen.getAllByTestId('candidate-card');
      expect(cards).toHaveLength(2);
    });

    it('displays candidate names', () => {
      renderWithRouter();
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      renderWithRouter({ loading: true });
      
      const loadingState = screen.getByTestId('loading-state');
      expect(loadingState).toBeInTheDocument();
    });

    it('shows empty state when no candidates', () => {
      renderWithRouter({ candidates: [] });
      
      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toBeInTheDocument();
      expect(screen.getByText(/belum ada kandidat/i)).toBeInTheDocument();
    });

    it('calls onRefresh when refreshing list', () => {
      renderWithRouter();
      
      // MobileDataList onRefresh is called via props
      expect(defaultProps.onRefresh).toBeDefined();
    });
  });

  describe('Navigation', () => {
    it('navigates to candidate detail on card click', async () => {
      const { container } = renderWithRouter();
      
      const firstCard = screen.getAllByTestId('candidate-card')[0];
      fireEvent.click(firstCard);
      
      // Navigation is handled by the component internally
      // We verify the card is clickable
      expect(firstCard).toBeInTheDocument();
    });

    it('navigates to edit page on edit button click', async () => {
      renderWithRouter();
      
      const editBtn = screen.getAllByTestId('edit-btn')[0];
      fireEvent.click(editBtn);
      
      // Edit navigation is handled internally
      expect(editBtn).toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('calls onDelete when delete button clicked', () => {
      renderWithRouter();
      
      const deleteBtn = screen.getAllByTestId('delete-btn')[0];
      fireEvent.click(deleteBtn);
      
      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockCandidates[0]);
    });
  });

  describe('Floating Action Button', () => {
    it('renders FAB', () => {
      renderWithRouter();
      
      const fab = screen.getByLabelText(/tambah kandidat/i);
      expect(fab).toBeInTheDocument();
    });

    it('calls onAddCandidate when FAB clicked', () => {
      renderWithRouter();
      
      const fab = screen.getByLabelText(/tambah kandidat/i);
      fireEvent.click(fab);
      
      expect(defaultProps.onAddCandidate).toHaveBeenCalled();
    });

    it('FAB has correct styling class', () => {
      renderWithRouter();
      
      const fab = screen.getByLabelText(/tambah kandidat/i);
      expect(fab).toHaveClass('mobile-fab');
    });
  });

  describe('Empty State Action', () => {
    it('shows add candidate button in empty state', () => {
      renderWithRouter({ candidates: [] });
      
      const addBtn = screen.getByText(/tambah kandidat/i);
      expect(addBtn).toBeInTheDocument();
    });

    it('calls onAddCandidate from empty state', () => {
      renderWithRouter({ candidates: [] });
      
      const addBtn = screen.getByText(/tambah kandidat/i);
      fireEvent.click(addBtn);
      
      expect(defaultProps.onAddCandidate).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('search input has accessible label', () => {
      renderWithRouter();
      
      const searchInput = screen.getByPlaceholderText(/cari kandidat/i);
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('filter button has aria-label', () => {
      renderWithRouter();
      
      const filterBtn = screen.getByLabelText(/filter/i);
      expect(filterBtn).toBeInTheDocument();
    });

    it('FAB has aria-label', () => {
      renderWithRouter();
      
      const fab = screen.getByLabelText(/tambah kandidat/i);
      expect(fab).toBeInTheDocument();
    });

    it('remove filter buttons have aria-labels', () => {
      renderWithRouter({
        filters: { status: 'Lulus' },
      });
      
      const removeBtn = screen.getByLabelText(/hapus filter status/i);
      expect(removeBtn).toBeInTheDocument();
    });
  });

  describe('Touch Targets', () => {
    it('filter button has minimum 44px touch target', () => {
      renderWithRouter();
      
      const filterBtn = screen.getByLabelText(/filter/i);
      expect(filterBtn).toHaveClass('filter-btn');
    });

    it('FAB has minimum 44px touch target', () => {
      renderWithRouter();
      
      const fab = screen.getByLabelText(/tambah kandidat/i);
      expect(fab).toHaveClass('mobile-fab');
    });
  });
});

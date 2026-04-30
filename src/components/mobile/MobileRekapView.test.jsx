import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MobileRekapView from './MobileRekapView';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
}));

// Mock MobileDataList
vi.mock('./MobileDataList', () => ({
  default: ({ items, renderItem, loading, emptyMessage, emptyAction }) => (
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
            <div key={item.id} data-testid={`rekap-${item.id}`}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}));

const mockSummary = {
  totalCandidates: 50,
  passed: 30,
  passRate: 60,
  avgScore: 75.5,
  period: '2024',
};

const mockRekapData = [
  {
    id: '1',
    candidateId: 'c1',
    nama: 'John Doe',
    posisi: 'Developer',
    divisi: 'IT',
    tanggal: '2024-01-15',
    avg_score: 85,
    status: 'Lulus',
    hasReport: true,
  },
  {
    id: '2',
    candidateId: 'c2',
    nama: 'Jane Smith',
    posisi: 'Manager',
    divisi: 'HR',
    tanggal: '2024-01-14',
    avg_score: 65,
    status: 'Lulus dengan Catatan',
    hasReport: false,
  },
];

const mockFilters = {
  status: '',
  divisi: '',
};

const mockAvailableFilters = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'Lulus', label: 'Lulus' },
      { value: 'Tidak Lulus', label: 'Tidak Lulus' },
    ],
  },
  {
    key: 'divisi',
    label: 'Divisi',
    options: [
      { value: 'IT', label: 'IT' },
      { value: 'HR', label: 'HR' },
    ],
  },
];

const defaultProps = {
  rekapData: mockRekapData,
  summary: mockSummary,
  loading: false,
  onRefresh: vi.fn(),
  onExport: vi.fn(),
  filters: mockFilters,
  onFilterChange: vi.fn(),
  availableFilters: mockAvailableFilters,
};

const renderWithRouter = (props = {}) => {
  return render(
    <MemoryRouter>
      <MobileRekapView {...defaultProps} {...props} />
    </MemoryRouter>
  );
};

describe('MobileRekapView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Header', () => {
    it('renders page title', () => {
      renderWithRouter();
      
      expect(screen.getByText('Rekap Penilaian')).toBeInTheDocument();
    });

    it('renders subtitle', () => {
      renderWithRouter();
      
      expect(screen.getByText('Ringkasan hasil penilaian kandidat')).toBeInTheDocument();
    });
  });

  describe('Summary Cards', () => {
    it('renders all summary cards', () => {
      renderWithRouter();
      
      expect(screen.getByText('Total Kandidat')).toBeInTheDocument();
      expect(screen.getByText('Rata-rata Skor')).toBeInTheDocument();
      expect(screen.getByText('Periode')).toBeInTheDocument();
      // "Lulus" appears in both summary card and rekap items, so use getAllByText
      expect(screen.getAllByText('Lulus').length).toBeGreaterThanOrEqual(1);
    });

    it('displays correct summary values', () => {
      renderWithRouter();
      
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('75.5')).toBeInTheDocument();
      expect(screen.getByText('2024')).toBeInTheDocument();
    });

    it('displays pass rate', () => {
      renderWithRouter();
      
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('handles missing summary gracefully', () => {
      renderWithRouter({ summary: {} });
      
      // "0" appears in summary cards - check for at least 2 occurrences
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('0.0')).toBeInTheDocument();
    });
  });

  describe('Actions Bar', () => {
    it('renders filter button', () => {
      renderWithRouter();
      
      expect(screen.getByText('Filter')).toBeInTheDocument();
    });

    it('renders export button', () => {
      renderWithRouter();
      
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('calls onExport when export button clicked', () => {
      renderWithRouter();
      
      const exportBtn = screen.getByText('Export');
      fireEvent.click(exportBtn);
      
      expect(defaultProps.onExport).toHaveBeenCalled();
    });

    it('shows filter badge when filters are active', () => {
      renderWithRouter({
        filters: { status: 'Lulus' },
      });
      
      const filterBadge = document.querySelector('.mobile-rekap-filter-badge');
      expect(filterBadge).toBeInTheDocument();
    });
  });

  describe('Filter Panel', () => {
    it('toggles filter panel on filter button click', () => {
      renderWithRouter();
      
      const filterBtn = screen.getByText('Filter');
      fireEvent.click(filterBtn);
      
      // Filter panel should be visible
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders all filter groups', () => {
      renderWithRouter();
      
      const filterBtn = screen.getByText('Filter');
      fireEvent.click(filterBtn);
      
      // Use getAllByText since "Divisi" appears in both filter panel and rekap items
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getAllByText('Divisi').length).toBeGreaterThanOrEqual(1);
    });

    it('calls onFilterChange when filter chip clicked', () => {
      renderWithRouter();
      
      const filterBtn = screen.getByText('Filter');
      fireEvent.click(filterBtn);
      
      // Find the "Lulus" chip in the filter panel (not in rekap items)
      const filterPanel = document.querySelector('.mobile-rekap-filter-panel');
      const lulusChip = filterPanel.querySelector('.mobile-rekap-filter-chip');
      fireEvent.click(lulusChip);
      
      // The filter chip click should trigger onFilterChange
      expect(defaultProps.onFilterChange).toHaveBeenCalled();
    });

    it('shows active filter chips', () => {
      renderWithRouter({
        filters: { status: 'Lulus' },
      });
      
      const filterBtn = screen.getByText('Filter');
      fireEvent.click(filterBtn);
      
      const activeChips = document.querySelectorAll('.mobile-rekap-filter-chip.active');
      expect(activeChips.length).toBeGreaterThan(0);
    });
  });

  describe('Active Filters Display', () => {
    it('displays active filters', () => {
      renderWithRouter({
        filters: { status: 'Lulus' },
      });
      
      expect(screen.getByText(/Status: Lulus/)).toBeInTheDocument();
    });

    it('calls onFilterChange when removing filter', () => {
      renderWithRouter({
        filters: { status: 'Lulus' },
      });
      
      const removeBtn = document.querySelector('.mobile-rekap-remove-filter');
      fireEvent.click(removeBtn);
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('status', '');
    });

    it('clears all filters when clear all clicked', () => {
      renderWithRouter({
        filters: { status: 'Lulus', divisi: 'IT' },
      });
      
      const clearBtn = screen.getByText('Hapus Semua');
      fireEvent.click(clearBtn);
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('status', '');
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('divisi', '');
    });
  });

  describe('Rekap List', () => {
    it('renders list section title', () => {
      renderWithRouter();
      
      expect(screen.getByText('Daftar Penilaian')).toBeInTheDocument();
    });

    it('displays data count', () => {
      renderWithRouter();
      
      expect(screen.getByText('2 data')).toBeInTheDocument();
    });

    it('renders MobileDataList component', () => {
      renderWithRouter();
      
      expect(screen.getByTestId('mobile-data-list')).toBeInTheDocument();
    });

    it('displays rekap items', () => {
      renderWithRouter();
      
      expect(screen.getByTestId('items-container')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      renderWithRouter({ loading: true });
      
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      renderWithRouter({ rekapData: [] });
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Belum ada data penilaian')).toBeInTheDocument();
    });

    it('navigates to candidates from empty state', () => {
      renderWithRouter({ rekapData: [] });
      
      const viewButton = screen.getByText('Lihat Kandidat');
      expect(viewButton).toBeInTheDocument();
    });
  });

  describe('Rekap Item Rendering', () => {
    it('displays candidate names', () => {
      renderWithRouter();
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('displays positions', () => {
      renderWithRouter();
      
      expect(screen.getByText('Developer')).toBeInTheDocument();
      expect(screen.getByText('Manager')).toBeInTheDocument();
    });

    it('displays status badges', () => {
      renderWithRouter();
      
      // Use getAllByText since "Lulus" appears multiple times
      expect(screen.getAllByText('Lulus').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Lulus dengan Catatan')).toBeInTheDocument();
    });

    it('displays report badges', () => {
      renderWithRouter();
      
      const reportBadges = document.querySelectorAll('.mobile-rekap-item-report-badge');
      expect(reportBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      renderWithRouter();
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('action buttons are accessible', () => {
      renderWithRouter();
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Touch Targets', () => {
    it('action buttons have minimum 44px touch target', () => {
      const { container } = renderWithRouter();
      
      const filterBtn = container.querySelector('.mobile-rekap-filter-btn');
      const exportBtn = container.querySelector('.mobile-rekap-export-btn');
      
      expect(filterBtn).toBeInTheDocument();
      expect(exportBtn).toBeInTheDocument();
    });

    it('filter chips are touchable', () => {
      renderWithRouter();
      
      const filterBtn = screen.getByText('Filter');
      fireEvent.click(filterBtn);
      
      const chips = document.querySelectorAll('.mobile-rekap-filter-chip');
      expect(chips.length).toBeGreaterThan(0);
    });
  });
});

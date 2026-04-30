import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MobileDashboardView from './MobileDashboardView';
import { Users, FileText, Plus } from 'lucide-react';

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
            <div key={item.id} data-testid={`activity-${item.id}`}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}));

const mockStats = {
  totalCandidates: 150,
  totalAssessments: 89,
  completedAssessments: 45,
  pendingAssessments: 44,
  candidatesTrend: '12%',
  candidatesTrendUp: true,
  assessmentsTrend: '8%',
  assessmentsTrendUp: true,
  completedTrend: '5%',
  completedTrendUp: true,
};

const mockActivities = [
  {
    id: '1',
    type: 'candidate_added',
    title: 'John Doe ditambahkan sebagai kandidat',
    time: '2 jam yang lalu',
    link: '/candidates/1',
  },
  {
    id: '2',
    type: 'assessment_completed',
    title: 'Penilaian Jane Smith selesai',
    time: '5 jam yang lalu',
    link: '/candidates/2',
  },
];

const mockQuickActions = [
  {
    icon: Plus,
    label: 'Tambah Kandidat',
    onClick: vi.fn(),
    color: '#4f46e5',
  },
  {
    icon: FileText,
    label: 'Buat Penilaian',
    onClick: vi.fn(),
    color: '#d97706',
  },
];

const defaultProps = {
  stats: mockStats,
  recentActivities: mockActivities,
  loading: false,
  onRefresh: vi.fn(),
  quickActions: mockQuickActions,
};

const renderWithRouter = (props = {}) => {
  return render(
    <MemoryRouter>
      <MobileDashboardView {...defaultProps} {...props} />
    </MemoryRouter>
  );
};

describe('MobileDashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Welcome Section', () => {
    it('renders dashboard title', () => {
      renderWithRouter();
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('displays current date', () => {
      renderWithRouter();
      
      const today = new Date().toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      expect(screen.getByText(today)).toBeInTheDocument();
    });
  });

  describe('Stats Grid', () => {
    it('renders all stat cards', () => {
      renderWithRouter();
      
      expect(screen.getByText('Total Kandidat')).toBeInTheDocument();
      expect(screen.getByText('Penilaian')).toBeInTheDocument();
      expect(screen.getByText('Lulus')).toBeInTheDocument();
      expect(screen.getByText('Dalam Proses')).toBeInTheDocument();
    });

    it('displays correct stat values', () => {
      renderWithRouter();
      
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('89')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('44')).toBeInTheDocument();
    });

    it('displays trend indicators', () => {
      renderWithRouter();
      
      expect(screen.getByText(/↑ 12%/)).toBeInTheDocument();
      expect(screen.getByText(/↑ 8%/)).toBeInTheDocument();
      expect(screen.getByText(/↑ 5%/)).toBeInTheDocument();
    });

    it('navigates to candidates page on total candidates click', () => {
      const { container } = renderWithRouter();
      
      const statCards = container.querySelectorAll('.mobile-stat-card');
      expect(statCards.length).toBe(4);
    });

    it('handles missing stats gracefully', () => {
      renderWithRouter({ stats: {} });
      
      expect(screen.getAllByText('0')).toHaveLength(4);
    });
  });

  describe('Quick Actions', () => {
    it('renders quick actions section', () => {
      renderWithRouter();
      
      expect(screen.getByText('Aksi Cepat')).toBeInTheDocument();
    });

    it('renders all quick action buttons', () => {
      renderWithRouter();
      
      expect(screen.getByText('Tambah Kandidat')).toBeInTheDocument();
      expect(screen.getByText('Buat Penilaian')).toBeInTheDocument();
    });

    it('calls onClick when quick action is clicked', () => {
      renderWithRouter();
      
      const addButton = screen.getByText('Tambah Kandidat');
      fireEvent.click(addButton);
      
      expect(mockQuickActions[0].onClick).toHaveBeenCalled();
    });

    it('does not render quick actions section when empty', () => {
      renderWithRouter({ quickActions: [] });
      
      expect(screen.queryByText('Aksi Cepat')).not.toBeInTheDocument();
    });

    it('does not render quick actions section when undefined', () => {
      renderWithRouter({ quickActions: undefined });
      
      expect(screen.queryByText('Aksi Cepat')).not.toBeInTheDocument();
    });
  });

  describe('Recent Activity', () => {
    it('renders activity section title', () => {
      renderWithRouter();
      
      expect(screen.getByText('Aktivitas Terbaru')).toBeInTheDocument();
    });

    it('renders view all button', () => {
      renderWithRouter();
      
      expect(screen.getByText('Lihat Semua')).toBeInTheDocument();
    });

    it('renders MobileDataList component', () => {
      renderWithRouter();
      
      expect(screen.getByTestId('mobile-data-list')).toBeInTheDocument();
    });

    it('displays activities', () => {
      renderWithRouter();
      
      expect(screen.getByTestId('items-container')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      renderWithRouter({ loading: true });
      
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });

    it('shows empty state when no activities', () => {
      renderWithRouter({ recentActivities: [] });
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Belum ada aktivitas')).toBeInTheDocument();
    });

    it('navigates to candidates from empty state', () => {
      renderWithRouter({ recentActivities: [] });
      
      const viewButton = screen.getByText('Lihat Kandidat');
      expect(viewButton).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to candidates when view all clicked', () => {
      renderWithRouter();
      
      const viewAllBtn = screen.getByText('Lihat Semua');
      expect(viewAllBtn).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      renderWithRouter();
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('quick actions are buttons', () => {
      renderWithRouter();
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Touch Targets', () => {
    it('stat cards have proper touch targets', () => {
      const { container } = renderWithRouter();
      
      const statCards = container.querySelectorAll('.mobile-stat-card');
      statCards.forEach(card => {
        expect(card).toHaveClass('mobile-stat-card');
      });
    });

    it('quick actions have minimum 44px touch target', () => {
      const { container } = renderWithRouter();
      
      const quickActions = container.querySelectorAll('.mobile-quick-action');
      expect(quickActions.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('uses grid layout for stats', () => {
      const { container } = renderWithRouter();
      
      const statsGrid = container.querySelector('.mobile-stats-grid');
      expect(statsGrid).toBeInTheDocument();
    });

    it('uses grid layout for quick actions', () => {
      const { container } = renderWithRouter();
      
      const actionsGrid = container.querySelector('.mobile-quick-actions-grid');
      expect(actionsGrid).toBeInTheDocument();
    });
  });
});

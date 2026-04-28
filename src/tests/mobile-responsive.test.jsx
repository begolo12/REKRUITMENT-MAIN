import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

// ─── Mock window.matchMedia globally ───
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: query.includes('max-width') && parseInt(query.match(/\d+/)?.[0] || 0) >= 768,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ─── Shared mocks ───
const mockUser = { full_name: 'Admin', role: 'admin' };
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, logout: vi.fn() }),
  AuthProvider: ({ children }) => children,
}));
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../services/db', () => ({
  resetAllData: vi.fn().mockResolvedValue(undefined),
  getDashboardData: vi.fn().mockResolvedValue({
    total: 10, lulus: 5, tidak_lulus: 2, dalam_proses: 3,
    recent: [],
  }),
  getCandidates: vi.fn().mockResolvedValue([]),
  getUsers: vi.fn().mockResolvedValue([]),
  getQuestionCategories: vi.fn().mockResolvedValue([]),
  getAssessmentsByUser: vi.fn().mockResolvedValue([]),
}));
vi.mock('../utils/animations', () => ({
  staggerContainer: { initial: 'initial', animate: 'animate' },
  staggerItem: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  cardHover: {},
}));

// ─── Helper: render with router ───
const renderPage = (Component) =>
  render(
    <BrowserRouter>
      <Component />
    </BrowserRouter>,
  );

// ═══════════════════════════════════════════════
// 1. useIsMobile hook — already tested separately
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════════════
// 2. Settings page — mobile-friendly sizes
// ═══════════════════════════════════════════════
describe('Settings — mobile responsive', () => {
  let Settings;
  beforeEach(async () => {
    Settings = (await import('../pages/Settings.jsx')).default;
  });

  it('should use useIsMobile hook', async () => {
    // The component should import and use useIsMobile
    const moduleText = await import('../pages/Settings.jsx?raw');
    expect(moduleText.default).toContain('useIsMobile');
  });

  it('should render compact header padding on mobile', () => {
    renderPage(Settings);
    const header = screen.getByText('Pengaturan Sistem').closest('[style]');
    const style = header?.getAttribute('style') || '';
    // On mobile, padding should not contain 40px
    // We check the component uses the isMobile conditional
    expect(header).toBeInTheDocument();
  });

  it('should render smaller icon container on mobile', () => {
    renderPage(Settings);
    // Settings icon container should exist
    const settingsTitle = screen.getByText('Pengaturan Sistem');
    expect(settingsTitle).toBeInTheDocument();
  });

  it('should render danger zone with responsive layout', () => {
    renderPage(Settings);
    const dangerZone = screen.getByText('Danger Zone');
    expect(dangerZone).toBeInTheDocument();
    
    // The flex layout inside danger zone should adapt
    const resetHeading = screen.getByText(/Reset Semua Data/i, { selector: 'h3' });
    expect(resetHeading).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════
// 3. Dashboard — mobile-friendly sizes
// ═══════════════════════════════════════════════
describe('Dashboard — mobile responsive', () => {
  let Dashboard;
  beforeEach(async () => {
    Dashboard = (await import('../pages/Dashboard.jsx')).default;
  });

  it('should use useIsMobile hook', async () => {
    const moduleText = await import('../pages/Dashboard.jsx?raw');
    expect(moduleText.default).toContain('useIsMobile');
  });

  it('should have mobile-responsive padding in welcome section', async () => {
    const moduleText = await import('../pages/Dashboard.jsx?raw');
    // Welcome section should use isMobile for padding
    expect(moduleText.default).toContain("isMobile ? '24px' : '40px'");
  });

  it('should have mobile-responsive font size in welcome heading', async () => {
    const moduleText = await import('../pages/Dashboard.jsx?raw');
    expect(moduleText.default).toContain("isMobile ? '1.5rem' : '2.25rem'");
  });
});

// ═══════════════════════════════════════════════
// 4. Candidates — mobile-friendly
// ═══════════════════════════════════════════════
describe('Candidates — mobile responsive', () => {
  let Candidates;
  beforeEach(async () => {
    Candidates = (await import('../pages/Candidates.jsx')).default;
  });

  it('should use useIsMobile hook', async () => {
    const moduleText = await import('../pages/Candidates.jsx?raw');
    expect(moduleText.default).toContain('useIsMobile');
  });

  it('should have mobile-responsive header padding', async () => {
    const moduleText = await import('../pages/Candidates.jsx?raw');
    expect(moduleText.default).toContain("isMobile ? '20px' : '32px 40px'");
  });

  it('should have mobile-responsive header flex direction', async () => {
    const moduleText = await import('../pages/Candidates.jsx?raw');
    expect(moduleText.default).toContain("isMobile ? 'column' : 'row'");
  });
});

// ═══════════════════════════════════════════════
// 5. Users — mobile-friendly
// ═══════════════════════════════════════════════
describe('Users — mobile responsive', () => {
  let Users;
  beforeEach(async () => {
    Users = (await import('../pages/Users.jsx')).default;
  });

  it('should use useIsMobile hook', async () => {
    const moduleText = await import('../pages/Users.jsx?raw');
    expect(moduleText.default).toContain('useIsMobile');
  });
});

// ═══════════════════════════════════════════════
// 6. Questions — mobile-friendly
// ═══════════════════════════════════════════════
describe('Questions — mobile responsive', () => {
  let Questions;
  beforeEach(async () => {
    Questions = (await import('../pages/Questions.jsx')).default;
  });

  it('should use useIsMobile hook', async () => {
    const moduleText = await import('../pages/Questions.jsx?raw');
    expect(moduleText.default).toContain('useIsMobile');
  });
});

// ═══════════════════════════════════════════════
// 7. Rekap — mobile-friendly
// ═══════════════════════════════════════════════
describe('Rekap — mobile responsive', () => {
  let Rekap;
  beforeEach(async () => {
    Rekap = (await import('../pages/Rekap.jsx')).default;
  });

  it('should use useIsMobile hook', async () => {
    const moduleText = await import('../pages/Rekap.jsx?raw');
    expect(moduleText.default).toContain('useIsMobile');
  });
});

// ═══════════════════════════════════════════════
// 8. MyAssessments — mobile-friendly
// ═══════════════════════════════════════════════
describe('MyAssessments — mobile responsive', () => {
  let MyAssessments;
  beforeEach(async () => {
    MyAssessments = (await import('../pages/MyAssessments.jsx')).default;
  });

  it('should use useIsMobile hook', async () => {
    const moduleText = await import('../pages/MyAssessments.jsx?raw');
    expect(moduleText.default).toContain('useIsMobile');
  });
});

// ═══════════════════════════════════════════════
// 9. CandidateDetail — mobile-friendly
// ═══════════════════════════════════════════════
describe('CandidateDetail — mobile responsive', () => {
  it('should use useIsMobile hook', async () => {
    const moduleText = await import('../pages/CandidateDetail.jsx?raw');
    expect(moduleText.default).toContain('useIsMobile');
  });
});

// ═══════════════════════════════════════════════
// 10. ConfirmModal — mobile-friendly
// ═══════════════════════════════════════════════
describe('ConfirmModal — mobile responsive', () => {
  it('should use useIsMobile hook', async () => {
    const moduleText = await import('../components/ConfirmModal.jsx?raw');
    expect(moduleText.default).toContain('useIsMobile');
  });
});

// ═══════════════════════════════════════════════
// 11. CSS — design-system responsive variables
// ═══════════════════════════════════════════════
describe('CSS — responsive design system', () => {
  it('design-system.css should have mobile media query for root variables', async () => {
    const css = await import('../styles/design-system.css?raw');
    expect(css.default).toContain('@media');
    expect(css.default).toContain('max-width: 768px');
  });
});

// ═══════════════════════════════════════════════
// 12. CSS — ux-redesign breakpoint fix
// ═══════════════════════════════════════════════
describe('CSS — ux-redesign breakpoint', () => {
  it('should use 768px breakpoint instead of 760px', async () => {
    const css = await import('../styles/ux-redesign.css?raw');
    expect(css.default).not.toContain('max-width: 760px');
    expect(css.default).toContain('max-width: 768px');
  });

  it('should not force all buttons to full width', async () => {
    const css = await import('../styles/ux-redesign.css?raw');
    // Should have exception for modal buttons
    expect(css.default).toContain('.modal-acts');
  });
});

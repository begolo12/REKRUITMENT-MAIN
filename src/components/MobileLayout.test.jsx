import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MobileLayout from './MobileLayout';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      role: 'admin',
      full_name: 'Test User'
    },
    logout: vi.fn()
  })
}));

describe('MobileLayout Component', () => {
  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should render children content', () => {
    renderWithRouter(
      <MobileLayout>
        <div data-testid="test-content">Test Content</div>
      </MobileLayout>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should have mobile-layout class', () => {
    const { container } = renderWithRouter(
      <MobileLayout>
        <div>Content</div>
      </MobileLayout>
    );
    
    const layout = container.querySelector('.mobile-layout');
    expect(layout).toBeInTheDocument();
  });

  it('should have proper padding for bottom navigation', () => {
    const { container } = renderWithRouter(
      <MobileLayout>
        <div>Content</div>
      </MobileLayout>
    );
    
    const content = container.querySelector('.mobile-layout-content');
    expect(content).toHaveStyle({
      paddingBottom: expect.any(String)
    });
  });

  it('should include MobileHeader component', () => {
    const { container } = renderWithRouter(
      <MobileLayout>
        <div>Content</div>
      </MobileLayout>
    );
    
    const header = container.querySelector('.mobile-header');
    expect(header).toBeInTheDocument();
  });

  it('should include BottomNav component', () => {
    const { container } = renderWithRouter(
      <MobileLayout>
        <div>Content</div>
      </MobileLayout>
    );
    
    const bottomNav = container.querySelector('.bottom-nav');
    expect(bottomNav).toBeInTheDocument();
  });

  it('should handle keyboard appearance gracefully', () => {
    const { container } = renderWithRouter(
      <MobileLayout>
        <input type="text" placeholder="Test input" />
      </MobileLayout>
    );
    
    const layout = container.querySelector('.mobile-layout');
    expect(layout).toHaveStyle({
      minHeight: '100vh'
    });
  });

  it('should have safe area support', () => {
    const { container } = renderWithRouter(
      <MobileLayout>
        <div>Content</div>
      </MobileLayout>
    );
    
    const header = container.querySelector('.mobile-header');
    expect(header).toHaveClass('safe-area-top');
  });

  it('should not show sidebar', () => {
    const { container } = renderWithRouter(
      <MobileLayout>
        <div>Content</div>
      </MobileLayout>
    );
    
    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).not.toBeInTheDocument();
  });

  it('should render user info in header', () => {
    renderWithRouter(
      <MobileLayout>
        <div>Content</div>
      </MobileLayout>
    );
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});

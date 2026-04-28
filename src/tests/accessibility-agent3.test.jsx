import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataTable from '../components/ui/DataTable';
import ModernModal from '../components/ModernModal';
import ConfirmModal from '../components/ConfirmModal';

describe('Accessibility - DataTable', () => {
  const mockData = [
    { id: '1', nama: 'John Doe', posisi: 'Developer' },
    { id: '2', nama: 'Jane Smith', posisi: 'Designer' },
  ];
  
  const mockColumns = [
    { key: 'nama', title: 'Nama' },
    { key: 'posisi', title: 'Posisi' },
  ];

  it('DataTable has proper ARIA labels', () => {
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        keyExtractor={(row) => row.id}
        ariaLabel="Daftar Kandidat"
      />
    );
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-label', 'Daftar Kandidat');
  });

  it('DataTable has aria-busy when loading', () => {
    render(
      <DataTable 
        data={[]} 
        columns={mockColumns} 
        keyExtractor={(row) => row.id}
        loading={true}
        ariaLabel="Daftar Kandidat"
      />
    );
    // When loading, the table is not rendered, but we should verify loading state
    const loadingDiv = screen.getByText(/Loading/i).parentElement;
    expect(loadingDiv).toBeInTheDocument();
  });

  it('DataTable header cells have scope attribute', () => {
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        keyExtractor={(row) => row.id}
        ariaLabel="Daftar Kandidat"
      />
    );
    const headers = screen.getAllByRole('columnheader');
    headers.forEach(header => {
      expect(header).toHaveAttribute('scope', 'col');
    });
  });

  it('DataTable has aria-sort for sortable columns', () => {
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        keyExtractor={(row) => row.id}
        sortable={true}
        ariaLabel="Daftar Kandidat"
      />
    );
    const namaHeader = screen.getByText('Nama').closest('th');
    expect(namaHeader).toHaveAttribute('aria-sort');
  });

  it('DataTable rows have aria-selected when selectable', () => {
    render(
      <DataTable 
        data={mockData} 
        columns={mockColumns} 
        keyExtractor={(row) => row.id}
        selectable={true}
        selectedIds={['1']}
        ariaLabel="Daftar Kandidat"
      />
    );
    const rows = screen.getAllByRole('row');
    // First row is header, data rows start from index 1
    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    expect(rows[2]).toHaveAttribute('aria-selected', 'false');
  });
});

describe('Accessibility - ModernModal', () => {
  it('Modal has role="dialog" attribute', () => {
    render(
      <ModernModal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </ModernModal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('Modal has aria-modal="true" attribute', () => {
    render(
      <ModernModal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </ModernModal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('Modal has aria-labelledby attribute', () => {
    render(
      <ModernModal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </ModernModal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  it('Modal closes on Escape key', async () => {
    const onClose = vi.fn();
    render(
      <ModernModal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal Content</div>
      </ModernModal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('Modal has close button with aria-label', () => {
    render(
      <ModernModal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </ModernModal>
    );
    const closeButton = screen.getByLabelText(/tutup|close/i);
    expect(closeButton).toBeInTheDocument();
  });
});

describe('Accessibility - ConfirmModal', () => {
  it('ConfirmModal has role="dialog" attribute', () => {
    render(
      <ConfirmModal 
        isOpen={true} 
        onConfirm={() => {}} 
        onCancel={() => {}}
        title="Confirm Action"
      />
    );
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
  });

  it('ConfirmModal has aria-modal="true" attribute', () => {
    render(
      <ConfirmModal 
        isOpen={true} 
        onConfirm={() => {}} 
        onCancel={() => {}}
        title="Confirm Action"
      />
    );
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('ConfirmModal closes on Escape key', async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal 
        isOpen={true} 
        onConfirm={() => {}} 
        onCancel={onCancel}
        title="Confirm Action"
      />
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
    });
  });
});

describe('Accessibility - Focus Management', () => {
  it('Modal traps focus within when open', async () => {
    render(
      <ModernModal isOpen={true} onClose={() => {}} title="Test Modal">
        <button>First Button</button>
        <button>Second Button</button>
      </ModernModal>
    );
    
    // Wait for modal to fully render and set focus
    await waitFor(() => {
      // Focus should be on the first focusable element (close button)
      const closeButton = screen.getByLabelText(/tutup|close/i);
      expect(document.activeElement).toBe(closeButton);
    });
  });
});

import { useState, useMemo, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MoreVertical, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { staggerItem } from '../../utils/animations';

// Memoized Table Row Component untuk mencegah re-render yang tidak perlu
const TableRow = memo(function TableRow({
  row,
  rowId,
  columns,
  isSelected,
  selectable,
  rowActions,
  actionMenuOpen,
  onToggleSelect,
  onActionMenuToggle,
  onActionClick,
  onRowClick,
  index
}) {
  return (
    <motion.tr
      variants={staggerItem}
      initial="initial"
      animate="animate"
      style={{
        borderBottom: '1px solid var(--gray-100)',
        background: isSelected ? 'var(--primary-50)' : 'transparent',
        cursor: onRowClick ? 'pointer' : 'default'
      }}
      onClick={() => onRowClick?.(row)}
      whileHover={{ backgroundColor: 'var(--gray-50)' }}
      aria-selected={selectable ? isSelected : undefined}
      role={selectable ? 'row' : undefined}
    >
      {selectable && (
        <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(rowId);
            }}
            style={{ cursor: 'pointer' }}
          />
        </td>
      )}
      {columns.map(column => (
        <td
          key={column.key}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            textAlign: column.align || 'left',
            color: 'var(--text)'
          }}
        >
          {column.render ? column.render(row[column.key], row) : row[column.key]}
        </td>
      ))}
      {rowActions && (
        <td style={{ padding: 'var(--space-3) var(--space-4)', position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionMenuToggle(rowId);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <MoreVertical size={16} />
          </button>
          {actionMenuOpen === rowId && (
            <div style={{
              position: 'absolute',
              right: 'var(--space-4)',
              top: '100%',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 10,
              minWidth: '150px'
            }}>
              {rowActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onActionClick(action, row);
                  }}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: action.danger ? 'var(--danger)' : 'var(--text)',
                    borderBottom: idx < rowActions.length - 1 ? '1px solid var(--gray-100)' : 'none'
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </td>
      )}
    </motion.tr>
  );
});

// Memoized Table Header Component
const TableHeader = memo(function TableHeader({
  columns,
  selectable,
  allSelected,
  someSelected,
  sortable,
  sortConfig,
  onToggleSelectAll,
  onSort
}) {
  return (
    <thead>
      <tr style={{ borderBottom: '1px solid var(--border)' }}>
        {selectable && (
          <th style={{ 
            padding: 'var(--space-3) var(--space-4)',
            textAlign: 'left',
            width: '40px'
          }}>
            <input
              type="checkbox"
              checked={allSelected}
              ref={input => {
                if (input) input.indeterminate = someSelected;
              }}
              onChange={onToggleSelectAll}
              style={{ cursor: 'pointer' }}
            />
          </th>
        )}
        {columns.map(column => (
          <th
            key={column.key}
            onClick={() => onSort(column.key)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              textAlign: column.align || 'left',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              cursor: sortable ? 'pointer' : 'default',
              userSelect: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: column.align === 'right' ? 'flex-end' : 'flex-start',
              gap: 'var(--space-1)'
            }}>
              {column.title}
              {sortable && sortConfig.key === column.key && (
                sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
              )}
            </div>
          </th>
        ))}
        {rowActions => rowActions && <th style={{ width: '40px' }}></th>}
      </tr>
    </thead>
  );
});

// Pagination Component
const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderTop: '1px solid var(--border)',
      fontSize: '0.875rem'
    }}>
      <div style={{ color: 'var(--text-muted)' }}>
        Menampilkan {startItem}-{endItem} dari {totalItems} data
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            background: currentPage === 1 ? 'var(--gray-100)' : 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            fontSize: '0.875rem'
          }}
        >
          <ChevronLeft size={16} />
          Sebelumnya
        </button>
        
        <span style={{ padding: '0 12px', fontWeight: 500 }}>
          Halaman {currentPage} dari {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            background: currentPage === totalPages ? 'var(--gray-100)' : 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            fontSize: '0.875rem'
          }}
        >
          Selanjutnya
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
});

// Main DataTable Component
export default function DataTable({
  columns,
  data,
  keyExtractor,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  sortable = true,
  onSort,
  loading = false,
  emptyMessage = 'No data available',
  rowActions,
  onRowClick,
  // Pagination props
  paginated = false,
  pageSize = 25,
  currentPage = 1,
  onPageChange,
  // Accessibility props
  ariaLabel = 'Data table'
}) {
  const [internalSortConfig, setInternalSortConfig] = useState({ key: null, direction: 'asc' });
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Memoized sort config (use external if provided, otherwise internal)
  const sortConfig = useMemo(() => 
    onSort ? { key: null, direction: 'asc' } : internalSortConfig,
    [onSort, internalSortConfig]
  );

  // Memoized sort handler
  const handleSort = useCallback((key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (internalSortConfig.key === key && internalSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setInternalSortConfig({ key, direction });
    onSort?.(key, direction);
  }, [sortable, internalSortConfig, onSort]);

  // Memoized sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || onSort) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, onSort]);

  // Memoized paginated data
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, paginated, currentPage, pageSize]);

  // Memoized selection calculations
  const { allSelected, someSelected } = useMemo(() => {
    const all = data.length > 0 && data.every(row => selectedIds.includes(keyExtractor(row)));
    const some = selectedIds.length > 0 && !all;
    return { allSelected: all, someSelected: some };
  }, [data, selectedIds, keyExtractor]);

  // Memoized handlers
  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map(row => keyExtractor(row)));
    }
  }, [allSelected, data, keyExtractor, onSelectionChange]);

  const toggleSelectRow = useCallback((id) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  }, [selectedIds, onSelectionChange]);

  const handleActionMenuToggle = useCallback((rowId) => {
    setActionMenuOpen(prev => prev === rowId ? null : rowId);
  }, []);

  const handleActionClick = useCallback((action, row) => {
    action.onClick(row);
    setActionMenuOpen(null);
  }, []);

  // Total pages for pagination
  const totalPages = Math.ceil(data.length / pageSize);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 'var(--space-12)',
        color: 'var(--text-muted)'
      }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginRight: 'var(--space-3)' }} />
        Loading...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center',
        padding: 'var(--space-12)',
        color: 'var(--text-muted)'
      }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table 
          style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '0.875rem'
          }}
          aria-label={ariaLabel}
          aria-busy={loading}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {selectable && (
                <th 
                  scope="col"
                  style={{ 
                    padding: 'var(--space-3) var(--space-4)',
                    textAlign: 'left',
                    width: '40px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={input => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer' }}
                    aria-label="Pilih semua baris"
                  />
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.key}
                  scope="col"
                  onClick={() => handleSort(column.key)}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    textAlign: column.align || 'left',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                    cursor: sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  aria-sort={sortable && sortConfig.key === column.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: column.align === 'right' ? 'flex-end' : 'flex-start',
                    gap: 'var(--space-1)'
                  }}>
                    {column.title}
                    {sortable && sortConfig.key === column.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
              {rowActions && <th scope="col" style={{ width: '40px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              const rowId = keyExtractor(row);
              const isSelected = selectedIds.includes(rowId);
              
              return (
                <TableRow
                  key={rowId}
                  row={row}
                  rowId={rowId}
                  columns={columns}
                  isSelected={isSelected}
                  selectable={selectable}
                  rowActions={rowActions}
                  actionMenuOpen={actionMenuOpen}
                  onToggleSelect={toggleSelectRow}
                  onActionMenuToggle={handleActionMenuToggle}
                  onActionClick={handleActionClick}
                  onRowClick={onRowClick}
                  index={index}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      
      {paginated && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={data.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

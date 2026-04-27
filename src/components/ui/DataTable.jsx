import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MoreVertical, Loader2 } from 'lucide-react';
import { staggerItem } from '../../utils/animations';

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
  onRowClick
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

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

  const allSelected = data.length > 0 && data.every(row => selectedIds.includes(keyExtractor(row)));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map(row => keyExtractor(row)));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

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
    <div style={{ overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        fontSize: '0.875rem'
      }}>
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
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
            )}
            {columns.map(column => (
              <th
                key={column.key}
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
            {rowActions && <th style={{ width: '40px' }}></th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const rowId = keyExtractor(row);
            const isSelected = selectedIds.includes(rowId);
            
            return (
              <motion.tr
                key={rowId}
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
              >
                {selectable && (
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectRow(rowId);
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
                        setActionMenuOpen(actionMenuOpen === rowId ? null : rowId);
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
                              action.onClick(row);
                              setActionMenuOpen(null);
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
          })}
        </tbody>
      </table>
    </div>
  );
}

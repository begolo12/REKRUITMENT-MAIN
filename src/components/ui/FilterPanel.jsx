import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { slideInRight } from '../../utils/animations';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  filterDefinitions = [],
  presets = [],
  onSavePreset,
  onLoadPreset,
  onDeletePreset
}) {
  const [expandedSections, setExpandedSections] = useState({});
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  const isMobile = useIsMobile();

  const toggleSection = (key) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== '' && v !== null && v !== undefined && 
    !(Array.isArray(v) && v.length === 0)
  ).length;

  const renderFilterInput = (filter) => {
    const { key, type, label, options, placeholder } = filter;
    const value = filters[key] || '';

    switch (type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onFilterChange(key, e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-2) var(--space-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onFilterChange(key, e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-2) var(--space-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              background: 'var(--card)',
              cursor: 'pointer'
            }}
          >
            <option value="">All</option>
            {options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {options?.map(opt => (
              <label key={opt.value} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-2)',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt.value)}
                  onChange={(e) => {
                    const current = value || [];
                    if (e.target.checked) {
                      onFilterChange(key, [...current, opt.value]);
                    } else {
                      onFilterChange(key, current.filter(v => v !== opt.value));
                    }
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        );

      case 'dateRange':
        return (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              type="date"
              value={value?.start || ''}
              onChange={(e) => onFilterChange(key, { ...value, start: e.target.value })}
              style={{
                flex: 1,
                padding: 'var(--space-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem'
              }}
            />
            <span style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              value={value?.end || ''}
              onChange={(e) => onFilterChange(key, { ...value, end: e.target.value })}
              style={{
                flex: 1,
                padding: 'var(--space-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem'
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 998
            }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            variants={slideInRight}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: isMobile ? '100%' : '360px',
              height: '100vh',
              background: 'var(--card)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-4) var(--space-6)',
              borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Filter size={20} />
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Filters</h3>
                {activeFiltersCount > 0 && (
                  <span style={{
                    background: 'var(--primary-500)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--space-1)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Presets */}
            {presets.length > 0 && (
              <div style={{
                padding: 'var(--space-4) var(--space-6)',
                borderBottom: '1px solid var(--border)',
                background: 'var(--gray-50)'
              }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: 'var(--space-2)'
                }}>
                  Saved Presets
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {presets.map(preset => (
                    <div
                      key={preset.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-1)',
                        padding: 'var(--space-1) var(--space-2)',
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem'
                      }}
                    >
                      <button
                        onClick={() => onLoadPreset(preset)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 'inherit'
                        }}
                      >
                        {preset.name}
                      </button>
                      <button
                        onClick={() => onDeletePreset(preset.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          color: 'var(--danger)'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Sections */}
            <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-4)' }}>
              {filterDefinitions.map(section => (
                <div key={section.key} style={{ marginBottom: 'var(--space-4)' }}>
                  <button
                    onClick={() => toggleSection(section.key)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3) 0',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text)'
                    }}
                  >
                    {section.label}
                    {expandedSections[section.key] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {expandedSections[section.key] && (
                    <div style={{ padding: 'var(--space-2) 0' }}>
                      {renderFilterInput(section)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: 'var(--space-4) var(--space-6)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 'var(--space-3)'
            }}>
              <button
                onClick={onClearFilters}
                style={{
                  flex: 1,
                  padding: 'var(--space-3)',
                  background: 'var(--gray-100)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Clear All
              </button>
              <button
                onClick={() => setShowSavePreset(true)}
                style={{
                  flex: 1,
                  padding: 'var(--space-3)',
                  background: 'var(--primary-500)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Save Preset
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

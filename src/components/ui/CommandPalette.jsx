import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home, Users, ClipboardList, BarChart3, Briefcase, HelpCircle, Plus, FileText, LogOut, User } from 'lucide-react';
import { modalOverlay, modalContent } from '../../utils/animations';

const commands = [
  {
    category: 'Navigation',
    items: [
      { id: 'nav-dashboard', label: 'Go to Dashboard', icon: Home, shortcut: 'G D', path: '/' },
      { id: 'nav-candidates', label: 'Go to Candidates', icon: Users, shortcut: 'G C', path: '/candidates' },
      { id: 'nav-assessments', label: 'Go to My Assessments', icon: ClipboardList, shortcut: 'G A', path: '/my-assessments' },
      { id: 'nav-rekap', label: 'Go to Rekap Nilai', icon: BarChart3, shortcut: 'G R', path: '/rekap' },
      { id: 'nav-users', label: 'Go to Kelola User', icon: Briefcase, shortcut: 'G U', path: '/users' },
      { id: 'nav-questions', label: 'Go to Kelola Soal', icon: HelpCircle, shortcut: 'G Q', path: '/questions' },
    ]
  },
  {
    category: 'Actions',
    items: [
      { id: 'action-add-candidate', label: 'Add New Candidate', icon: Plus, shortcut: 'N C', action: 'addCandidate' },
      { id: 'action-export', label: 'Export Report', icon: FileText, shortcut: 'E R', action: 'export' },
      { id: 'action-logout', label: 'Logout', icon: LogOut, shortcut: 'L O', action: 'logout' },
    ]
  }
];

export default function CommandPalette({ isOpen, onClose, onNavigate, onAction }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    
    const query = search.toLowerCase();
    return commands.map(category => ({
      ...category,
      items: category.items.filter(item => 
        item.label.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      )
    })).filter(category => category.items.length > 0);
  }, [search]);

  const flatCommands = useMemo(() => {
    return filteredCommands.flatMap(cat => cat.items);
  }, [filteredCommands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const executeCommand = useCallback((command) => {
    if (command.path) {
      onNavigate(command.path);
    } else if (command.action) {
      onAction(command.action);
    }
    onClose();
    setSearch('');
  }, [onNavigate, onAction, onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % flatCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + flatCommands.length) % flatCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (flatCommands[selectedIndex]) {
            executeCommand(flatCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatCommands, selectedIndex, onClose, executeCommand]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="command-palette-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '120px',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
          variants={modalOverlay}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="command-palette"
            style={{
              width: '100%',
              maxWidth: '640px',
              background: 'var(--card)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden'
            }}
            variants={modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'var(--space-4) var(--space-6)',
              borderBottom: '1px solid var(--border)',
              gap: 'var(--space-3)'
            }}>
              <Search size={20} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search commands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '1rem',
                  background: 'transparent',
                  color: 'var(--text)'
                }}
                autoFocus
              />
              <kbd style={{
                padding: 'var(--space-1) var(--space-2)',
                background: 'var(--gray-100)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontFamily: 'monospace'
              }}>
                ESC
              </kbd>
            </div>

            {/* Commands List */}
            <div style={{
              maxHeight: '400px',
              overflow: 'auto',
              padding: 'var(--space-2)'
            }}>
              {filteredCommands.map((category, catIndex) => (
                <div key={category.category}>
                  <div style={{
                    padding: 'var(--space-2) var(--space-4)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {category.category}
                  </div>
                  {category.items.map((command, cmdIndex) => {
                    const globalIndex = flatCommands.findIndex(c => c.id === command.id);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <button
                        key={command.id}
                        onClick={() => executeCommand(command)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-3) var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          background: isSelected ? 'var(--primary-100)' : 'transparent',
                          color: isSelected ? 'var(--primary-700)' : 'var(--text)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <command.icon size={18} />
                        <span style={{ flex: 1 }}>{command.label}</span>
                        {command.shortcut && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {command.shortcut.split(' ').map((key, i) => (
                              <kbd key={i} style={{
                                padding: '2px 6px',
                                background: isSelected ? 'var(--primary-200)' : 'var(--gray-100)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.7rem',
                                fontFamily: 'monospace'
                              }}>
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
              
              {flatCommands.length === 0 && (
                <div style={{
                  padding: 'var(--space-8)',
                  textAlign: 'center',
                  color: 'var(--text-muted)'
                }}>
                  No commands found
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              borderTop: '1px solid var(--border)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <kbd style={{
                  padding: '2px 6px',
                  background: 'var(--gray-100)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'monospace'
                }}>↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <kbd style={{
                  padding: '2px 6px',
                  background: 'var(--gray-100)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'monospace'
                }}>↵</kbd>
                <span>Select</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

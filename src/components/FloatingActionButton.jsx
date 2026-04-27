import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

export default function FloatingActionButton({ actions = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fab-container">
      <AnimatePresence>
        {isOpen && (
          <div className="fab-actions">
            {actions.map((action, index) => (
              <motion.button
                key={index}
                className="fab-action"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 400
                }}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                style={{ backgroundColor: action.color || '#6366f1' }}
              >
                <span className="fab-label">{action.label}</span>
                <span className="fab-icon">{action.icon}</span>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>
      
      <motion.button
        className="fab-main"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Plus size={24} />
      </motion.button>
    </div>
  );
}

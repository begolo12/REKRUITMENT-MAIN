import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Daniswara Recruitment',
    description: 'Let us show you around the system. This will only take a minute.',
    target: null
  },
  {
    id: 'sidebar',
    title: 'Navigation Menu',
    description: 'Access all features from the sidebar. You can collapse it for more space.',
    target: '.sidebar'
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'Get a quick overview of your recruitment activities and statistics.',
    target: '.dash'
  },
  {
    id: 'complete',
    title: 'You are All Set!',
    description: 'You can always restart this tour from your profile settings.',
    target: null
  }
];

export default function OnboardingTour({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete?.();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={handleSkip}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            width: '420px',
            background: 'var(--card)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 9999,
            padding: 'var(--space-8)',
            textAlign: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-6)',
            justifyContent: 'center'
          }}>
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: '32px',
                  height: '4px',
                  background: idx <= currentStep ? 'var(--primary-500)' : 'var(--gray-200)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>

          {/* Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-6)',
            color: 'var(--primary-600)'
          }}>
            {currentStep === tourSteps.length - 1 ? <Check size={32} /> : <span style={{ fontSize: '1.5rem' }}>{currentStep + 1}</span>}
          </div>

          {/* Content */}
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: 'var(--space-3)',
            color: 'var(--text)'
          }}>
            {step.title}
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-8)',
            lineHeight: 1.6
          }}>
            {step.description}
          </p>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'center'
          }}>
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'var(--gray-100)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              style={{
                padding: 'var(--space-3) var(--space-6)',
                background: 'var(--primary-500)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
            >
              {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep < tourSteps.length - 1 && <ChevronRight size={16} />}
            </button>
          </div>

          {/* Skip */}
          {currentStep < tourSteps.length - 1 && (
            <button
              onClick={handleSkip}
              style={{
                marginTop: 'var(--space-4)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--text-muted)'
              }}
            >
              Skip tour
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

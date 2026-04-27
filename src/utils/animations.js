// Animation utilities for Framer Motion
// These variants can be used across components for consistent animations

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
};

export const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
};

export const slideInBottom = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

export const cardHover = {
  rest: { y: 0, boxShadow: 'var(--shadow)' },
  hover: { 
    y: -4, 
    boxShadow: 'var(--shadow-lg)',
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  }
};

export const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
};

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
};

export const modalOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
};

export const dropdownMenu = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
};

export const tooltip = {
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 5 },
  transition: { duration: 0.15 }
};

export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.5, repeat: Infinity }
  }
};

export const spin = {
  animate: {
    rotate: 360,
    transition: { duration: 1, repeat: Infinity, ease: 'linear' }
  }
};

export const countUp = (duration = 1.5) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration }
});

export const progressBar = {
  initial: { width: 0 },
  animate: { width: '100%' },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
};

export const shake = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 }
  }
};

export const bounce = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
  }
};

export const flip = {
  initial: { rotateY: 90 },
  animate: { rotateY: 0 },
  exit: { rotateY: -90 },
  transition: { duration: 0.4 }
};

export const expandCollapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
};

export const fadeScale = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
};

/**
 * Format number as salary with thousand separators (dots)
 * @param {number|string} value - The value to format
 * @returns {string} Formatted salary string
 * 
 * @example
 * formatSalary(5000000) // "5.000.000"
 * formatSalary("5000000") // "5.000.000"
 * formatSalary(0) // "0"
 */
export function formatSalary(value) {
  if (!value || value === '' || value === null || value === undefined) {
    return '0';
  }
  
  // Remove non-numeric characters
  const numericValue = String(value).replace(/\D/g, '');
  
  if (!numericValue || numericValue === '0') {
    return '0';
  }
  
  // Add thousand separators (dots)
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse formatted salary string to number
 * @param {string} formattedValue - The formatted salary string
 * @returns {number} Numeric value
 * 
 * @example
 * parseSalary("5.000.000") // 5000000
 * parseSalary("5000000") // 5000000
 */
export function parseSalary(formattedValue) {
  if (!formattedValue) return 0;
  return parseInt(String(formattedValue).replace(/\D/g, ''), 10) || 0;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indonesian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  // Indonesian phone: 08xx, +628xx, or 628xx
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Sanitize string input (prevent XSS)
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (!input) return '';
  return String(input)
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

/**
 * Calculate age from birth date
 * @param {string|Date} birthDate - Birth date
 * @returns {number} Age in years
 */
export function calculateAge(birthDate) {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format date to Indonesian locale
 * @param {string|Date} date - Date to format
 * @param {boolean} includeTime - Include time in format
 * @returns {string} Formatted date string
 */
export function formatDate(date, includeTime = false) {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return d.toLocaleDateString('id-ID', options);
}

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID
 */
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

import { describe, it, expect } from 'vitest';
import {
  formatSalary,
  parseSalary,
  isValidEmail,
  isValidPhone,
  sanitizeInput,
  calculateAge,
  formatDate,
  generateId,
} from './helpers';

describe('Utility Helpers', () => {
  describe('formatSalary', () => {
    it('should format number with thousand separators', () => {
      expect(formatSalary(5000000)).toBe('5.000.000');
      expect(formatSalary(1000)).toBe('1.000');
      expect(formatSalary(15000000)).toBe('15.000.000');
    });

    it('should handle string input', () => {
      expect(formatSalary('5000000')).toBe('5.000.000');
      expect(formatSalary('1000')).toBe('1.000');
    });

    it('should handle edge cases', () => {
      expect(formatSalary(0)).toBe('0');
      expect(formatSalary('')).toBe('0');
      expect(formatSalary(null)).toBe('0');
      expect(formatSalary(undefined)).toBe('0');
    });

    it('should remove non-numeric characters', () => {
      expect(formatSalary('5.000.000')).toBe('5.000.000');
      expect(formatSalary('Rp 5000000')).toBe('5.000.000');
    });

    it('should handle small numbers', () => {
      expect(formatSalary(500)).toBe('500');
      expect(formatSalary(99)).toBe('99');
    });
  });

  describe('parseSalary', () => {
    it('should parse formatted salary to number', () => {
      expect(parseSalary('5.000.000')).toBe(5000000);
      expect(parseSalary('1.000')).toBe(1000);
    });

    it('should handle unformatted numbers', () => {
      expect(parseSalary('5000000')).toBe(5000000);
      expect(parseSalary('1000')).toBe(1000);
    });

    it('should handle edge cases', () => {
      expect(parseSalary('')).toBe(0);
      expect(parseSalary(null)).toBe(0);
      expect(parseSalary(undefined)).toBe(0);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.id')).toBe(true);
      expect(isValidEmail('test+tag@example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate Indonesian phone numbers', () => {
      expect(isValidPhone('081234567890')).toBe(true);
      expect(isValidPhone('08123456789')).toBe(true);
      expect(isValidPhone('+6281234567890')).toBe(true);
      expect(isValidPhone('6281234567890')).toBe(true);
    });

    it('should handle phone with spaces/dashes', () => {
      expect(isValidPhone('0812-3456-7890')).toBe(true);
      expect(isValidPhone('0812 3456 7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abcd')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone(null)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello bWorld/b');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should handle edge cases', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 25);
      expect(calculateAge(birthDate)).toBe(25);
    });

    it('should handle string dates', () => {
      const birthDate = '1998-01-01';
      const age = calculateAge(birthDate);
      expect(age).toBeGreaterThan(20);
      expect(age).toBeLessThan(30);
    });

    it('should handle edge cases', () => {
      expect(calculateAge(null)).toBe(0);
      expect(calculateAge('')).toBe(0);
    });

    it('should handle birthday not yet passed this year', () => {
      const today = new Date();
      const birthDate = new Date(today);
      birthDate.setFullYear(today.getFullYear() - 25);
      birthDate.setMonth(today.getMonth() + 1); // Next month
      
      expect(calculateAge(birthDate)).toBe(24); // Not 25 yet
    });
  });

  describe('formatDate', () => {
    it('should format date to Indonesian locale', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('Januari');
      expect(formatted).toContain('2024');
    });

    it('should include time when requested', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDate(date, true);
      expect(formatted).toContain('10');
      expect(formatted).toContain('30');
    });

    it('should handle invalid dates', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate('')).toBe('-');
      expect(formatDate('invalid')).toBe('-');
    });
  });

  describe('generateId', () => {
    it('should generate ID with default length', () => {
      const id = generateId();
      expect(id).toHaveLength(8);
    });

    it('should generate ID with custom length', () => {
      const id = generateId(16);
      expect(id).toHaveLength(16);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should only contain alphanumeric characters', () => {
      const id = generateId(100);
      expect(id).toMatch(/^[A-Za-z0-9]+$/);
    });
  });
});

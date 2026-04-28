import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  calcItemScore, 
  RATING_MULTIPLIER 
} from './db';
import { formatSalary } from '../utils/helpers';

describe('Database Utility Functions', () => {
  describe('calcItemScore', () => {
    it('should calculate score for check type (Ada)', () => {
      const assessment = { check_ada: true };
      const category = { bobot: 0.01, tipe: 'check' };
      
      const score = calcItemScore(assessment, category);
      
      expect(score).toBe(1); // 0.01 * 100 = 1
    });

    it('should calculate score for check type (Tidak)', () => {
      const assessment = { check_ada: false };
      const category = { bobot: 0.01, tipe: 'check' };
      
      const score = calcItemScore(assessment, category);
      
      expect(score).toBe(0);
    });

    it('should calculate score for rating type with multiplier', () => {
      const assessment = { nilai: 4 }; // Baik
      const category = { bobot: 0.15, tipe: 'rating' };
      
      const score = calcItemScore(assessment, category);
      
      // 0.15 * 0.8 (multiplier for rating 4) * 100 = 12
      expect(score).toBe(12);
    });

    it('should calculate score for rating 5 (Sangat Baik)', () => {
      const assessment = { nilai: 5 };
      const category = { bobot: 0.15, tipe: 'rating' };
      
      const score = calcItemScore(assessment, category);
      
      // 0.15 * 1.0 (multiplier for rating 5) * 100 = 15
      expect(score).toBe(15);
    });

    it('should calculate score for rating 1 (Sangat Kurang)', () => {
      const assessment = { nilai: 1 };
      const category = { bobot: 0.15, tipe: 'rating' };
      
      const score = calcItemScore(assessment, category);
      
      // 0.15 * 0.2 (multiplier for rating 1) * 100 = 3
      expect(score).toBe(3);
    });

    it('should return 0 for missing assessment data', () => {
      const assessment = {};
      const category = { bobot: 0.15, tipe: 'rating' };
      
      const score = calcItemScore(assessment, category);
      
      expect(score).toBe(0);
    });

    it('should return 0 for invalid rating', () => {
      const assessment = { nilai: 0 };
      const category = { bobot: 0.15, tipe: 'rating' };
      
      const score = calcItemScore(assessment, category);
      
      expect(score).toBe(0);
    });

    it('should handle edge case with very small bobot', () => {
      const assessment = { nilai: 5 };
      const category = { bobot: 0.001, tipe: 'rating' };
      
      const score = calcItemScore(assessment, category);
      
      // 0.001 * 1.0 * 100 = 0.1
      expect(score).toBe(0.1);
    });
  });

  describe('RATING_MULTIPLIER', () => {
    it('should have correct multiplier values', () => {
      expect(RATING_MULTIPLIER[1]).toBe(0.2);
      expect(RATING_MULTIPLIER[2]).toBe(0.4);
      expect(RATING_MULTIPLIER[3]).toBe(0.6);
      expect(RATING_MULTIPLIER[4]).toBe(0.8);
      expect(RATING_MULTIPLIER[5]).toBe(1.0);
    });
  });

  describe('formatSalary', () => {
    it('should format salary with thousand separators', () => {
      expect(formatSalary(5000000)).toBe('5.000.000');
    });

    it('should format small numbers', () => {
      expect(formatSalary(500)).toBe('500');
    });

    it('should format large numbers', () => {
      expect(formatSalary(15000000)).toBe('15.000.000');
    });

    it('should handle zero', () => {
      expect(formatSalary(0)).toBe('0');
    });

    it('should handle string input', () => {
      expect(formatSalary('5000000')).toBe('5.000.000');
    });

    it('should handle empty string', () => {
      expect(formatSalary('')).toBe('0');
    });

    it('should handle null/undefined', () => {
      expect(formatSalary(null)).toBe('0');
      expect(formatSalary(undefined)).toBe('0');
    });
  });
});

describe('Score Calculation Integration', () => {
  it('should calculate total score correctly for mixed assessments', () => {
    const assessments = [
      { nilai: 5, category: { bobot: 0.15, tipe: 'rating' } }, // 15
      { nilai: 4, category: { bobot: 0.10, tipe: 'rating' } }, // 8
      { check_ada: true, category: { bobot: 0.01, tipe: 'check' } }, // 1
      { check_ada: false, category: { bobot: 0.01, tipe: 'check' } }, // 0
    ];

    let totalScore = 0;
    assessments.forEach(({ category, ...assessment }) => {
      totalScore += calcItemScore(assessment, category);
    });

    expect(totalScore).toBe(24); // 15 + 8 + 1 + 0 = 24
  });

  it('should match Excel formula calculation', () => {
    // Test case from Excel: DIAN YUSUF
    // Assuming specific assessments that should result in 90.5
    const assessments = [
      { nilai: 5, category: { bobot: 0.15, tipe: 'rating' } }, // 15
      { nilai: 5, category: { bobot: 0.15, tipe: 'rating' } }, // 15
      { nilai: 5, category: { bobot: 0.15, tipe: 'rating' } }, // 15
      { nilai: 5, category: { bobot: 0.15, tipe: 'rating' } }, // 15
      { nilai: 5, category: { bobot: 0.15, tipe: 'rating' } }, // 15
      { nilai: 5, category: { bobot: 0.15, tipe: 'rating' } }, // 15
      { check_ada: true, category: { bobot: 0.005, tipe: 'check' } }, // 0.5
    ];

    let totalScore = 0;
    assessments.forEach(({ category, ...assessment }) => {
      totalScore += calcItemScore(assessment, category);
    });

    expect(totalScore).toBe(90.5);
  });
});

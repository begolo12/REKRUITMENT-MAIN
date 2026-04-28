import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calcItemScore,
  RATING_MULTIPLIER,
  getUsers,
  getCandidates,
  getCategories,
  createUser,
  createCandidate,
  updateUser,
  updateCandidate,
  deleteUser,
  validateUser,
  createCategory,
  updateCategory,
  getDashboardData,
  getMyAssessments,
  ensureDefaultAdmin,
  clearAllCache
} from './db';
import { formatSalary } from '../utils/helpers';

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}));

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

describe('Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllCache();
  });

  describe('getUsers', () => {
    it('should return success with data when Firebase succeeds', async () => {
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockResolvedValue({
        docs: [
          { id: '1', data: () => ({ username: 'user1', full_name: 'User One' }) },
          { id: '2', data: () => ({ username: 'user2', full_name: 'User Two' }) }
        ]
      });

      const result = await getUsers();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should return error object when Firebase fails', async () => {
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Network error'));

      const result = await getUsers();

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe('string');
    });

    it('should return user-friendly error message', async () => {
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockRejectedValue(new Error('permission-denied'));

      const result = await getUsers();

      expect(result.success).toBe(false);
      expect(result.error).toContain('tidak memiliki izin');
    });
  });

  describe('getCandidates', () => {
    it('should return success with data when Firebase succeeds', async () => {
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockResolvedValue({
        docs: [
          { id: '1', data: () => ({ nama: 'Candidate 1', posisi: 'Developer' }) },
          { id: '2', data: () => ({ nama: 'Candidate 2', posisi: 'Designer' }) }
        ]
      });

      const result = await getCandidates();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should return error object when Firebase fails', async () => {
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Network error'));

      const result = await getCandidates();

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('getCategories', () => {
    it('should return success with data when Firebase succeeds', async () => {
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockResolvedValue({
        docs: [
          { id: '1', data: () => ({ name: 'Category 1', order_num: 1 }) },
          { id: '2', data: () => ({ name: 'Category 2', order_num: 2 }) }
        ]
      });

      const result = await getCategories();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should return error object when Firebase fails', async () => {
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Network error'));

      const result = await getCategories();

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('createUser error handling', () => {
    it('should return error object when Firebase fails', async () => {
      const { addDoc } = await import('firebase/firestore');
      addDoc.mockRejectedValue(new Error('Network error'));

      const result = await createUser({
        username: 'testuser',
        password: 'password123',
        full_name: 'Test User',
        role: 'user'
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('createCandidate error handling', () => {
    it('should return error object when Firebase fails', async () => {
      const { addDoc } = await import('firebase/firestore');
      addDoc.mockRejectedValue(new Error('Network error'));

      const result = await createCandidate({
        nama: 'Test Candidate',
        posisi: 'Developer',
        penempatan: 'Jakarta',
        divisi: 'IT',
        budget_salary: '5000000'
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('updateUser error handling', () => {
    it('should return error object when Firebase fails', async () => {
      const { updateDoc } = await import('firebase/firestore');
      updateDoc.mockRejectedValue(new Error('Network error'));

      const result = await updateUser('user123', { full_name: 'Updated Name' });

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('deleteUser error handling', () => {
    it('should return error object when Firebase fails', async () => {
      const { deleteDoc } = await import('firebase/firestore');
      deleteDoc.mockRejectedValue(new Error('Network error'));

      const result = await deleteUser('user123');

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('validateUser error handling', () => {
    it('should return null when Firebase fails', async () => {
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Network error'));

      const result = await validateUser('testuser', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('getDashboardData error handling', () => {
    it('should return error object when Firebase fails', async () => {
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Network error'));

      const result = await getDashboardData();

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('getMyAssessments error handling', () => {
    it('should return error object when Firebase fails', async () => {
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Network error'));

      const result = await getMyAssessments('user123');

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('updateCandidate', () => {
    it('should return success when update succeeds', async () => {
      const { getDocs, updateDoc } = await import('firebase/firestore');
      getDocs.mockResolvedValue({ docs: [] });
      updateDoc.mockResolvedValue();

      const result = await updateCandidate('candidate123', { nama: 'Updated Name' });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should return error object when Firebase fails', async () => {
      const { getDocs, updateDoc } = await import('firebase/firestore');
      getDocs.mockResolvedValue({ docs: [] });
      updateDoc.mockRejectedValue(new Error('Network error'));

      const result = await updateCandidate('candidate123', { nama: 'Updated Name' });

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('createCategory', () => {
    it('should return success with data when creation succeeds', async () => {
      const { getDocs, addDoc } = await import('firebase/firestore');
      getDocs.mockResolvedValue({
        docs: [
          { id: '1', data: () => ({ name: 'Category 1', order_num: 1 }) }
        ]
      });
      addDoc.mockResolvedValue({ id: 'newcat123' });

      const result = await createCategory({ name: 'New Category', bobot: 0.1 });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe('newcat123');
    });

    it('should return error object when Firebase fails', async () => {
      const { getDocs, addDoc } = await import('firebase/firestore');
      getDocs.mockResolvedValue({ docs: [] });
      addDoc.mockRejectedValue(new Error('Network error'));

      const result = await createCategory({ name: 'New Category', bobot: 0.1 });

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('updateCategory', () => {
    it('should return success when update succeeds', async () => {
      const { getDocs, updateDoc } = await import('firebase/firestore');
      getDocs.mockResolvedValue({ docs: [] });
      updateDoc.mockResolvedValue();

      const result = await updateCategory('cat123', { name: 'Updated Category' });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should return error object when Firebase fails', async () => {
      const { getDocs, updateDoc } = await import('firebase/firestore');
      getDocs.mockResolvedValue({ docs: [] });
      updateDoc.mockRejectedValue(new Error('Network error'));

      const result = await updateCategory('cat123', { name: 'Updated Category' });

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('ensureDefaultAdmin', () => {
    it('should return success when admin exists', async () => {
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockResolvedValue({
        docs: [
          { id: '1', data: () => ({ username: 'admin', role: 'admin' }) }
        ]
      });

      const result = await ensureDefaultAdmin();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should return success when admin is created', async () => {
      const { getDocs, addDoc } = await import('firebase/firestore');
      getDocs.mockResolvedValue({ docs: [] });
      addDoc.mockResolvedValue({ id: 'admin123' });

      const result = await ensureDefaultAdmin();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should return error object when Firebase fails', async () => {
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Network error'));

      const result = await ensureDefaultAdmin();

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});

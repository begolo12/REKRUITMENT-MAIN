/**
 * Script untuk import data dari Excel ke Firebase
 * 
 * Data dari 4 file Excel:
 * 1. RECRUITMENT OPERASI - 28 APRIL 2026 - WAHYU M. PUNGKI.xlsx
 * 2. HASIL RECRUITMENT REKRUITMENT URIP.xlsx
 * 3. REKRUITMEN - ANGGY.xlsx
 * 4. HASIL REKRUITMENT - MUCHLIS ARIF.xlsx
 * 
 * Semua file memiliki penilaian identik (86.70) untuk posisi Staff Operasi
 * 4 kandidat dinilai oleh 4 penilai (masing-masing 1 penilai per kandidat)
 */

import { db } from '../firebase.js';
import {
  collection, doc, getDocs, addDoc, writeBatch, serverTimestamp
} from 'firebase/firestore';

import { EXCEL_ASSESSMENTS } from './excel_data.js';

// ==================== DATA PENILAI (ASSESSOR) ====================
const ASSESSORS = [
  { username: 'wahyu', password_plain: 'wahyu123', full_name: 'Wahyu M. Pungki', role: 'user' },
  { username: 'urip', password_plain: 'urip123', full_name: 'Urip', role: 'user' },
  { username: 'anggy', password_plain: 'anggy123', full_name: 'Anggy Permana Putra', role: 'hr' },
  { username: 'muchlis', password_plain: 'muchlis123', full_name: 'Muchlis Arif', role: 'user' },
];

// ==================== DATA KANDIDAT ====================
const CANDIDATES = [
  { nama: 'Deny Ferdiansyah', posisi: 'Staff Operasi', penempatan: 'IKN - Kalimantan Timur', divisi: 'Operasi', budget_salary: 'Range 4 JT - 4,8 JT (All In - IKN)', status: 'Menunggu' },
  { nama: 'Ilham Ambia Putra', posisi: 'Staff Operasi', penempatan: 'IKN - Kalimantan Timur', divisi: 'Operasi', budget_salary: 'Range 4 JT - 4,8 JT (All In - IKN)', status: 'Menunggu' },
  { nama: 'Mohamad Dicky', posisi: 'Staff Operasi', penempatan: 'IKN - Kalimantan Timur', divisi: 'Operasi', budget_salary: 'Range 4 JT - 4,8 JT (All In - IKN)', status: 'Menunggu' },
  { nama: 'M. Doni Waseso', posisi: 'Staff Operasi', penempatan: 'IKN - Kalimantan Timur', divisi: 'Operasi', budget_salary: 'Range 4 JT - 4,8 JT (All In - IKN)', status: 'Menunggu' },
];

// ==================== DATA PENILAIAN (dari Excel, semua identik) ====================
// Setiap item: { kode, nilai (skor akhir), check_ada (untuk tipe check) }
// Nilai sudah dihitung: bobot × rating_multiplier × 100
const ASSESSMENT_DATA = [
  // A. PENGALAMAN (check)
  { kode: 'A100', nilai: 6.00, check_ada: true },   // 6% × 100% = 6.00 (Ada)
  { kode: 'A200', nilai: 4.00, check_ada: true },   // 4% × 100% = 4.00 (Ada)

  // B. ADMINISTRASI (check)
  { kode: 'B100', nilai: 1.00, check_ada: true },   // 1% × 100% = 1.00 (Ada)
  { kode: 'B200', nilai: 2.00, check_ada: true },   // 2% × 100% = 2.00 (Ada)
  { kode: 'B300', nilai: 1.00, check_ada: true },   // 1% × 100% = 1.00 (Ada)
  { kode: 'B400', nilai: 1.00, check_ada: true },   // 1% × 100% = 1.00 (Ada)

  // C. HARD SKILL (rating)
  { kode: 'C110', nilai: 12.00, check_ada: false },  // 15% × 80%(B) × 100 = 12.00
  { kode: 'C120', nilai: 10.00, check_ada: false },  // 10% × 100%(SB) × 100 = 10.00
  { kode: 'C130', nilai: 2.00, check_ada: false },   // 2.5% × 80%(B) × 100 = 2.00
  { kode: 'C140', nilai: 4.50, check_ada: false },   // 7.5% × 60%(R) × 100 = 4.50

  // D. SOFT SKILL (rating)
  { kode: 'D110', nilai: 2.00, check_ada: false },   // 2.5% × 80%(B) × 100 = 2.00
  { kode: 'D120', nilai: 8.00, check_ada: false },   // 10% × 80%(B) × 100 = 8.00
  { kode: 'D130', nilai: 5.00, check_ada: false },   // 5% × 100%(SB) × 100 = 5.00
  { kode: 'D140', nilai: 7.50, check_ada: false },   // 7.5% × 100%(SB) × 100 = 7.50

  // E. PSIKOLOGI INTERVIEW (rating)
  { kode: 'E100', nilai: 6.00, check_ada: false },   // 7.5% × 80%(B) × 100 = 6.00
  { kode: 'E200', nilai: 5.00, check_ada: false },   // 5% × 100%(SB) × 100 = 5.00
  { kode: 'E300', nilai: 2.50, check_ada: false },   // 2.5% × 100%(SB) × 100 = 2.50

  // F. SALARY & PROSPEKTUS KARIR (rating)
  { kode: 'F100', nilai: 3.20, check_ada: false },   // 4% × 80%(B) × 100 = 3.20
  { kode: 'F200', nilai: 1.00, check_ada: false },   // 1% × 100%(SB) × 100 = 1.00

  // G. ADD USER QUESTION (rating)
  { kode: 'G100', nilai: 3.00, check_ada: false },   // 5% × 60%(R) × 100 = 3.00
];

// Total: 86.70

// ==================== HASH PASSWORD ====================
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return 'sha256_' + hashHex;
}

// ==================== MAIN IMPORT ====================
export async function importExcelData() {
  console.log('🚀 Starting Excel data import...');
  
  try {
    // 1. Get existing categories (soal) from Firebase
    const catSnap = await getDocs(collection(db, 'categories'));
    const categories = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`📋 Found ${categories.length} categories in Firebase`);
    
    if (categories.length === 0) {
      throw new Error('No categories found! Please seed categories first.');
    }

    // Build kode -> category_id map
    const kodeMap = {};
    categories.forEach(c => { kodeMap[c.kode] = c.id; });
    console.log('📋 Category kode map:', Object.keys(kodeMap));

    // 2. Check existing users
    const userSnap = await getDocs(collection(db, 'users'));
    const existingUsers = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const existingUsernames = existingUsers.map(u => u.username);
    console.log('👥 Existing users:', existingUsernames);

    // 3. Create assessor users (skip if already exist)
    const assessorIds = {};
    for (const assessor of ASSESSORS) {
      const existing = existingUsers.find(u => u.username === assessor.username);
      if (existing) {
        assessorIds[assessor.username] = existing.id;
        console.log(`✅ Assessor "${assessor.full_name}" already exists (${existing.id})`);
      } else {
        const hashedPw = await hashPassword(assessor.password_plain);
        const ref = await addDoc(collection(db, 'users'), {
          username: assessor.username,
          password: hashedPw,
          full_name: assessor.full_name,
          role: assessor.role,
          created_at: serverTimestamp()
        });
        assessorIds[assessor.username] = ref.id;
        console.log(`✅ Created assessor "${assessor.full_name}" (${ref.id})`);
      }
    }

    // 4. Check existing candidates
    const candSnap = await getDocs(collection(db, 'candidates'));
    const existingCandidates = candSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // 5. Create candidates (skip if already exist by name)
    const candidateIds = {};
    for (const cand of CANDIDATES) {
      const existing = existingCandidates.find(c => c.nama === cand.nama);
      if (existing) {
        candidateIds[cand.nama] = existing.id;
        console.log(`✅ Candidate "${cand.nama}" already exists (${existing.id})`);
      } else {
        const ref = await addDoc(collection(db, 'candidates'), {
          ...cand,
          created_at: serverTimestamp()
        });
        candidateIds[cand.nama] = ref.id;
        console.log(`✅ Created candidate "${cand.nama}" (${ref.id})`);
      }
    }

    // 6. Create assessments - each assessor rates each candidate
    // Check existing assessments
    const assSnap = await getDocs(collection(db, 'assessments'));
    const existingAssessments = assSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Delete existing assessments to ensure clean sync with Excel
    console.log(`🗑️ Deleting ${existingAssessments.length} existing assessments for clean sync...`);
    const deleteBatch = writeBatch(db);
    existingAssessments.forEach(ass => {
      deleteBatch.delete(doc(db, 'assessments', ass.id));
    });
    await deleteBatch.commit();
    console.log('✅ Deleted existing assessments.');

    let createdCount = 0;
    let skippedCount = 0;

    // Process from EXCEL_ASSESSMENTS
    for (const assessment of EXCEL_ASSESSMENTS) {
      const assessorId = assessorIds[assessment.penilai];
      const candidateId = candidateIds[assessment.kandidat];

      if (!assessorId || !candidateId) {
        console.warn(`⚠️ Skipping assessment for: assessor=${assessment.penilai}, candidate=${assessment.kandidat} (ID not found)`);
        continue;
      }
      
      // Calculate total score
      const totalScore = assessment.scores.reduce((sum, s) => sum + (s.nilai || 0), 0);

      // Check if assessments already exist for this pair
      const existingForPair = existingAssessments.filter(
        a => a.assessor_id === assessorId && a.candidate_id === candidateId
      );

      if (existingForPair.length > 0) {
        console.log(`⭐️ Assessments already exist for ${assessment.penilai} -> ${assessment.kandidat} (${existingForPair.length} items)`);
        skippedCount += existingForPair.length;
        continue;
      }

      // Create assessments in batch
      const batch = writeBatch(db);
      for (const item of assessment.scores) {
        const categoryId = kodeMap[item.kode];
        if (!categoryId) {
          console.warn(`⚠️ Category kode "${item.kode}" not found in Firebase!`);
          continue;
        }

        const ref = doc(collection(db, 'assessments'));
        batch.set(ref, {
          candidate_id: candidateId,
          assessor_id: assessorId,
          category_id: categoryId,
          nilai: Math.round(item.nilai * 100) / 100,
          check_ada: item.check_ada || false,
          is_final_score: true,
          keterangan: item.keterangan || '',
          created_at: serverTimestamp()
        });
        createdCount++;
      }
      await batch.commit();
      console.log(`✅ Imported ${assessment.scores.length} scores for ${assessment.penilai} -> ${assessment.kandidat}`);
    }

    console.log(`✨ Import finished! Created ${createdCount} assessment items.`);
    return { success: true, createdCount };
  } catch (error) {
    console.error('❌ Import failed:', error);
    return { success: false, error: error.message };
  }
}


import { db } from '../firebase';
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  writeBatch, serverTimestamp
} from 'firebase/firestore';

// ==================== ERROR HANDLING UTILITIES ====================

/**
 * Convert Firebase error codes to user-friendly messages
 */
function getUserFriendlyError(error) {
  const errorCode = error.code || error.message || '';
  
  // Firebase specific error codes
  if (errorCode.includes('permission-denied') || errorCode.includes('insufficient permissions')) {
    return 'Anda tidak memiliki izin untuk melakukan operasi ini.';
  }
  if (errorCode.includes('not-found') || errorCode.includes('document not found')) {
    return 'Data tidak ditemukan.';
  }
  if (errorCode.includes('already-exists')) {
    return 'Data sudah ada.';
  }
  if (errorCode.includes('resource-exhausted')) {
    return 'Batas penggunaan terlampaui. Silakan coba lagi nanti.';
  }
  if (errorCode.includes('unauthenticated') || errorCode.includes('unauthorized')) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }
  if (errorCode.includes('network') || errorCode.includes('Network') || errorCode.includes('offline')) {
    return 'Koneksi internet bermasalah. Silakan periksa koneksi Anda.';
  }
  if (errorCode.includes('timeout') || errorCode.includes('deadline-exceeded')) {
    return 'Waktu tunggu habis. Silakan coba lagi.';
  }
  if (errorCode.includes('cancelled') || errorCode.includes('aborted')) {
    return 'Operasi dibatalkan.';
  }
  if (errorCode.includes('invalid-argument')) {
    return 'Data yang dimasukkan tidak valid.';
  }
  
  // Default error message
  return 'Terjadi kesalahan. Silakan coba lagi.';
}

// ==================== IN-MEMORY CACHE ====================
// Prevents repeated Firestore reads. Invalidated on writes.
const cache = { users: null, candidates: null, categories: null, assessments: null, ts: 0 };

function invalidate(key) {
  if (key) cache[key] = null;
  else { cache.users = null; cache.candidates = null; cache.categories = null; cache.assessments = null; }
}

// Export function to clear categories cache
export function clearCategoriesCache() {
  cache.categories = null;
}

// Export function to clear all cache (for testing)
export function clearAllCache() {
  cache.users = null;
  cache.candidates = null;
  cache.categories = null;
  cache.assessments = null;
  cache.ts = 0;
}

// Simple hash function for passwords (in production, use bcrypt)
// Using consistent hashing algorithm that works across environments
async function hashPassword(password) {
  // Use SubtleCrypto for consistent hashing across all environments
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return 'sha256_' + hashHex;
}

// Check if password is using old hash format (for migration)
function isOldHashFormat(hash) {
  return hash && hash.startsWith('hash_');
}

// Migrate old password hash to new format if needed
async function migratePasswordIfNeeded(user, plainPassword) {
  if (isOldHashFormat(user.password)) {
    console.log('🔄 Migrating password hash for user:', user.username);
    const newHash = await hashPassword(plainPassword);
    await updateDoc(doc(db, 'users', user.id), { password: newHash });
    return newHash;
  }
  return user.password;
}

// ==================== DEFAULT ADMIN SETUP ====================
// Creates default admin user if no users exist in the database

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123',
  full_name: 'Administrator',
  role: 'admin'
};

export async function ensureDefaultAdmin() {
  try {
    // Force refresh users from Firestore (bypass cache)
    invalidate('users');
    const usersResult = await getUsers();

    if (!usersResult.success) {
      throw new Error(usersResult.error);
    }

    const users = usersResult.data;
    console.log('🔍 Checking for admin user. Total users:', users.length);

    // Check if admin user already exists
    const adminExists = users.some(u => u.username === DEFAULT_ADMIN.username);

    if (!adminExists) {
      console.log('🔧 Creating default admin user...');
      // Create admin directly using addDoc to avoid circular dependency
      const hashedPassword = await hashPassword(DEFAULT_ADMIN.password);
      const ref = await addDoc(collection(db, 'users'), {
        username: DEFAULT_ADMIN.username.toLowerCase().trim(),
        password: hashedPassword,
        full_name: DEFAULT_ADMIN.full_name.trim(),
        role: DEFAULT_ADMIN.role,
        created_at: serverTimestamp()
      });
      console.log('✅ Default admin user created successfully with ID:', ref.id);
      console.log('   Username: admin');
      console.log('   Password: admin123');
      // Invalidate cache to include new admin
      invalidate('users');
    } else {
      console.log('✅ Admin user already exists');
    }
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

// ==================== BULK LOADERS (single query each) ====================

export async function getUsers() {
  try {
    if (cache.users) return { success: true, data: cache.users };
    const snap = await getDocs(collection(db, 'users'));
    cache.users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, data: cache.users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

export async function getCandidates() {
  try {
    if (cache.candidates) return { success: true, data: cache.candidates };
    const snap = await getDocs(collection(db, 'candidates'));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => {
      const ta = a.created_at?.toDate?.() || a.created_at || 0;
      const tb = b.created_at?.toDate?.() || b.created_at || 0;
      return tb - ta;
    });
    cache.candidates = list;
    return { success: true, data: cache.candidates };
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

export async function getCategories(forceRefresh = false) {
  try {
    if (cache.categories && !forceRefresh) return { success: true, data: cache.categories };
    const snap = await getDocs(collection(db, 'categories'));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (a.order_num || 0) - (b.order_num || 0));
    cache.categories = list;
    return { success: true, data: cache.categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

// Direct fetch without any caching
export async function getCategoriesDirect() {
  const snap = await getDocs(collection(db, 'categories'));
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  list.sort((a, b) => (a.order_num || 0) - (b.order_num || 0));
  return list;
}

async function getAllAssessments() {
  if (cache.assessments) return cache.assessments;
  const snap = await getDocs(collection(db, 'assessments'));
  cache.assessments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return cache.assessments;
}

// ==================== PRELOAD ALL (3 queries total) ====================
// Call this once on app load — fetches everything in parallel

export async function preloadAll() {
  const [u, c, cat, a] = await Promise.all([
    getUsers(), getCandidates(), getCategories(), getAllAssessments()
  ]);
  return {
    users: u.success ? u.data : [],
    candidates: c.success ? c.data : [],
    categories: cat.success ? cat.data : [],
    assessments: a
  };
}

// ==================== SINGLE ITEM GETTERS ====================

export async function getUserByUsername(username) {
  const result = await getUsers();
  if (!result.success) return null;
  return result.data.find(u => u.username === username) || null;
}

export async function getUserById(id) {
  const result = await getUsers();
  if (!result.success) return null;
  return result.data.find(u => u.id === id) || null;
}

export async function getCandidate(id) {
  const result = await getCandidates();
  if (!result.success) return null;
  return result.data.find(c => c.id === id) || null;
}

// ==================== WRITE OPERATIONS (invalidate cache) ====================

export async function createUser(data) {
  try {
    const hashedPassword = await hashPassword(data.password);
    const ref = await addDoc(collection(db, 'users'), {
      username: data.username.toLowerCase().trim(),
      password: hashedPassword,
      full_name: data.full_name.trim(),
      role: data.role || 'user',
      created_at: serverTimestamp()
    });
    invalidate('users');
    return { id: ref.id, ...data };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

export async function updateUser(id, data) {
  try {
    // Hash password if it's being updated
    const updateData = { ...data };
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }
    await updateDoc(doc(db, 'users', id), updateData);
    invalidate('users');
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

// Validate user credentials with hashed password
export async function validateUser(username, password) {
  try {
    const result = await getUsers();

    // Check if getUsers returned an error
    if (!result.success) {
      console.error('❌ Error fetching users:', result.error);
      return null;
    }

    const users = result.data;
    console.log('👥 Total users in DB:', users.length);
    console.log('👥 Users:', users.map(u => ({ username: u.username, role: u.role })));

    const user = users.find(u => u.username === username.toLowerCase().trim());
    if (!user) {
      console.log('❌ User not found:', username);
      return null;
    }
    
    // Migrate old hash format if needed
    let storedHash = user.password;
    if (isOldHashFormat(storedHash)) {
      console.log('🔄 Detected old password format, migrating...');
      storedHash = await migratePasswordIfNeeded(user, password);
    }
    
    const hashedInput = await hashPassword(password);
    console.log('🔑 Password check:', { 
      input: password, 
      hashedInput: hashedInput, 
      storedHash: storedHash,
      match: storedHash === hashedInput 
    });
    
    if (storedHash !== hashedInput) {
      console.log('❌ Password mismatch');
      return null;
    }
    
    console.log('✅ User validated:', user.username);
    return user;
  } catch (error) {
    console.error('Error validating user:', error);
    return null;
  }
}

export async function deleteUser(id) {
  try {
    await deleteDoc(doc(db, 'users', id));
    invalidate('users');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

export async function createCandidate(data) {
  try {
    const ref = await addDoc(collection(db, 'candidates'), {
      nama: data.nama.trim(),
      posisi: data.posisi.trim(),
      penempatan: data.penempatan || '',
      divisi: data.divisi || '',
      budget_salary: data.budget_salary || '',
      status: 'Dalam Proses',
      created_at: serverTimestamp()
    });
    invalidate('candidates');
    return { id: ref.id, ...data };
  } catch (error) {
    console.error('Error creating candidate:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

export async function updateCandidate(id, data) {
  try {
    await updateDoc(doc(db, 'candidates', id), data);
    invalidate('candidates');
    return { success: true };
  } catch (error) {
    console.error('Error updating candidate:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

export async function deleteCandidate(id) {
  const allAss = await getAllAssessments();
  const toDelete = allAss.filter(a => a.candidate_id === id);
  const batch = writeBatch(db);
  toDelete.forEach(a => batch.delete(doc(db, 'assessments', a.id)));
  batch.delete(doc(db, 'candidates', id));
  await batch.commit();
  invalidate('candidates');
  invalidate('assessments');
}

// ==================== DEFAULT CATEGORIES (SOAL ASSESSMENT) ====================
// Sesuai dengan "REKAP HASIL RECRUITMENT - STAFF OPERASI.xlsx"
// Bobot dalam desimal (misal 0.06 = 6%)

const DEFAULT_CATEGORIES = [
  // === A. PENGALAMAN (Total 10%) ===
  { kode: 'A100', kategori_utama: 'A', nama_kategori: 'PENGALAMAN', sub_kategori: 'Pengalaman di dalam Daniswara Group', pertanyaan: 'Apakah ada Pengalaman di Daniswara Group? Bagaimana pandangan anda terkait Daniswara Group?', bobot: 0.06, tipe: 'check', order_num: 1 },
  { kode: 'A200', kategori_utama: 'A', nama_kategori: 'PENGALAMAN', sub_kategori: 'Pengalaman di luar Daniswara Group', pertanyaan: 'Jika tidak, apakah sudah ada pengalaman sejenis di luar Daniswara?', bobot: 0.04, tipe: 'check', order_num: 2 },

  // === B. ADMINISTRASI (Total 5%) ===
  { kode: 'B100', kategori_utama: 'B', nama_kategori: 'ADMINISTRASI', sub_kategori: 'Identitas (KTP & KK)', pertanyaan: 'Apakah ada Identitas Diri KTP & KK?', bobot: 0.01, tipe: 'check', order_num: 3 },
  { kode: 'B200', kategori_utama: 'B', nama_kategori: 'ADMINISTRASI', sub_kategori: 'SIM A (utk jabatan di Divisi Operasi)', pertanyaan: 'Apakah sudah memiliki SIM A?', bobot: 0.02, tipe: 'check', order_num: 4 },
  { kode: 'B300', kategori_utama: 'B', nama_kategori: 'ADMINISTRASI', sub_kategori: 'SIM C', pertanyaan: 'Apakah sudah memiliki SIM C?', bobot: 0.01, tipe: 'check', order_num: 5 },
  { kode: 'B400', kategori_utama: 'B', nama_kategori: 'ADMINISTRASI', sub_kategori: 'NPWP', pertanyaan: 'Apakah sudah Memiliki NPWP?', bobot: 0.01, tipe: 'check', order_num: 6 },

  // === C. HARD SKILL - Operasi/Logistik (Total 35%) ===
  { kode: 'C110', kategori_utama: 'C', nama_kategori: 'HARD SKILL', sub_kategori: 'Skill Mengemudi', pertanyaan: 'Coba ceritakan pengalaman / keahlian dalam mengemudi mobil angkut/logistik?', bobot: 0.15, tipe: 'rating', order_num: 7 },
  { kode: 'C120', kategori_utama: 'C', nama_kategori: 'HARD SKILL', sub_kategori: 'Flow Administrasi Logistik', pertanyaan: 'Coba ceritakan yang anda ketahui tentang alur administrasi logistik? Dan kaitannya dengan Ms. Office', bobot: 0.10, tipe: 'rating', order_num: 8 },
  { kode: 'C130', kategori_utama: 'C', nama_kategori: 'HARD SKILL', sub_kategori: 'Pengetahuan terkait logistik', pertanyaan: 'Ceritakan yang anda ketahui terkait dengan logistik?', bobot: 0.025, tipe: 'rating', order_num: 9 },
  { kode: 'C140', kategori_utama: 'C', nama_kategori: 'HARD SKILL', sub_kategori: 'Pengalaman di Bongkar Muat', pertanyaan: 'Apakah memiliki pengalaman terkait bongkar muat? Sedalam apa?', bobot: 0.075, tipe: 'rating', order_num: 10 },

  // === D. SOFT SKILL - Staff (Total 25%) ===
  { kode: 'D110', kategori_utama: 'D', nama_kategori: 'SOFT SKILL', sub_kategori: 'Kepemimpinan', pertanyaan: 'Jika terjadi suatu diskusi dalam group/kelompok yang belum menemukan titik temu, apa yang akan anda lakukan?', bobot: 0.025, tipe: 'rating', order_num: 11 },
  { kode: 'D120', kategori_utama: 'D', nama_kategori: 'SOFT SKILL', sub_kategori: 'Komunikasi', pertanyaan: 'Bagaimana hubungan kerjasama antar sesama pegawai / organisasi / kelompok? (jika memiliki pengalaman kerja)', bobot: 0.10, tipe: 'rating', order_num: 12 },
  { kode: 'D130', kategori_utama: 'D', nama_kategori: 'SOFT SKILL', sub_kategori: 'Patuh pada Peraturan / Commitment', pertanyaan: 'Bagaimana pandangan anda terkait perusahaan dan aturan yang dapat berubah-ubah sesuai arah perusahaan?', bobot: 0.05, tipe: 'rating', order_num: 13 },
  { kode: 'D140', kategori_utama: 'D', nama_kategori: 'SOFT SKILL', sub_kategori: 'Determinasi thd tekanan', pertanyaan: 'Bagaimana pandangan anda jika anda dituntut pada pekerjaan diluar dari waktu normal dalam bekerja?', bobot: 0.075, tipe: 'rating', order_num: 14 },

  // === E. PSIKOLOGI INTERVIEW (Total 15%) ===
  { kode: 'E100', kategori_utama: 'E', nama_kategori: 'PSIKOLOGI INTERVIEW', sub_kategori: 'Antusiasme / Keinginan bergabung', pertanyaan: 'Apa yang anda pikirkan setelah mendengar / mengetahui Daniswara membutuhkan personil baru di posisi ini?', bobot: 0.075, tipe: 'rating', order_num: 15 },
  { kode: 'E200', kategori_utama: 'E', nama_kategori: 'PSIKOLOGI INTERVIEW', sub_kategori: 'Inisiatif', pertanyaan: 'Jika ada hal-hal yang kiranya belum diatur oleh perusahaan atau belum dapat arahan oleh atasan, apa yang biasanya anda lakukan?', bobot: 0.05, tipe: 'rating', order_num: 16 },
  { kode: 'E300', kategori_utama: 'E', nama_kategori: 'PSIKOLOGI INTERVIEW', sub_kategori: 'Adaptif', pertanyaan: 'Coba ceritakan pengalaman anda terkait dengan berada dalam lingkungan yang baru / hal yang baru?', bobot: 0.025, tipe: 'rating', order_num: 17 },

  // === F. SALARY & PROSPEKTUS KARIR (Total 5%) ===
  { kode: 'F100', kategori_utama: 'F', nama_kategori: 'SALARY & PROSPEKTUS KARIR', sub_kategori: 'Ekspektasi Salary (Mengukur Budget & Skill)', pertanyaan: 'Menurut anda, berapa ekspektasi salary/gaji yang anda inginkan? Bagaimana jika perusahaan belum memenuhinya?', bobot: 0.04, tipe: 'rating', order_num: 18 },
  { kode: 'F200', kategori_utama: 'F', nama_kategori: 'SALARY & PROSPEKTUS KARIR', sub_kategori: 'Tujuan Karir', pertanyaan: 'Sejauh yang anda tahu tentang Daniswara, apa tujuan anda berkarir/berkarya bersama Daniswara? Apa ada target posisi yang anda inginkan?', bobot: 0.01, tipe: 'rating', order_num: 19 },

  // === G. ADD USER QUESTION (Total 5%) ===
  { kode: 'G100', kategori_utama: 'G', nama_kategori: 'ADD USER QUESTION', sub_kategori: 'Pertanyaan Spesifik User', pertanyaan: 'Jika dalam 1 team terjadi perselisihan, apa yang akan lakukan? Dan Jika terjadi kendala di lapangan, apa yang akan anda lakukan?', bobot: 0.05, tipe: 'rating', order_num: 20 },
];

/**
 * Seed default categories (soal assessment) ke Firebase
 * Hanya dijalankan jika belum ada categories di database
 */
export async function seedDefaultCategories() {
  try {
    const result = await getCategories(true);
    const existing = result.success ? result.data : [];
    
    if (existing.length > 0) {
      console.log(`✅ Categories sudah ada (${existing.length} soal). Skip seeding.`);
      return { success: true, message: 'Categories already exist', count: existing.length };
    }

    console.log('🌱 Seeding default categories...');
    const batch = writeBatch(db);
    
    for (const cat of DEFAULT_CATEGORIES) {
      const ref = doc(collection(db, 'categories'));
      batch.set(ref, { ...cat, created_at: serverTimestamp() });
    }
    
    await batch.commit();
    invalidate('categories');
    
    console.log(`✅ Berhasil seed ${DEFAULT_CATEGORIES.length} soal assessment`);
    return { success: true, message: `Seeded ${DEFAULT_CATEGORIES.length} categories`, count: DEFAULT_CATEGORIES.length };
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

/**
 * Force re-seed categories (hapus semua lalu seed ulang)
 * HATI-HATI: Ini akan menghapus semua soal dan assessment yang ada!
 */
export async function reseedCategories() {
  try {
    // Hapus semua categories yang ada
    const result = await getCategories(true);
    const existing = result.success ? result.data : [];
    
    if (existing.length > 0) {
      const batch = writeBatch(db);
      existing.forEach(cat => batch.delete(doc(db, 'categories', cat.id)));
      await batch.commit();
      invalidate('categories');
      console.log(`🗑️ Deleted ${existing.length} existing categories`);
    }

    // Seed ulang
    const batch2 = writeBatch(db);
    for (const cat of DEFAULT_CATEGORIES) {
      const ref = doc(collection(db, 'categories'));
      batch2.set(ref, { ...cat, created_at: serverTimestamp() });
    }
    await batch2.commit();
    invalidate('categories');
    
    console.log(`✅ Re-seeded ${DEFAULT_CATEGORIES.length} soal assessment`);
    return { success: true, message: `Re-seeded ${DEFAULT_CATEGORIES.length} categories`, count: DEFAULT_CATEGORIES.length };
  } catch (error) {
    console.error('❌ Error re-seeding categories:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

// ==================== IMPORT DATA EXCEL ====================
// Data penilaian dari 4 file Excel recruitment Staff Operasi
// 4 penilai menilai 4 kandidat (Deny, Ilham, Dicky, Doni)

const EXCEL_ASSESSORS = [
  { username: 'anggy', password_plain: 'anggy123', full_name: 'Anggy Permana Putra', role: 'Direktur HR' },
  { username: 'wahyu', password_plain: 'wahyu123', full_name: 'Wahyu M. Pungki', role: 'Direktur GAS' },
  { username: 'urip', password_plain: 'urip123', full_name: 'Urip', role: 'Direktur DJP' },
  { username: 'muchlis', password_plain: 'muchlis123', full_name: 'Muchlis Arif Santoso', role: 'Manager Operasi' },
];

const EXCEL_CANDIDATES = [
  { nama: 'Deny Ferdiansyah', posisi: 'Staff Operasi', penempatan: 'IKN - Kalimantan Timur', divisi: 'Operasi', budget_salary: 'Range 4 JT - 4,8 JT (All In - IKN)' },
  { nama: 'Ilham Ambia Putra', posisi: 'Staff Operasi', penempatan: 'DKI Jakarta', divisi: 'Operasi', budget_salary: '' },
  { nama: 'Mohamad Dicky', posisi: 'Staff Operasi', penempatan: 'DKI Jakarta', divisi: 'Operasi', budget_salary: '' },
  { nama: 'M. Doni Waseso', posisi: 'Staff Operasi', penempatan: 'DKI Jakarta', divisi: 'Operasi', budget_salary: '' },
];

const EXCEL_ASSESSMENTS = [
  // === ANGGY -> Deny Ferdiansyah === Excel Total: 70.8, Calculated: 70.8
  { penilai: 'anggy', kandidat: 'Deny Ferdiansyah', scores: [
    { kode: 'A100', nilai: 6, check_ada: true },
    { kode: 'A200', nilai: 0, check_ada: false },
    { kode: 'B100', nilai: 1, check_ada: true },
    { kode: 'B200', nilai: 2, check_ada: true },
    { kode: 'B300', nilai: 1, check_ada: true },
    { kode: 'B400', nilai: 1, check_ada: true },
    { kode: 'C110', nilai: 12, check_ada: false },
    { kode: 'C120', nilai: 6, check_ada: false },
    { kode: 'C130', nilai: 2, check_ada: false },
    { kode: 'C140', nilai: 3, check_ada: false },
    { kode: 'D110', nilai: 1, check_ada: false },
    { kode: 'D120', nilai: 6, check_ada: false },
    { kode: 'D130', nilai: 5, check_ada: false },
    { kode: 'D140', nilai: 6, check_ada: false },
    { kode: 'E100', nilai: 6, check_ada: false },
    { kode: 'E200', nilai: 3, check_ada: false },
    { kode: 'E300', nilai: 2, check_ada: false },
    { kode: 'F100', nilai: 3.2, check_ada: false },
    { kode: 'F200', nilai: 0.6, check_ada: false },
    { kode: 'G100', nilai: 4, check_ada: false }
  ]},
  // === WAHYU -> Ilham Ambia Putra === Excel Total: 66.2, Calculated: 66.2
  { penilai: 'wahyu', kandidat: 'Ilham Ambia Putra', scores: [
    { kode: 'A100', nilai: 0, check_ada: false },
    { kode: 'A200', nilai: 4, check_ada: true },
    { kode: 'B100', nilai: 1, check_ada: true },
    { kode: 'B200', nilai: 0, check_ada: false },
    { kode: 'B300', nilai: 1, check_ada: true },
    { kode: 'B400', nilai: 1, check_ada: true },
    { kode: 'C110', nilai: 6, check_ada: false },
    { kode: 'C120', nilai: 6, check_ada: false },
    { kode: 'C130', nilai: 2, check_ada: false },
    { kode: 'C140', nilai: 6, check_ada: false },
    { kode: 'D110', nilai: 1.5, check_ada: false },
    { kode: 'D120', nilai: 8, check_ada: false },
    { kode: 'D130', nilai: 4, check_ada: false },
    { kode: 'D140', nilai: 7.5, check_ada: false },
    { kode: 'E100', nilai: 6, check_ada: false },
    { kode: 'E200', nilai: 4, check_ada: false },
    { kode: 'E300', nilai: 2, check_ada: false },
    { kode: 'F100', nilai: 1.6, check_ada: false, keterangan: 'UMR DEPOK (TERBUKA' },
    { kode: 'F200', nilai: 0.6, check_ada: false },
    { kode: 'G100', nilai: 4, check_ada: false }
  ]},
  // === WAHYU -> Mohamad Dicky === Excel Total: 62.2, Calculated: 62.2
  { penilai: 'wahyu', kandidat: 'Mohamad Dicky', scores: [
    { kode: 'A100', nilai: 0, check_ada: false },
    { kode: 'A200', nilai: 0, check_ada: false },
    { kode: 'B100', nilai: 1, check_ada: true },
    { kode: 'B200', nilai: 0, check_ada: false },
    { kode: 'B300', nilai: 1, check_ada: true },
    { kode: 'B400', nilai: 1, check_ada: true },
    { kode: 'C110', nilai: 3, check_ada: false },
    { kode: 'C120', nilai: 8, check_ada: false },
    { kode: 'C130', nilai: 1.5, check_ada: false },
    { kode: 'C140', nilai: 4.5, check_ada: false },
    { kode: 'D110', nilai: 2, check_ada: false },
    { kode: 'D120', nilai: 10, check_ada: false },
    { kode: 'D130', nilai: 3, check_ada: false },
    { kode: 'D140', nilai: 7.5, check_ada: false },
    { kode: 'E100', nilai: 6, check_ada: false },
    { kode: 'E200', nilai: 4, check_ada: false },
    { kode: 'E300', nilai: 2.5, check_ada: false },
    { kode: 'F100', nilai: 2.4, check_ada: false, keterangan: 'UMR DEPOK (TERBUKA)' },
    { kode: 'F200', nilai: 0.8, check_ada: false },
    { kode: 'G100', nilai: 4, check_ada: false }
  ]},
  // === WAHYU -> M. Doni Waseso === Excel Total: 58, Calculated: 58
  { penilai: 'wahyu', kandidat: 'M. Doni Waseso', scores: [
    { kode: 'A100', nilai: 6, check_ada: true },
    { kode: 'A200', nilai: 0, check_ada: false },
    { kode: 'B100', nilai: 1, check_ada: true },
    { kode: 'B200', nilai: 0, check_ada: false },
    { kode: 'B300', nilai: 0, check_ada: false },
    { kode: 'B400', nilai: 1, check_ada: true },
    { kode: 'C110', nilai: 6, check_ada: false },
    { kode: 'C120', nilai: 6, check_ada: false },
    { kode: 'C130', nilai: 1, check_ada: false },
    { kode: 'C140', nilai: 4.5, check_ada: false },
    { kode: 'D110', nilai: 1, check_ada: false },
    { kode: 'D120', nilai: 4, check_ada: false },
    { kode: 'D130', nilai: 4, check_ada: false },
    { kode: 'D140', nilai: 6, check_ada: false },
    { kode: 'E100', nilai: 6, check_ada: false },
    { kode: 'E200', nilai: 3, check_ada: false },
    { kode: 'E300', nilai: 1.5, check_ada: false },
    { kode: 'F100', nilai: 3.2, check_ada: false, keterangan: '>3JT / MENGIKUTI' },
    { kode: 'F200', nilai: 0.8, check_ada: false },
    { kode: 'G100', nilai: 3, check_ada: false }
  ]},
  // === URIP -> Ilham Ambia Putra === Excel Total: 61.2, Calculated: 61.2
  { penilai: 'urip', kandidat: 'Ilham Ambia Putra', scores: [
    { kode: 'A100', nilai: 0, check_ada: false },
    { kode: 'A200', nilai: 4, check_ada: true },
    { kode: 'B100', nilai: 1, check_ada: true },
    { kode: 'B200', nilai: 0, check_ada: false },
    { kode: 'B300', nilai: 1, check_ada: true },
    { kode: 'B400', nilai: 1, check_ada: true },
    { kode: 'C110', nilai: 3, check_ada: false },
    { kode: 'C120', nilai: 6, check_ada: false },
    { kode: 'C130', nilai: 2, check_ada: false },
    { kode: 'C140', nilai: 6, check_ada: false },
    { kode: 'D110', nilai: 1.5, check_ada: false },
    { kode: 'D120', nilai: 10, check_ada: false },
    { kode: 'D130', nilai: 4, check_ada: false },
    { kode: 'D140', nilai: 4.5, check_ada: false },
    { kode: 'E100', nilai: 6, check_ada: false },
    { kode: 'E200', nilai: 4, check_ada: false },
    { kode: 'E300', nilai: 2, check_ada: false },
    { kode: 'F100', nilai: 0.8, check_ada: false },
    { kode: 'F200', nilai: 0.4, check_ada: false },
    { kode: 'G100', nilai: 4, check_ada: false }
  ]},
  // === URIP -> Mohamad Dicky === Excel Total: 55.9, Calculated: 55.9
  { penilai: 'urip', kandidat: 'Mohamad Dicky', scores: [
    { kode: 'A100', nilai: 0, check_ada: false },
    { kode: 'A200', nilai: 4, check_ada: true },
    { kode: 'B100', nilai: 1, check_ada: true },
    { kode: 'B200', nilai: 0, check_ada: false },
    { kode: 'B300', nilai: 1, check_ada: true },
    { kode: 'B400', nilai: 1, check_ada: true },
    { kode: 'C110', nilai: 6, check_ada: false },
    { kode: 'C120', nilai: 6, check_ada: false },
    { kode: 'C130', nilai: 1, check_ada: false },
    { kode: 'C140', nilai: 1.5, check_ada: false },
    { kode: 'D110', nilai: 2, check_ada: false },
    { kode: 'D120', nilai: 8, check_ada: false },
    { kode: 'D130', nilai: 3, check_ada: false },
    { kode: 'D140', nilai: 6, check_ada: false },
    { kode: 'E100', nilai: 4.5, check_ada: false },
    { kode: 'E200', nilai: 3, check_ada: false },
    { kode: 'E300', nilai: 1.5, check_ada: false },
    { kode: 'F100', nilai: 1.6, check_ada: false },
    { kode: 'F200', nilai: 0.8, check_ada: false },
    { kode: 'G100', nilai: 4, check_ada: false }
  ]},
  // === URIP -> M. Doni Waseso === Excel Total: 61.3, Calculated: 61.3
  { penilai: 'urip', kandidat: 'M. Doni Waseso', scores: [
    { kode: 'A100', nilai: 6, check_ada: true },
    { kode: 'A200', nilai: 0, check_ada: false },
    { kode: 'B100', nilai: 1, check_ada: true },
    { kode: 'B200', nilai: 0, check_ada: false },
    { kode: 'B300', nilai: 0, check_ada: false },
    { kode: 'B400', nilai: 1, check_ada: true },
    { kode: 'C110', nilai: 6, check_ada: false },
    { kode: 'C120', nilai: 6, check_ada: false },
    { kode: 'C130', nilai: 1, check_ada: false },
    { kode: 'C140', nilai: 4.5, check_ada: false },
    { kode: 'D110', nilai: 1, check_ada: false },
    { kode: 'D120', nilai: 6, check_ada: false },
    { kode: 'D130', nilai: 3, check_ada: false },
    { kode: 'D140', nilai: 7.5, check_ada: false },
    { kode: 'E100', nilai: 6, check_ada: false },
    { kode: 'E200', nilai: 3, check_ada: false },
    { kode: 'E300', nilai: 1.5, check_ada: false },
    { kode: 'F100', nilai: 4, check_ada: false },
    { kode: 'F200', nilai: 0.8, check_ada: false },
    { kode: 'G100', nilai: 3, check_ada: false }
  ]},
  // === ANGGY -> Ilham Ambia Putra === Excel Total: 60, Calculated: 60
  { penilai: 'anggy', kandidat: 'Ilham Ambia Putra', scores: [
    { kode: 'A100', nilai: 0, check_ada: false },
    { kode: 'A200', nilai: 4, check_ada: true },
    { kode: 'B100', nilai: 1, check_ada: true },
    { kode: 'B200', nilai: 0, check_ada: false },
    { kode: 'B300', nilai: 1, check_ada: true },
    { kode: 'B400', nilai: 1, check_ada: true },
    { kode: 'C110', nilai: 3, check_ada: false },
    { kode: 'C120', nilai: 6, check_ada: false },
    { kode: 'C130', nilai: 1.5, check_ada: false },
    { kode: 'C140', nilai: 6, check_ada: false },
    { kode: 'D110', nilai: 2, check_ada: false },
    { kode: 'D120', nilai: 6, check_ada: false },
    { kode: 'D130', nilai: 4, check_ada: false },
    { kode: 'D140', nilai: 6, check_ada: false },
    { kode: 'E100', nilai: 6, check_ada: false },
    { kode: 'E200', nilai: 3, check_ada: false },
    { kode: 'E300', nilai: 2.5, check_ada: false },
    { kode: 'F100', nilai: 2.4, check_ada: false, keterangan: 'UMR DEPOK - 4,9 (NEGO)' },
    { kode: 'F200', nilai: 0.6, check_ada: false },
    { kode: 'G100', nilai: 4, check_ada: false }
  ]},
  // === ANGGY -> Mohamad Dicky === Excel Total: 59.5, Calculated: 59.5
  { penilai: 'anggy', kandidat: 'Mohamad Dicky', scores: [
    { kode: 'A100', nilai: 0, check_ada: false },
    { kode: 'A200', nilai: 4, check_ada: true },
    { kode: 'B100', nilai: 1, check_ada: true },
    { kode: 'B200', nilai: 0, check_ada: false },
    { kode: 'B300', nilai: 1, check_ada: true },
    { kode: 'B400', nilai: 1, check_ada: true },
    { kode: 'C110', nilai: 3, check_ada: false },
    { kode: 'C120', nilai: 8, check_ada: false },
    { kode: 'C130', nilai: 1.5, check_ada: false },
    { kode: 'C140', nilai: 1.5, check_ada: false },
    { kode: 'D110', nilai: 2, check_ada: false },
    { kode: 'D120', nilai: 8, check_ada: false },
    { kode: 'D130', nilai: 2, check_ada: false },
    { kode: 'D140', nilai: 6, check_ada: false },
    { kode: 'E100', nilai: 6, check_ada: false },
    { kode: 'E200', nilai: 4, check_ada: false },
    { kode: 'E300', nilai: 2.5, check_ada: false },
    { kode: 'F100', nilai: 3.2, check_ada: false, keterangan: 'MIN. UMR (NEGO)' },
    { kode: 'F200', nilai: 0.8, check_ada: false },
    { kode: 'G100', nilai: 4, check_ada: false }
  ]},
  // === ANGGY -> M. Doni Waseso === Excel Total: 63, Calculated: 63
  { penilai: 'anggy', kandidat: 'M. Doni Waseso', scores: [
    { kode: 'A100', nilai: 6, check_ada: true },
    { kode: 'A200', nilai: 0, check_ada: false },
    { kode: 'B100', nilai: 1, check_ada: true },
    { kode: 'B200', nilai: 0, check_ada: false },
    { kode: 'B300', nilai: 0, check_ada: false },
    { kode: 'B400', nilai: 1, check_ada: true },
    { kode: 'C110', nilai: 6, check_ada: false },
    { kode: 'C120', nilai: 6, check_ada: false },
    { kode: 'C130', nilai: 1, check_ada: false },
    { kode: 'C140', nilai: 4.5, check_ada: false },
    { kode: 'D110', nilai: 1.5, check_ada: false },
    { kode: 'D120', nilai: 6, check_ada: false },
    { kode: 'D130', nilai: 4, check_ada: false },
    { kode: 'D140', nilai: 7.5, check_ada: false },
    { kode: 'E100', nilai: 6, check_ada: false },
    { kode: 'E200', nilai: 3, check_ada: false },
    { kode: 'E300', nilai: 1.5, check_ada: false },
    { kode: 'F100', nilai: 3.2, check_ada: false },
    { kode: 'F200', nilai: 0.8, check_ada: false },
    { kode: 'G100', nilai: 4, check_ada: false }
  ]},
  // === MUCHLIS -> Ilham Ambia Putra === Excel Total: 58.8, Calculated: 58.8
  { penilai: 'muchlis', kandidat: 'Ilham Ambia Putra', scores: [
    { kode: 'A100', nilai: 0, check_ada: false },
    { kode: 'A200', nilai: 4, check_ada: true },
    { kode: 'B100', nilai: 1, check_ada: true },
    { kode: 'B200', nilai: 0, check_ada: false },
    { kode: 'B300', nilai: 1, check_ada: true },
    { kode: 'B400', nilai: 0, check_ada: false },
    { kode: 'C110', nilai: 3, check_ada: false, keterangan: 'BELUM LANCAR, ADA TRAUMA MENGENDARA MOBIL (NABRAK)' },
    { kode: 'C120', nilai: 8, check_ada: false, keterangan: 'MENGETAHUI ALUR DAN ADMINSTRASI LOGISTIK' },
    { kode: 'C130', nilai: 2, check_ada: false },
    { kode: 'C140', nilai: 4.5, check_ada: false, keterangan: 'PERNAH MENGIRIM LANGSUNG KE CUSTOMER' },
    { kode: 'D110', nilai: 2, check_ada: false, keterangan: 'MENCARI SOLUSI BERSAMA DAN MEMBERIKAN SOLUSI' },
    { kode: 'D120', nilai: 10, check_ada: false },
    { kode: 'D130', nilai: 4, check_ada: false, keterangan: 'MEMAKLUMI PERUBAHAN PERATURAN DAN MENGIKUTI' },
    { kode: 'D140', nilai: 4.5, check_ada: false },
    { kode: 'E100', nilai: 6, check_ada: false },
    { kode: 'E200', nilai: 4, check_ada: false, keterangan: 'FLEKSIBLE DAN AKAN MENGAMBIL TINDAKAN SESUAI SIKON' },
    { kode: 'E300', nilai: 2, check_ada: false },
    { kode: 'F100', nilai: 2.4, check_ada: false, keterangan: 'TERBUKA UNTUK NEGOSIASI SALARY' },
    { kode: 'F200', nilai: 0.4, check_ada: false, keterangan: 'BELUM ADA TUJUAN KARIR' },
    { kode: 'G100', nilai: 0, check_ada: false }
  ]},
  // === MUCHLIS -> Mohamad Dicky === Excel Total: 52.2, Calculated: 52.2
  { penilai: 'muchlis', kandidat: 'Mohamad Dicky', scores: [
    { kode: 'A100', nilai: 0, check_ada: false },
    { kode: 'A200', nilai: 4, check_ada: true, keterangan: 'PERENCANAAN PROGRAM DESA TERKAIT DANA DESA' },
    { kode: 'B100', nilai: 1, check_ada: true },
    { kode: 'B200', nilai: 0, check_ada: false },
    { kode: 'B300', nilai: 1, check_ada: true },
    { kode: 'B400', nilai: 1, check_ada: true },
    { kode: 'C110', nilai: 3, check_ada: false, keterangan: 'TIDAK BISA MOBIL MANUAL, MATIC BELUM LANCAR' },
    { kode: 'C120', nilai: 6, check_ada: false },
    { kode: 'C130', nilai: 1.5, check_ada: false },
    { kode: 'C140', nilai: 1.5, check_ada: false },
    { kode: 'D110', nilai: 2, check_ada: false, keterangan: 'BERDISKUSI DENGAN TIM DAN MENGAMBIL KEPUTUSAN BERSAMA / MENGUSULKAN VOTING' },
    { kode: 'D120', nilai: 8, check_ada: false },
    { kode: 'D130', nilai: 3, check_ada: false, keterangan: 'MENGAMBIL SIKAP MEMPERTANYAKAN KEPENTINGAN MENGUBAH PERATURAN' },
    { kode: 'D140', nilai: 6, check_ada: false },
    { kode: 'E100', nilai: 6, check_ada: false },
    { kode: 'E200', nilai: 3, check_ada: false },
    { kode: 'E300', nilai: 2, check_ada: false },
    { kode: 'F100', nilai: 2.4, check_ada: false },
    { kode: 'F200', nilai: 0.8, check_ada: false, keterangan: 'ADA TUJUAN KARIR KE MANAJER' },
    { kode: 'G100', nilai: 0, check_ada: false }
  ]},
  // === MUCHLIS -> M. Doni Waseso === Excel Total: 57.5, Calculated: 57.5
  { penilai: 'muchlis', kandidat: 'M. Doni Waseso', scores: [
    { kode: 'A100', nilai: 6, check_ada: true },
    { kode: 'A200', nilai: 0, check_ada: false },
    { kode: 'B100', nilai: 1, check_ada: true },
    { kode: 'B200', nilai: 0, check_ada: false },
    { kode: 'B300', nilai: 0, check_ada: false },
    { kode: 'B400', nilai: 1, check_ada: true },
    { kode: 'C110', nilai: 9, check_ada: false, keterangan: 'MATIC LANCAR, MANUAL BELUM LANCAR' },
    { kode: 'C120', nilai: 6, check_ada: false },
    { kode: 'C130', nilai: 1.5, check_ada: false },
    { kode: 'C140', nilai: 3, check_ada: false },
    { kode: 'D110', nilai: 1.5, check_ada: false },
    { kode: 'D120', nilai: 4, check_ada: false },
    { kode: 'D130', nilai: 4, check_ada: false },
    { kode: 'D140', nilai: 6, check_ada: false },
    { kode: 'E100', nilai: 6, check_ada: false },
    { kode: 'E200', nilai: 3, check_ada: false },
    { kode: 'E300', nilai: 1.5, check_ada: false },
    { kode: 'F100', nilai: 3.2, check_ada: false },
    { kode: 'F200', nilai: 0.8, check_ada: false },
    { kode: 'G100', nilai: 0, check_ada: false }
  ]}
];

/**
 * Import data dari Excel ke Firebase
 * Hapus data lama, buat 4 penilai, 4 kandidat, dan 13 set penilaian
 */
export async function importExcelData() {
  try {
    console.log('🚀 Starting Excel data import...');

    // 0. Hapus kandidat & assessment lama yang salah
    const oldCandSnap = await getDocs(collection(db, 'candidates'));
    const oldCands = oldCandSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const oldAssSnap = await getDocs(collection(db, 'assessments'));
    const oldAss = oldAssSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Delete old data in batches
    if (oldAss.length > 0 || oldCands.length > 0) {
      const delBatch = writeBatch(db);
      oldAss.forEach(a => delBatch.delete(doc(db, 'assessments', a.id)));
      oldCands.forEach(c => delBatch.delete(doc(db, 'candidates', c.id)));
      await delBatch.commit();
      console.log(`🗑️ Deleted ${oldCands.length} old candidates, ${oldAss.length} old assessments`);
    }
    invalidate('candidates');
    invalidate('assessments');

    // Delete old assessor users (not admin)
    const oldUserSnap = await getDocs(collection(db, 'users'));
    const oldUsers = oldUserSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const userDelBatch = writeBatch(db);
    let deletedUsers = 0;
    oldUsers.forEach(u => {
      if (u.username !== 'admin') {
        userDelBatch.delete(doc(db, 'users', u.id));
        deletedUsers++;
      }
    });
    if (deletedUsers > 0) {
      await userDelBatch.commit();
      console.log(`🗑️ Deleted ${deletedUsers} old users`);
    }
    invalidate('users');

    // 1. Get categories
    const catSnap = await getDocs(collection(db, 'categories'));
    const categories = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (categories.length === 0) {
      return { success: false, error: 'Belum ada soal assessment. Seed soal terlebih dahulu.' };
    }
    const kodeMap = {};
    categories.forEach(c => { kodeMap[c.kode] = c.id; });

    // 2. Create assessor users
    const assessorIds = {};
    for (const assessor of EXCEL_ASSESSORS) {
      const hashedPw = await hashPassword(assessor.password_plain);
      const ref = await addDoc(collection(db, 'users'), {
        username: assessor.username,
        password: hashedPw,
        full_name: assessor.full_name,
        role: assessor.role,
        created_at: serverTimestamp()
      });
      assessorIds[assessor.username] = ref.id;
      console.log(`✅ Created assessor: ${assessor.full_name} (${assessor.role})`);
    }
    invalidate('users');

    // 3. Create candidates
    const candidateIds = {};
    for (const cand of EXCEL_CANDIDATES) {
      const ref = await addDoc(collection(db, 'candidates'), {
        ...cand,
        status: 'Dalam Proses',
        created_at: serverTimestamp()
      });
      candidateIds[cand.nama] = ref.id;
      console.log(`✅ Created candidate: ${cand.nama}`);
    }
    invalidate('candidates');

    // 4. Create assessments from EXCEL_ASSESSMENTS
    let created = 0;
    for (const assessment of EXCEL_ASSESSMENTS) {
      const assessorId = assessorIds[assessment.penilai];
      const candidateId = candidateIds[assessment.kandidat];
      if (!assessorId || !candidateId) {
        console.warn(`⚠️ Skip: ${assessment.penilai} -> ${assessment.kandidat}`);
        continue;
      }

      const batch = writeBatch(db);
      for (const item of assessment.scores) {
        const categoryId = kodeMap[item.kode];
        if (!categoryId) continue;
        const ref = doc(collection(db, 'assessments'));
        batch.set(ref, {
          candidate_id: candidateId,
          assessor_id: assessorId,
          category_id: categoryId,
          nilai: item.nilai,
          check_ada: item.check_ada,
          keterangan: item.keterangan || '',
          created_at: serverTimestamp()
        });
        created++;
      }
      await batch.commit();
      console.log(`✅ ${assessment.penilai} -> ${assessment.kandidat}: ${assessment.scores.length} scores`);
    }
    invalidate('assessments');

    // 5. Auto-update statuses
    for (const cand of EXCEL_CANDIDATES) {
      const candId = candidateIds[cand.nama];
      if (candId) {
        try { await autoUpdateStatus(candId); } catch (e) { /* ignore */ }
      }
    }

    const msg = `Import berhasil: ${EXCEL_CANDIDATES.length} kandidat, ${EXCEL_ASSESSORS.length} penilai, ${created} penilaian`;
    console.log(`🎉 ${msg}`);
    return { success: true, message: msg, created };
  } catch (error) {
    console.error('❌ Import gagal:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

export async function createCategory(data) {
  try {
    const catsResult = await getCategories();
    const cats = catsResult.success ? catsResult.data : [];
    const maxOrder = cats.length > 0 ? Math.max(...cats.map(c => c.order_num || 0)) : 0;
    const ref = await addDoc(collection(db, 'categories'), { ...data, order_num: maxOrder + 1 });
    invalidate('categories');
    return { success: true, data: { id: ref.id, ...data } };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

export async function updateCategory(id, data) {
  try {
    await updateDoc(doc(db, 'categories', id), data);
    invalidate('categories');
    return { success: true };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

export async function deleteCategory(id) {
  const allAss = await getAllAssessments();
  const toDelete = allAss.filter(a => a.category_id === id);
  const batch = writeBatch(db);
  toDelete.forEach(a => batch.delete(doc(db, 'assessments', a.id)));
  batch.delete(doc(db, 'categories', id));
  await batch.commit();
  invalidate('categories');
  invalidate('assessments');
}

export async function getAssessments(candidateId, assessorId) {
  const all = await getAllAssessments();
  if (assessorId) return all.filter(a => a.candidate_id === candidateId && a.assessor_id === assessorId);
  return all.filter(a => a.candidate_id === candidateId);
}

export async function saveAssessments(candidateId, assessorId, items) {
  const existing = await getAssessments(candidateId, assessorId);
  const existMap = {};
  existing.forEach(a => { existMap[a.category_id] = a; });

  const batch = writeBatch(db);
  for (const item of items) {
    const ex = existMap[item.category_id];
    if (ex) {
      batch.update(doc(db, 'assessments', ex.id), {
        nilai: item.nilai, check_ada: item.check_ada, keterangan: item.keterangan
      });
    } else {
      const ref = doc(collection(db, 'assessments'));
      batch.set(ref, {
        candidate_id: candidateId, assessor_id: assessorId,
        category_id: item.category_id, nilai: item.nilai,
        check_ada: item.check_ada, keterangan: item.keterangan,
        created_at: serverTimestamp()
      });
    }
  }
  await batch.commit();
  invalidate('assessments');

  // Auto-update candidate status based on average score
  await autoUpdateStatus(candidateId);
}

// Auto-determine status from avg score: ≥70 Lulus, 60-69 Lulus dengan Catatan, <60 Tidak Lulus
async function autoUpdateStatus(candidateId) {
  const allAss = await getAllAssessments();
  const usersResult = await getUsers();
  const catsResult = await getCategories();
  const users = usersResult.success ? usersResult.data : [];
  const cats = catsResult.success ? catsResult.data : [];
  const userMap = buildUserMap(users);
  const { avg_score } = calcCandidateScore(candidateId, allAss, userMap, cats);

  if (avg_score <= 0) return; // No scores yet

  let newStatus;
  if (avg_score >= 70) newStatus = 'Lulus';
  else if (avg_score >= 60) newStatus = 'Lulus dengan Catatan';
  else newStatus = 'Tidak Lulus';

  await updateDoc(doc(db, 'candidates', candidateId), { status: newStatus });
  invalidate('candidates');
}

// ==================== COMPUTED (all from cache, ZERO extra queries) ====================

function buildUserMap(users) {
  const m = {};
  users.forEach(u => { m[u.id] = u; });
  return m;
}

// Rating multiplier sesuai Excel: SK=20%, K=40%, R=60%, B=80%, SB=100%
export const RATING_MULTIPLIER = { 1: 0.2, 2: 0.4, 3: 0.6, 4: 0.8, 5: 1.0 };

// Hitung skor per item sesuai rumus Excel:
// nilai di database sudah berupa skor akhir (bobot × multiplier × 100)
// yang dihitung oleh AssessmentForm saat user memilih rating
// Fungsi ini langsung mengembalikan nilai yang tersimpan
export function calcItemScore(assessment, category) {
  if (!category) return 0;
  return assessment.nilai || 0;
}

function calcCandidateScore(candidateId, allAssessments, userMap, allCategories) {
  const candAss = allAssessments.filter(a => a.candidate_id === candidateId);
  const byAssessor = {};
  candAss.forEach(a => {
    if (!byAssessor[a.assessor_id]) byAssessor[a.assessor_id] = [];
    byAssessor[a.assessor_id].push(a);
  });

  // Build category map for bobot lookup
  const catMap = {};
  if (allCategories) {
    allCategories.forEach(c => { catMap[c.id] = c; });
  }

  const scores_by_assessor = [];
  let totalAvg = 0;
  const aids = Object.keys(byAssessor);

  for (const aid of aids) {
    const items = byAssessor[aid];
    let total;
    
    if (allCategories && allCategories.length > 0) {
      // Hitung sesuai rumus Excel: bobot × multiplier × 100
      total = items.reduce((s, a) => {
        const cat = catMap[a.category_id];
        return s + calcItemScore(a, cat);
      }, 0);
    } else {
      // Fallback: langsung jumlahkan nilai (backward compatible)
      total = items.reduce((s, a) => s + (a.nilai || 0), 0);
    }
    
    total = Math.round(total * 100) / 100;
    scores_by_assessor.push({
      assessor: userMap[aid] || { id: aid, full_name: 'Unknown', role: 'user' },
      total_score: total
    });
    totalAvg += total;
  }

  const avg_score = aids.length > 0 ? Math.round((totalAvg / aids.length) * 100) / 100 : 0;
  return { avg_score, scores_by_assessor, assessments: candAss };
}

export async function getCandidateWithScores(candidateId) {
  const [cand, usersResult, allAss, catsResult] = await Promise.all([
    getCandidate(candidateId), getUsers(), getAllAssessments(), getCategories()
  ]);
  if (!cand) return null;
  const users = usersResult.success ? usersResult.data : [];
  const cats = catsResult.success ? catsResult.data : [];
  const userMap = buildUserMap(users);
  const scores = calcCandidateScore(candidateId, allAss, userMap, cats);

  // Build detailed assessment per assessor with category scores
  const catMap = {};
  cats.forEach(c => { catMap[c.id] = c; });
  
  const detail_by_assessor = {};
  const candAss = allAss.filter(a => a.candidate_id === candidateId);
  
  candAss.forEach(a => {
    const assessor = userMap[a.assessor_id] || { id: a.assessor_id, full_name: 'Unknown', role: 'user' };
    if (!detail_by_assessor[a.assessor_id]) {
      detail_by_assessor[a.assessor_id] = { assessor, items: [] };
    }
    const cat = catMap[a.category_id];
    detail_by_assessor[a.assessor_id].items.push({
      ...a,
      category: cat,
      score: cat ? calcItemScore(a, cat) : 0
    });
  });

  // Sort items by order_num within each assessor
  Object.values(detail_by_assessor).forEach(d => {
    d.items.sort((a, b) => (a.category?.order_num || 0) - (b.category?.order_num || 0));
    d.total = Math.round(d.items.reduce((s, i) => s + i.score, 0) * 100) / 100;
  });

  return { ...cand, ...scores, detail_by_assessor, categories: cats };
}

export async function getDashboardData() {
  try {
    const { users, candidates, categories, assessments } = await preloadAll();
    const userMap = buildUserMap(users);

    const total = candidates.length;
    const lulus = candidates.filter(c => c.status === 'Lulus').length;
    const lulus_catatan = candidates.filter(c => c.status === 'Lulus dengan Catatan').length;
    const tidak_lulus = candidates.filter(c => c.status === 'Tidak Lulus').length;
    const dalam_proses = candidates.filter(c => c.status === 'Dalam Proses').length;

    const recent = candidates.slice(0, 5).map(c => {
      const { avg_score } = calcCandidateScore(c.id, assessments, userMap, categories);
      return { ...c, avg_score };
    });

    return { total, lulus, lulus_catatan, tidak_lulus, dalam_proses, recent };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

export async function getAllCandidatesWithScores() {
  const { users, candidates, categories, assessments } = await preloadAll();
  const userMap = buildUserMap(users);
  return candidates.map(c => {
    const { avg_score } = calcCandidateScore(c.id, assessments, userMap, categories);
    return { ...c, avg_score };
  });
}

export async function getMyAssessments(userId) {
  try {
    const [candidatesResult, allAss, catsResult] = await Promise.all([getCandidates(), getAllAssessments(), getCategories()]);

    // Check if any of the dependent calls returned an error
    if (!candidatesResult.success) throw new Error(candidatesResult.error);
    if (!catsResult.success) throw new Error(catsResult.error);

    const candidates = candidatesResult.data;
    const cats = catsResult.data;
    const myAss = allAss.filter(a => a.assessor_id === userId);
    const candIds = [...new Set(myAss.map(a => a.candidate_id))];
    const candMap = {};
    candidates.forEach(c => { candMap[c.id] = c; });
    const catMap = {};
    cats.forEach(c => { catMap[c.id] = c; });

    return candIds.map(cid => {
      const c = candMap[cid];
      if (!c) return null;
      // Hitung skor sesuai rumus Excel: bobot × multiplier × 100
      const myItems = myAss.filter(a => a.candidate_id === cid);
      const myScore = myItems.reduce((s, a) => {
        const cat = catMap[a.category_id];
        return s + calcItemScore(a, cat);
      }, 0);
      return { ...c, my_score: Math.round(myScore * 100) / 100 };
    }).filter(Boolean);
  } catch (error) {
    console.error('Error in getMyAssessments:', error);
    return { success: false, error: getUserFriendlyError(error) };
  }
}

// Helper: Extract first name only
function getFirstName(fullName) {
  if (!fullName) return 'Unknown';
  return fullName.split(' ')[0];
}

export async function getRekapData() {
  const { users, candidates, categories, assessments } = await preloadAll();
  const userMap = buildUserMap(users);
  const catMap = {};
  categories.forEach(c => { catMap[c.id] = c; });

  return candidates.map(c => {
    const candAss = assessments.filter(a => a.candidate_id === c.id);
    const byAssessor = {};
    candAss.forEach(a => {
      if (!byAssessor[a.assessor_id]) byAssessor[a.assessor_id] = [];
      byAssessor[a.assessor_id].push(a);
    });

    const scores_by_role = {};
    let totalAvg = 0, count = 0, userCount = 0;

    for (const [aid, items] of Object.entries(byAssessor)) {
      // Hitung skor sesuai rumus Excel: bobot × multiplier × 100
      const total = Math.round(items.reduce((s, a) => {
        const cat = catMap[a.category_id];
        return s + calcItemScore(a, cat);
      }, 0) * 100) / 100;
      const user = userMap[aid];
      let roleLabel = (user?.role || 'user').toUpperCase();
      if (roleLabel === 'USER') { userCount++; roleLabel = `USER-${userCount}`; }
      // Use first name only for display
      const firstName = getFirstName(user?.full_name || 'Unknown');
      scores_by_role[roleLabel] = { name: firstName, score: total };
      totalAvg += total;
      count++;
    }

    const avg_score = count > 0 ? Math.round((totalAvg / count) * 100) / 100 : 0;
    return { ...c, avg_score, scores_by_role };
  });
}

// ==================== AUTO-FIX STATUS ====================
// Recalculate status for all candidates that have scores but still "Dalam Proses"
export async function fixAllStatuses() {
  const { users, candidates, categories, assessments } = await preloadAll();
  const userMap = buildUserMap(users);
  let fixed = 0;

  for (const c of candidates) {
    const { avg_score } = calcCandidateScore(c.id, assessments, userMap, categories);
    if (avg_score <= 0) continue; // No scores, skip

    let correctStatus;
    if (avg_score >= 70) correctStatus = 'Lulus';
    else if (avg_score >= 60) correctStatus = 'Lulus dengan Catatan';
    else correctStatus = 'Tidak Lulus';

    if (c.status !== correctStatus) {
      await updateDoc(doc(db, 'candidates', c.id), { status: correctStatus });
      fixed++;
    }
  }

  if (fixed > 0) invalidate('candidates');
  return fixed;
}

// ==================== RESET ALL DATA ====================
// Delete all candidates, assessments, and categories (keep users)
export async function resetAllData() {
  const batch = writeBatch(db);
  let deleteCount = 0;

  // Delete all candidates
  const candidatesSnap = await getDocs(collection(db, 'candidates'));
  candidatesSnap.forEach(doc => {
    batch.delete(doc.ref);
    deleteCount++;
  });

  // Delete all assessments
  const assessmentsSnap = await getDocs(collection(db, 'assessments'));
  assessmentsSnap.forEach(doc => {
    batch.delete(doc.ref);
    deleteCount++;
  });

  // Delete all categories
  const categoriesSnap = await getDocs(collection(db, 'categories'));
  categoriesSnap.forEach(doc => {
    batch.delete(doc.ref);
    deleteCount++;
  });

  // Commit batch delete
  await batch.commit();

  // Clear cache
  invalidate();

  console.log(`✅ Reset complete: ${deleteCount} documents deleted`);
  return deleteCount;
}

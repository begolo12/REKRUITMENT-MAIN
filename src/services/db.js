import { db } from '../firebase';
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, writeBatch, serverTimestamp
} from 'firebase/firestore';

// ==================== IN-MEMORY CACHE ====================
// Prevents repeated Firestore reads. Invalidated on writes.
const cache = { users: null, candidates: null, categories: null, assessments: null, ts: 0 };
const CACHE_TTL = 60000; // 1 minute

function invalidate(key) {
  if (key) cache[key] = null;
  else { cache.users = null; cache.candidates = null; cache.categories = null; cache.assessments = null; }
}

// Export function to clear categories cache
export function clearCategoriesCache() {
  cache.categories = null;
}

// ==================== BULK LOADERS (single query each) ====================

export async function getUsers() {
  if (cache.users) return cache.users;
  const snap = await getDocs(collection(db, 'users'));
  cache.users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return cache.users;
}

export async function getCandidates() {
  if (cache.candidates) return cache.candidates;
  const snap = await getDocs(collection(db, 'candidates'));
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  list.sort((a, b) => {
    const ta = a.created_at?.toDate?.() || a.created_at || 0;
    const tb = b.created_at?.toDate?.() || b.created_at || 0;
    return tb - ta;
  });
  cache.candidates = list;
  return cache.candidates;
}

export async function getCategories(forceRefresh = false) {
  if (cache.categories && !forceRefresh) return cache.categories;
  const snap = await getDocs(collection(db, 'categories'));
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  list.sort((a, b) => (a.order_num || 0) - (b.order_num || 0));
  cache.categories = list;
  return cache.categories;
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
  return { users: u, candidates: c, categories: cat, assessments: a };
}

// ==================== SINGLE ITEM GETTERS ====================

export async function getUserByUsername(username) {
  const users = await getUsers();
  return users.find(u => u.username === username) || null;
}

export async function getUserById(id) {
  const users = await getUsers();
  return users.find(u => u.id === id) || null;
}

export async function getCandidate(id) {
  const cands = await getCandidates();
  return cands.find(c => c.id === id) || null;
}

// ==================== WRITE OPERATIONS (invalidate cache) ====================

// Simple hash function for passwords (in production, use bcrypt)
function hashPassword(password) {
  // This is a basic hash - in production use proper bcrypt
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hash_' + Math.abs(hash).toString(16);
}

export async function createUser(data) {
  const ref = await addDoc(collection(db, 'users'), {
    username: data.username.toLowerCase().trim(),
    password: hashPassword(data.password),
    full_name: data.full_name.trim(),
    role: data.role || 'user',
    created_at: serverTimestamp()
  });
  invalidate('users');
  return { id: ref.id, ...data };
}

export async function updateUser(id, data) {
  // Hash password if it's being updated
  const updateData = { ...data };
  if (data.password) {
    updateData.password = hashPassword(data.password);
  }
  await updateDoc(doc(db, 'users', id), updateData);
  invalidate('users');
}

// Validate user credentials with hashed password
export async function validateUser(username, password) {
  const users = await getUsers();
  const user = users.find(u => u.username === username.toLowerCase().trim());
  if (!user) return null;
  if (user.password !== hashPassword(password)) return null;
  return user;
}

export async function deleteUser(id) {
  await deleteDoc(doc(db, 'users', id));
  invalidate('users');
}

export async function createCandidate(data) {
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
}

export async function updateCandidate(id, data) {
  await updateDoc(doc(db, 'candidates', id), data);
  invalidate('candidates');
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

export async function createCategory(data) {
  const cats = await getCategories();
  const maxOrder = cats.length > 0 ? Math.max(...cats.map(c => c.order_num || 0)) : 0;
  const ref = await addDoc(collection(db, 'categories'), { ...data, order_num: maxOrder + 1 });
  invalidate('categories');
  return { id: ref.id, ...data };
}

export async function updateCategory(id, data) {
  await updateDoc(doc(db, 'categories', id), data);
  invalidate('categories');
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
  const users = await getUsers();
  const userMap = buildUserMap(users);
  const { avg_score } = calcCandidateScore(candidateId, allAss, userMap);

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

function calcCandidateScore(candidateId, allAssessments, userMap) {
  const candAss = allAssessments.filter(a => a.candidate_id === candidateId);
  const byAssessor = {};
  candAss.forEach(a => {
    if (!byAssessor[a.assessor_id]) byAssessor[a.assessor_id] = [];
    byAssessor[a.assessor_id].push(a);
  });

  const scores_by_assessor = [];
  let totalAvg = 0;
  const aids = Object.keys(byAssessor);

  for (const aid of aids) {
    const items = byAssessor[aid];
    const total = Math.round(items.reduce((s, a) => s + (a.nilai || 0), 0) * 100) / 100;
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
  const [cand, users, allAss] = await Promise.all([
    getCandidate(candidateId), getUsers(), getAllAssessments()
  ]);
  if (!cand) return null;
  const userMap = buildUserMap(users);
  const scores = calcCandidateScore(candidateId, allAss, userMap);
  return { ...cand, ...scores };
}

export async function getDashboardData() {
  const { users, candidates, assessments } = await preloadAll();
  const userMap = buildUserMap(users);

  const total = candidates.length;
  const lulus = candidates.filter(c => c.status === 'Lulus').length;
  const lulus_catatan = candidates.filter(c => c.status === 'Lulus dengan Catatan').length;
  const tidak_lulus = candidates.filter(c => c.status === 'Tidak Lulus').length;
  const dalam_proses = candidates.filter(c => c.status === 'Dalam Proses').length;

  const recent = candidates.slice(0, 5).map(c => {
    const { avg_score } = calcCandidateScore(c.id, assessments, userMap);
    return { ...c, avg_score };
  });

  return { total, lulus, lulus_catatan, tidak_lulus, dalam_proses, recent };
}

export async function getAllCandidatesWithScores() {
  const { users, candidates, assessments } = await preloadAll();
  const userMap = buildUserMap(users);
  return candidates.map(c => {
    const { avg_score } = calcCandidateScore(c.id, assessments, userMap);
    return { ...c, avg_score };
  });
}

export async function getMyAssessments(userId) {
  try {
    const [candidates, allAss] = await Promise.all([getCandidates(), getAllAssessments()]);
    const myAss = allAss.filter(a => a.assessor_id === userId);
    const candIds = [...new Set(myAss.map(a => a.candidate_id))];
    const candMap = {};
    candidates.forEach(c => { candMap[c.id] = c; });

    return candIds.map(cid => {
      const c = candMap[cid];
      if (!c) return null;
      const myScore = myAss.filter(a => a.candidate_id === cid).reduce((s, a) => s + (a.nilai || 0), 0);
      return { ...c, my_score: Math.round(myScore * 100) / 100 };
    }).filter(Boolean);
  } catch (error) {
    console.error('Error in getMyAssessments:', error);
    throw new Error('Gagal memuat penilaian: ' + error.message);
  }
}

export async function getRekapData() {
  const { users, candidates, assessments } = await preloadAll();
  const userMap = buildUserMap(users);

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
      const total = Math.round(items.reduce((s, a) => s + (a.nilai || 0), 0) * 100) / 100;
      const user = userMap[aid];
      let roleLabel = (user?.role || 'user').toUpperCase();
      if (roleLabel === 'USER') { userCount++; roleLabel = `USER-${userCount}`; }
      scores_by_role[roleLabel] = { name: user?.full_name || 'Unknown', score: total };
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
  const { users, candidates, assessments } = await preloadAll();
  const userMap = buildUserMap(users);
  let fixed = 0;

  for (const c of candidates) {
    const { avg_score } = calcCandidateScore(c.id, assessments, userMap);
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

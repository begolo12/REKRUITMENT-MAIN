import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load Service Account
const serviceAccount = JSON.parse(
  readFileSync('./rekrutment-75ef9-firebase-adminsdk-fbsvc-7ef50508c6.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Import Data from the extracted JS file
const excelDataFile = readFileSync('./src/scripts/excel_data.js', 'utf8');
// Remove the export statement and use var so eval works
const jsCode = excelDataFile.replace('export const', 'var');
eval(jsCode);
console.log(`📊 Loaded ${EXCEL_ASSESSMENTS.length} assessment sets from excel_data.js`);

async function sync() {
  console.log('🚀 Starting direct Firebase sync...');

  try {
    // 1. Get Categories
    const catSnap = await db.collection('categories').get();
    const categories = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const kodeMap = {};
    categories.forEach(c => { kodeMap[c.kode] = c.id; });

    // 2. Clear existing assessments for clean sync (batch max 500)
    console.log('🗑️ Cleaning old assessments...');
    const assSnap = await db.collection('assessments').get();
    const allDocs = assSnap.docs;
    for (let i = 0; i < allDocs.length; i += 400) {
      const chunk = allDocs.slice(i, i + 400);
      const delBatch = db.batch();
      chunk.forEach(d => delBatch.delete(d.ref));
      await delBatch.commit();
    }
    console.log(`✅ Deleted ${allDocs.length} old assessments.`);

    // 3. Define Assessors and Candidates
    const ASSESSORS = [
      { username: 'wahyu', full_name: 'Wahyu M. Pungki', role: 'user' },
      { username: 'urip', full_name: 'Urip', role: 'user' },
      { username: 'anggy', full_name: 'Anggy Permana Putra', role: 'hr' },
      { username: 'muchlis', full_name: 'Muchlis Arif', role: 'user' },
    ];

    const CANDIDATES = [
      { nama: 'Deny Ferdiansyah', posisi: 'Staff Operasi', penempatan: 'IKN - Kalimantan Timur' },
      { nama: 'Ilham Ambia Putra', posisi: 'Staff Operasi', penempatan: 'IKN - Kalimantan Timur' },
      { nama: 'Mohamad Dicky', posisi: 'Staff Operasi', penempatan: 'IKN - Kalimantan Timur' },
      { nama: 'M. Doni Waseso', posisi: 'Staff Operasi', penempatan: 'IKN - Kalimantan Timur' },
    ];

    // 4. Map or Create Users
    const userIds = {};
    const userSnap = await db.collection('users').get();
    const existingUsers = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    for (const a of ASSESSORS) {
      const existing = existingUsers.find(u => u.username === a.username);
      if (existing) {
        userIds[a.username] = existing.id;
      } else {
        const ref = await db.collection('users').add({
          ...a,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        userIds[a.username] = ref.id;
      }
    }

    // 5. Map or Create Candidates
    const candIds = {};
    const candSnap = await db.collection('candidates').get();
    const existingCands = candSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    for (const c of CANDIDATES) {
      const existing = existingCands.find(cand => cand.nama === c.nama);
      if (existing) {
        candIds[c.nama] = existing.id;
      } else {
        const ref = await db.collection('candidates').add({
          ...c,
          status: 'Dalam Proses',
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        candIds[c.nama] = ref.id;
      }
    }

    // 6. Import Assessments
    let count = 0;
    for (const ass of EXCEL_ASSESSMENTS) {
      const aid = userIds[ass.penilai];
      const cid = candIds[ass.kandidat];
      
      if (!aid || !cid) continue;

      const batch = db.batch();
      for (const score of ass.scores) {
        const catId = kodeMap[score.kode];
        if (!catId) continue;

        const ref = db.collection('assessments').doc();
        batch.set(ref, {
          candidate_id: cid,
          assessor_id: aid,
          category_id: catId,
          nilai: Math.round(score.nilai * 100) / 100,
          check_ada: score.check_ada || false,
          is_final_score: true,
          keterangan: score.keterangan || '',
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        count++;
      }
      await batch.commit();
      console.log(`✅ Sync: ${ass.penilai} -> ${ass.kandidat}`);
    }

    console.log(`\n✨ SUCCESS! Synced ${count} assessment points to Firebase.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

sync();

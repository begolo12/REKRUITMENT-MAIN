/**
 * Direct Firebase sync script (CommonJS)
 * Pushes Excel data directly to Firestore using Admin SDK
 */
const admin = require('firebase-admin');
const fs = require('fs');

// Load Service Account
const serviceAccount = JSON.parse(
  fs.readFileSync('./rekrutment-75ef9-firebase-adminsdk-fbsvc-7ef50508c6.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load Excel data
const excelDataFile = fs.readFileSync('./src/scripts/excel_data.js', 'utf8');
const jsCode = excelDataFile.replace('export const', 'var');
eval(jsCode);
console.log(`📊 Loaded ${EXCEL_ASSESSMENTS.length} assessment sets`);

// Assessors & Candidates
const ASSESSORS = [
  { username: 'wahyu', full_name: 'Wahyu M. Pungki', role: 'user' },
  { username: 'urip', full_name: 'Urip Mukhtar', role: 'user' },
  { username: 'anggy', full_name: 'Anggy Permana Putra', role: 'hr' },
  { username: 'muchlis', full_name: 'Muchlis Arif Santoso', role: 'user' },
];

const CANDIDATES = [
  { nama: 'Deny Ferdiansyah', posisi: 'Staff Operasi', penempatan: 'IKN - Kalimantan Timur', divisi: 'Operasi', budget_salary: 'Range 4 JT - 4,8 JT (All In - IKN)' },
  { nama: 'Ilham Ambia Putra', posisi: 'Staff Operasi', penempatan: 'IKN - Kalimantan Timur', divisi: 'Operasi', budget_salary: 'Range 4 JT - 4,8 JT (All In - IKN)' },
  { nama: 'Mohamad Dicky', posisi: 'Staff Operasi', penempatan: 'IKN - Kalimantan Timur', divisi: 'Operasi', budget_salary: 'Range 4 JT - 4,8 JT (All In - IKN)' },
  { nama: 'M. Doni Waseso', posisi: 'Staff Operasi', penempatan: 'IKN - Kalimantan Timur', divisi: 'Operasi', budget_salary: 'Range 4 JT - 4,8 JT (All In - IKN)' },
];

async function sync() {
  console.log('🚀 Starting direct Firebase sync...\n');

  try {
    // 1. Get Categories
    const catSnap = await db.collection('categories').get();
    const categories = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`📋 Found ${categories.length} categories`);
    
    if (categories.length === 0) {
      console.error('❌ No categories found! Seed categories first.');
      process.exit(1);
    }
    
    const kodeMap = {};
    categories.forEach(c => { kodeMap[c.kode] = c.id; });
    console.log('   Kodes:', Object.keys(kodeMap).join(', '));

    // 2. Delete ALL existing assessments (batch max 500)
    console.log('\n🗑️ Cleaning old assessments...');
    const assSnap = await db.collection('assessments').get();
    const allDocs = assSnap.docs;
    for (let i = 0; i < allDocs.length; i += 400) {
      const chunk = allDocs.slice(i, i + 400);
      const delBatch = db.batch();
      chunk.forEach(d => delBatch.delete(d.ref));
      await delBatch.commit();
    }
    console.log(`   Deleted ${allDocs.length} old assessments`);

    // 3. Map existing users by username
    const userSnap = await db.collection('users').get();
    const existingUsers = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const userIds = {};
    
    for (const a of ASSESSORS) {
      const existing = existingUsers.find(u => u.username === a.username);
      if (existing) {
        userIds[a.username] = existing.id;
        console.log(`👤 Found user: ${a.username} (${existing.id})`);
      } else {
        const ref = await db.collection('users').add({
          username: a.username,
          full_name: a.full_name,
          role: a.role,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        userIds[a.username] = ref.id;
        console.log(`👤 Created user: ${a.username} (${ref.id})`);
      }
    }

    // 4. Map existing candidates by name
    const candSnap = await db.collection('candidates').get();
    const existingCands = candSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const candIds = {};
    
    for (const c of CANDIDATES) {
      const existing = existingCands.find(cand => cand.nama === c.nama);
      if (existing) {
        candIds[c.nama] = existing.id;
        console.log(`📝 Found candidate: ${c.nama} (${existing.id})`);
      } else {
        const ref = await db.collection('candidates').add({
          ...c,
          status: 'Dalam Proses',
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        candIds[c.nama] = ref.id;
        console.log(`📝 Created candidate: ${c.nama} (${ref.id})`);
      }
    }

    // 5. Import all assessments with is_final_score flag
    console.log('\n📊 Importing assessments...');
    let totalCount = 0;
    
    for (const ass of EXCEL_ASSESSMENTS) {
      const aid = userIds[ass.penilai];
      const cid = candIds[ass.kandidat];
      
      if (!aid || !cid) {
        console.warn(`⚠️ Skip: ${ass.penilai} -> ${ass.kandidat} (user/candidate not found)`);
        continue;
      }

      const batch = db.batch();
      let batchCount = 0;
      
      for (const score of ass.scores) {
        const catId = kodeMap[score.kode];
        if (!catId) {
          console.warn(`   ⚠️ Category ${score.kode} not found!`);
          continue;
        }

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
        batchCount++;
      }
      
      await batch.commit();
      const total = ass.scores.reduce((s, x) => s + x.nilai, 0);
      console.log(`   ✅ ${ass.penilai} -> ${ass.kandidat}: ${batchCount} items (total: ${Math.round(total * 100) / 100})`);
      totalCount += batchCount;
    }

    // 6. Update candidate statuses based on average scores
    console.log('\n📊 Updating candidate statuses...');
    for (const c of CANDIDATES) {
      const cid = candIds[c.nama];
      if (!cid) continue;
      
      // Get all assessments for this candidate
      const candAssSnap = await db.collection('assessments').where('candidate_id', '==', cid).get();
      const candAss = candAssSnap.docs.map(d => d.data());
      
      // Group by assessor
      const byAssessor = {};
      candAss.forEach(a => {
        if (!byAssessor[a.assessor_id]) byAssessor[a.assessor_id] = [];
        byAssessor[a.assessor_id].push(a);
      });
      
      // Calculate average
      const assessorTotals = Object.values(byAssessor).map(items => 
        items.reduce((s, a) => s + (a.nilai || 0), 0)
      );
      const avg = assessorTotals.length > 0 
        ? Math.round((assessorTotals.reduce((s, t) => s + t, 0) / assessorTotals.length) * 100) / 100 
        : 0;
      
      let status;
      if (avg >= 70) status = 'Lulus';
      else if (avg >= 60) status = 'Lulus dengan Catatan';
      else status = 'Tidak Lulus';
      
      await db.collection('candidates').doc(cid).update({ status });
      console.log(`   ${c.nama}: avg=${avg} -> ${status}`);
    }

    console.log(`\n✨ SUCCESS! Synced ${totalCount} assessment records to Firebase.`);
    console.log('🔄 Refresh your browser to see the updated data.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

sync();

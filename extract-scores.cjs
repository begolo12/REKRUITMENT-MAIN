/**
 * Script untuk mengekstrak semua skor dari file Excel
 * dan menghasilkan data yang siap di-paste ke db.js
 * 
 * Jalankan: node extract-scores.js
 */
const XLSX = require('xlsx');

const files = [
  { file: 'RECRUITMENT OPERASI - 28 APRIL 2026 - WAHYU M. PUNGKI.xlsx', pd: 'wahyu' },
  { file: 'HASIL RECRUITMENT REKRUITMENT URIP.xlsx', pd: 'urip' },
  { file: 'REKRUITMEN - ANGGY.xlsx', pd: 'anggy' },
  { file: 'HASIL REKRUITMENT - MUCHLIS ARIF.xlsx', pd: 'muchlis' },
];

const SKIP_KODES = ['C100', 'D100']; // Section headers, not questions

// Normalize candidate names
const CANDIDATE_NAME_MAP = {
  'DENY FERDIANSYAH': 'Deny Ferdiansyah',
  'ILHAM AMBIA PUTRA': 'Ilham Ambia Putra',
  'MOHAMAD DICKY': 'Mohamad Dicky',
  'M. DONI WASESO': 'M. Doni Waseso',
  'DONI WASESO': 'M. Doni Waseso',
  'MUHAMMAD DONNY WASESO': 'M. Doni Waseso',
  'M. DONY WASESO': 'M. Doni Waseso',
};

const allAssessments = [];
const seen = new Set(); // Deduplicate

files.forEach(({ file, pd }) => {
  const wb = XLSX.readFile(file);
  
  wb.SheetNames.filter(s => s.startsWith('PENILAIAN')).forEach(s => {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[s], { header: 1 });
    
    const nama = (rows[4] && rows[4][2]) || '?';
    let penilai = (rows[9] && rows[9][2]) || pd;
    if (typeof penilai === 'number') penilai = pd; // Sometimes salary number appears
    const role = ((rows[9] && rows[9][3]) || 'USER').replace(/[()]/g, '');
    const totalSkor = (rows[10] && rows[10][2]) || 0;
    
    if (totalSkor === 0) return; // Skip empty assessments
    
    // Determine penilai username
    let penilaiUsername = pd;
    if (s === 'PENILAIAN-HR') penilaiUsername = 'anggy'; // HR is always Anggy
    
    const scores = [];
    
    for (let i = 14; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[0] || typeof row[0] !== 'string') continue;
      if (!/^[A-G]\d/.test(row[0])) continue;
      if (SKIP_KODES.includes(row[0])) continue;
      
      const kode = row[0];
      const bobot = row[3] || 0;
      const checkAda = row[5] === 'V';
      const checkTidak = row[6] === 'V';
      // Rating columns: [7]=SK, [8]=K, [9]=R, [10]=B, [11]=SB
      const hasil = typeof row[12] === 'number' ? Math.round(row[12] * 100) / 100 : 0;
      const keterangan = (typeof row[13] === 'string') ? row[13] : '';
      
      scores.push({
        kode,
        nilai: hasil,
        check_ada: checkAda,
        keterangan: keterangan.trim()
      });
    }
    
    const normalizedNama = CANDIDATE_NAME_MAP[nama] || nama;
    const key = penilaiUsername + '->' + normalizedNama;
    if (seen.has(key)) return; // Skip duplicates
    seen.add(key);
    
    allAssessments.push({
      penilai: penilaiUsername,
      kandidat: normalizedNama,
      totalSkor,
      scores
    });
  });
});

// Output as JavaScript code for db.js
console.log('const EXCEL_ASSESSMENTS = [');
allAssessments.forEach((a, idx) => {
  const total = a.scores.reduce((s, sc) => s + sc.nilai, 0);
  console.log(`  // === ${a.penilai.toUpperCase()} -> ${a.kandidat} === Excel Total: ${a.totalSkor}, Calculated: ${Math.round(total * 100) / 100}`);
  console.log(`  { penilai: '${a.penilai}', kandidat: '${a.kandidat}', scores: [`);
  a.scores.forEach((sc, i) => {
    const parts = [`kode: '${sc.kode}'`, `nilai: ${sc.nilai}`, `check_ada: ${sc.check_ada}`];
    if (sc.keterangan) parts.push(`keterangan: '${sc.keterangan.replace(/'/g, "\\'")}'`);
    console.log(`    { ${parts.join(', ')} }${i < a.scores.length - 1 ? ',' : ''}`);
  });
  console.log(`  ]}${idx < allAssessments.length - 1 ? ',' : ''}`);
});
console.log('];');

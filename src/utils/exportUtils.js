import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename, sheetName = 'Data') => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Auto-width columns
  const colWidths = {};
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      const value = String(row[key] || '');
      colWidths[key] = Math.max(colWidths[key] || 0, value.length, key.length);
    });
  });
  
  ws['!cols'] = Object.keys(colWidths).map((key) => ({
    wch: Math.min(colWidths[key] + 2, 50)
  }));
  
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportCandidatesToExcel = (candidates) => {
  const data = candidates.map((c, index) => ({
    'No': index + 1,
    'Nama': c.nama,
    'Posisi': c.posisi,
    'Penempatan': c.penempatan,
    'Divisi': c.divisi,
    'Budget Salary': c.budget_salary,
    'Status': c.status,
    'Skor Rata-rata': c.avg_score?.toFixed(2) || 0,
    'Tanggal Dibuat': c.created_at?.toDate?.() 
      ? c.created_at.toDate().toLocaleDateString('id-ID')
      : '-'
  }));
  
  exportToExcel(data, 'Data_Kandidat', 'Kandidat');
};

export const exportAssessmentsToExcel = (assessments, candidates, users) => {
  const candidateMap = {};
  const userMap = {};
  
  candidates.forEach(c => candidateMap[c.id] = c);
  users.forEach(u => userMap[u.id] = u);
  
  const data = assessments.map((a, index) => ({
    'No': index + 1,
    'Kandidat': candidateMap[a.candidate_id]?.nama || '-',
    'Posisi': candidateMap[a.candidate_id]?.posisi || '-',
    'Assessor': userMap[a.assessor_id]?.full_name || '-',
    'Role': userMap[a.assessor_id]?.role || '-',
    'Nilai': a.nilai?.toFixed(2) || 0,
    'Keterangan': a.keterangan || '-',
    'Tanggal': a.created_at?.toDate?.()
      ? a.created_at.toDate().toLocaleDateString('id-ID')
      : '-'
  }));
  
  exportToExcel(data, 'Data_Penilaian', 'Penilaian');
};

export const exportRekapToExcel = (data) => {
  const exportData = data.map((c, index) => {
    const row = {
      'No': index + 1,
      'Nama': c.nama,
      'Posisi': c.posisi,
      'Penempatan': c.penempatan,
      'Divisi': c.divisi,
      'Status': c.status,
      'Skor Rata-rata': c.avg_score?.toFixed(2) || 0
    };
    
    // Add scores by role
    Object.entries(c.scores_by_role || {}).forEach(([role, info]) => {
      row[`Skor ${role}`] = info.score?.toFixed(2) || 0;
    });
    
    return row;
  });
  
  exportToExcel(exportData, 'Rekap_Penilaian', 'Rekap');
};

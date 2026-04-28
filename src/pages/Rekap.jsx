import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { motion } from 'framer-motion';
import { getRekapData } from '../services/db';
import { BarChart3, FileText } from 'lucide-react';
import { SkeletonList } from '../components/Skeleton';

export default function Rekap() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    getRekapData().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const scoreClass = (s) => s >= 70 ? 's-hi' : s >= 60 ? 's-md' : 's-lo';
  const statusBadge = (s) => {
    if (s === 'Lulus') return 'badge b-ok';
    if (s === 'Lulus dengan Catatan') return 'badge b-note';
    if (s === 'Tidak Lulus') return 'badge b-no';
    return 'badge b-wait';
  };

  // Collect all unique role labels
  const allRoles = [...new Set(data.flatMap(c => Object.keys(c.scores_by_role || {})))].sort();

  const generatePDF = () => {
    let headerCols = '<th>No</th><th>Nama</th><th>Posisi</th><th>Penempatan</th>';
    allRoles.forEach(r => { headerCols += `<th style="text-align:center">${r}</th>`; });
    headerCols += '<th style="text-align:center">Rata-rata</th><th>Status</th>';

    let rows = '';
    data.forEach((c, i) => {
      let cols = `<td>${i + 1}</td><td style="font-weight:600">${c.nama}</td><td>${c.posisi}</td><td>${c.penempatan}</td>`;
      allRoles.forEach(r => {
        const s = c.scores_by_role?.[r];
        cols += `<td style="text-align:center">${s ? `${s.score.toFixed(2)}<br><span style="font-size:9px;color:#64748b">${s.name}</span>` : '-'}</td>`;
      });
      const avgColor = c.avg_score >= 70 ? '#166534' : c.avg_score >= 40 ? '#92400e' : '#991b1b';
      const avgBg = c.avg_score >= 70 ? '#dcfce7' : c.avg_score >= 40 ? '#fef3c7' : '#fee2e2';
      cols += `<td style="text-align:center;font-weight:700;color:${avgColor};background:${avgBg}">${c.avg_score.toFixed(2)}</td>`;
      cols += `<td>${c.status}</td>`;
      rows += `<tr>${cols}</tr>`;
    });

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rekap Penilaian Kandidat</title>
    <style>
      body{font-family:'Segoe UI',Arial,sans-serif;padding:30px;color:#1e293b;font-size:11px;}
      h1{font-size:16px;color:#1e1b4b;margin-bottom:4px;}
      p.sub{color:#64748b;font-size:11px;margin-bottom:16px;}
      table{width:100%;border-collapse:collapse;}
      th{background:#f1f5f9;color:#64748b;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;padding:8px 6px;text-align:left;border-bottom:2px solid #e2e8f0;white-space:nowrap;}
      td{padding:6px;border-bottom:1px solid #f1f5f9;font-size:10px;vertical-align:top;}
      tr:hover{background:#f8fafc;}
      .footer{margin-top:24px;text-align:center;color:#94a3b8;font-size:9px;}
      @media print{body{padding:15px;} button{display:none!important;} table{font-size:9px;} th,td{padding:4px;}}
    </style></head><body>
    <h1>REKAP PENILAIAN KANDIDAT</h1>
    <p class="sub">Daniswara Group — Recruitment System | Dicetak: ${new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
    <table><thead><tr>${headerCols}</tr></thead><tbody>${rows}</tbody></table>
    <div class="footer">Total ${data.length} kandidat | Daniswara Group Recruitment System</div>
    <button onclick="window.print()" style="position:fixed;bottom:20px;right:20px;padding:10px 24px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:600;">🖨️ Cetak PDF</button>
    </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  };

  if (loading) return <SkeletonList />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
      style={{ padding: 0 }}
    >
      {/* Premium Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
        borderRadius: isMobile ? '16px' : '24px',
        padding: isMobile ? '20px' : '40px 48px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 60px -20px rgba(15, 23, 42, 0.3)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '16px' : '0'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: isMobile ? '1.25rem' : '1.75rem', 
            fontWeight: 800, 
            margin: '0 0 8px 0',
            color: '#fff',
            letterSpacing: '-0.02em'
          }}>
            Rekap Penilaian
          </h1>
          <p style={{ 
            margin: 0, 
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.95rem'
          }}>
            {data.length} kandidat · Ringkasan penilaian lengkap
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={generatePDF}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: isMobile ? '12px 16px' : '14px 28px',
            width: isMobile ? '100%' : 'auto',
            background: '#ffffff',
            color: '#0f172a',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
            boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <FileText size={20} strokeWidth={2.5} />
          Download PDF
        </motion.button>
      </div>

      {/* Premium Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: isMobile ? '16px' : '24px',
        padding: '28px',
        boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)',
        border: '1px solid rgba(226, 232, 240, 0.6)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Posisi</th>
                <th>Penempatan</th>
                {allRoles.map(r => (
                  <th key={r} style={{ textAlign: 'center' }}>{r}</th>
                ))}
                <th style={{ textAlign: 'center' }}>Rata-rata</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={5 + allRoles.length} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Belum ada data</td></tr>
              ) : data.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="av">{c.nama?.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.nama}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{c.divisi}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.posisi}</td>
                  <td>{c.penempatan}</td>
                  {allRoles.map(r => {
                    const s = c.scores_by_role?.[r];
                    return (
                      <td key={r} style={{ textAlign: 'center' }}>
                        {s ? (
                          <div>
                            <span className={`score ${scoreClass(s.score)}`}>{s.score.toFixed(2)}</span>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>{s.name}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>-</span>
                        )}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center' }}>
                    <span className={`score ${scoreClass(c.avg_score)}`} style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                      {c.avg_score.toFixed(2)}
                    </span>
                  </td>
                  <td><span className={statusBadge(c.status)}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

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

  // Helper: Extract first name only
  const getFirstName = (fullName) => {
    if (!fullName) return 'Unknown';
    return fullName.split(' ')[0];
  };

  // Collect all unique role labels dengan urutan yang sesuai Excel
  const roleOrder = ['DIREKTUR', 'DIREKTUR DJP', 'DIREKTUR GAS', 'MANAGER OPERASI', 'HR', 'ADMIN'];
  const allRoles = [...new Set(data.flatMap(c => Object.keys(c.scores_by_role || {})))]
    .sort((a, b) => {
      const indexA = roleOrder.indexOf(a);
      const indexB = roleOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

  const generatePDF = () => {
    let headerCols = '<th>No</th><th>Nama</th><th>Posisi</th><th>Penempatan</th>';
    allRoles.forEach(r => { headerCols += `<th style="text-align:center">${r}</th>`; });
    headerCols += '<th style="text-align:center">Rata-rata</th><th>Status</th>';

    let rows = '';
    data.forEach((c, i) => {
      let cols = `<td>${i + 1}</td><td style="font-weight:600">${c.nama}</td><td>${c.posisi}</td><td>${c.penempatan}</td>`;
      allRoles.forEach(r => {
        const s = c.scores_by_role?.[r];
        cols += `<td style="text-align:center">${s ? `${s.score.toFixed(2)}<br><span style="font-size:9px;color:#64748b">${getFirstName(s.name)}</span>` : '-'}</td>`;
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

  // Mobile card layout
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
        style={{ padding: 0 }}
      >
        {/* Mobile Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px -20px rgba(15, 23, 42, 0.3)',
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ 
              fontSize: '1.25rem', 
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
              fontSize: '0.9rem'
            }}>
              {data.length} kandidat
            </p>
          </div>
        </div>

        {/* Mobile Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 20px' }}>
              Belum ada data
            </div>
          ) : data.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 12px -4px rgba(15, 23, 42, 0.08)',
                border: '1px solid rgba(226, 232, 240, 0.6)'
              }}
            >
              {/* Candidate Header */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '1rem'
                  }}>
                    {c.nama?.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
                      {c.nama}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {c.divisi}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '8px' }}>
                  <div>{c.posisi}</div>
                  <div style={{ color: '#94a3b8', marginTop: '2px' }}>{c.penempatan}</div>
                </div>
              </div>

              {/* Scores Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '12px',
                marginBottom: '16px',
                paddingBottom: '16px',
                borderBottom: '1px solid #f1f5f9'
              }}>
                {allRoles.map(r => {
                  const s = c.scores_by_role?.[r];
                  return (
                    <div key={r} style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', fontWeight: '500' }}>
                        {r}
                      </div>
                      {s ? (
                        <>
                          <div style={{
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            color: s.score >= 70 ? '#166534' : s.score >= 60 ? '#92400e' : '#991b1b',
                            marginBottom: '2px'
                          }}>
                            {s.score.toFixed(2)}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                            {getFirstName(s.name)}
                          </div>
                        </>
                      ) : (
                        <div style={{ color: '#cbd5e1', fontWeight: '500' }}>-</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Average & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    Rata-rata
                  </div>
                  <div style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: c.avg_score >= 70 ? '#166534' : c.avg_score >= 60 ? '#92400e' : '#991b1b'
                  }}>
                    {c.avg_score.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: c.status === 'Lulus' ? '#dcfce7' : c.status === 'Lulus dengan Catatan' ? '#fef3c7' : c.status === 'Tidak Lulus' ? '#fee2e2' : '#f3f4f6',
                    color: c.status === 'Lulus' ? '#166534' : c.status === 'Lulus dengan Catatan' ? '#92400e' : c.status === 'Tidak Lulus' ? '#991b1b' : '#6b7280'
                  }}>
                    {c.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Desktop table layout
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
        padding: isMobile ? '16px' : '28px',
        boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)',
        border: '1px solid rgba(226, 232, 240, 0.6)'
      }}>
        <style>{`
          table { width: 100%; border-collapse: collapse; }
          thead tr { background: #f8fafc; }
          th { 
            padding: 12px 10px; 
            text-align: left; 
            font-weight: 600; 
            color: #475569; 
            font-size: 0.8rem; 
            border-bottom: 2px solid #e2e8f0;
            white-space: nowrap;
          }
          th[style*="text-align: center"] { text-align: center; }
          tbody tr { border-bottom: 1px solid #f1f5f9; }
          tbody tr:hover { background: #f8fafc; }
          td { 
            padding: 12px 10px; 
            vertical-align: middle;
            height: 70px;
            display: table-cell;
          }
          td[style*="text-align: center"] { text-align: center; }
          .score { font-weight: 700; font-size: 1rem; }
          .s-hi { color: #166534; }
          .s-md { color: #92400e; }
          .s-lo { color: #991b1b; }
          .badge { 
            display: inline-block; 
            padding: 4px 12px; 
            border-radius: 6px; 
            font-size: 0.8rem; 
            font-weight: 600;
          }
          .b-ok { background: #dcfce7; color: #166534; }
          .b-note { background: #fef3c7; color: #92400e; }
          .b-no { background: #fee2e2; color: #991b1b; }
          .b-wait { background: #f3f4f6; color: #6b7280; }
          .av { 
            width: 40px; 
            height: 40px; 
            border-radius: 8px; 
            background: linear-gradient(135deg, #6366f1, #8b5cf6); 
            color: white; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: 700;
            flex-shrink: 0;
          }
          @media (max-width: 768px) {
            th, td { padding: 10px 8px; font-size: 0.75rem; }
            td { height: 65px; }
            .score { font-size: 0.9rem; }
            .av { width: 36px; height: 36px; font-size: 0.9rem; }
          }
        `}</style>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ minWidth: isMobile ? '100%' : 'auto' }}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>No</th>
                <th style={{ minWidth: '140px' }}>Nama</th>
                <th style={{ minWidth: '100px' }}>Posisi</th>
                <th style={{ minWidth: '120px' }}>Penempatan</th>
                {allRoles.map(r => (
                  <th key={r} style={{ textAlign: 'center', minWidth: '90px' }}>{r}</th>
                ))}
                <th style={{ textAlign: 'center', minWidth: '80px' }}>Rata-rata</th>
                <th style={{ minWidth: '110px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={5 + allRoles.length} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Belum ada data</td></tr>
              ) : data.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: '#475569', textAlign: 'center' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="av">{c.nama?.charAt(0)}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nama}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>{c.divisi}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.85rem' }}>{c.posisi}</td>
                  <td style={{ color: '#475569', fontSize: '0.85rem' }}>{c.penempatan}</td>
                  {allRoles.map(r => {
                    const s = c.scores_by_role?.[r];
                    return (
                      <td key={r} style={{ textAlign: 'center' }}>
                        {s ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, justifyContent: 'center', height: '100%' }}>
                            <span className={`score ${scoreClass(s.score)}`}>{s.score.toFixed(2)}</span>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{getFirstName(s.name)}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontWeight: 500 }}>-</span>
                        )}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center' }}>
                    <span className={`score ${scoreClass(c.avg_score)}`} style={{ fontSize: '1rem' }}>
                      {c.avg_score.toFixed(2)}
                    </span>
                  </td>
                  <td><span className={`badge ${statusBadge(c.status).split(' ').slice(1).join(' ')}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

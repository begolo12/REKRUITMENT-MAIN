import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Clock, ArrowRight, TrendingUp, Plus, FileText, ClipboardList } from 'lucide-react';
import { getDashboardData } from '../services/db';
import { SkeletonDashboard } from '../components/Skeleton';
import BentoCard from '../components/ui/BentoCard';
import { staggerContainer, staggerItem, cardHover } from '../utils/animations';

const AnimatedNumber = memo(function AnimatedNumber({ value, duration = 1.5 }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime = null;
    const startValue = 0;
    let animationId = null;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setDisplayValue(Math.floor(startValue + (value - startValue) * progress));
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animationId = requestAnimationFrame(animate);
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [value, duration]);
  
  return <span>{displayValue}</span>;
});

const StatsCard = memo(function StatsCard({ icon: Icon, label, value, trend, trendUp, color }) {
  const colorStyles = {
    primary: { 
      bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
      lightBg: '#f5f3ff',
      icon: '#4f46e5',
      glow: 'rgba(99, 102, 241, 0.15)'
    },
    success: { 
      bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
      lightBg: '#f0fdf4',
      icon: '#059669',
      glow: 'rgba(16, 185, 129, 0.15)'
    },
    warning: { 
      bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
      lightBg: '#fffbeb',
      icon: '#d97706',
      glow: 'rgba(245, 158, 11, 0.15)'
    },
    danger: { 
      bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
      lightBg: '#fef2f2',
      icon: '#dc2626',
      glow: 'rgba(239, 68, 68, 0.15)'
    },
    info: { 
      bg: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', 
      lightBg: '#f0f9ff',
      icon: '#0284c7',
      glow: 'rgba(14, 165, 233, 0.15)'
    }
  };
  
  const style = colorStyles[color] || colorStyles.primary;
  
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ 
        y: -6, 
        scale: 1.02,
        transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }
      }}
    >
      <div style={{ 
        background: '#ffffff',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: `0 8px 32px -12px ${style.glow}, 0 0 0 1px rgba(226, 232, 240, 0.6)`,
        border: '1px solid rgba(226, 232, 240, 0.6)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background glow */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${style.glow}, transparent 70%)`,
            pointerEvents: 'none'
          }} 
        />
        
        {/* Top accent line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '20px',
          right: '20px',
          height: '3px',
          background: style.bg,
          borderRadius: '0 0 4px 4px'
        }} />
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative', zIndex: 1 }}>
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: style.lightBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: style.icon,
              flexShrink: 0,
              boxShadow: `0 8px 20px -6px ${style.glow}`,
              border: '2px solid rgba(255,255,255,0.5)'
            }}
          >
            <Icon size={26} strokeWidth={2.5} />
          </motion.div>
          <div style={{ flex: 1 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.2,
                marginBottom: '6px',
                letterSpacing: '-0.02em'
              }}
            >
              <AnimatedNumber value={value} />
            </motion.div>
            <div style={{
              fontSize: '0.9rem',
              color: '#64748b',
              fontWeight: 600,
              marginBottom: trend ? '10px' : '0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {label}
            </div>
            {trend && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: trendUp ? '#059669' : '#dc2626',
                  background: trendUp ? '#d1fae5' : '#fee2e2',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  boxShadow: '0 2px 8px -2px rgba(0,0,0,0.1)'
                }}
              >
                <TrendingUp size={14} />
                {trend}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const QuickAction = memo(function QuickAction({ icon: Icon, label, onClick, color = 'primary' }) {
  const colorStyles = {
    primary: { 
      bg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #3730a3 100%)',
      shadow: '0 8px 32px -8px rgba(79, 70, 229, 0.5)',
      glow: 'rgba(79, 70, 229, 0.5)'
    },
    success: { 
      bg: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      shadow: '0 8px 32px -8px rgba(16, 185, 129, 0.5)',
      glow: 'rgba(16, 185, 129, 0.5)'
    },
    info: { 
      bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
      shadow: '0 8px 32px -8px rgba(6, 182, 212, 0.5)',
      glow: 'rgba(6, 182, 212, 0.5)'
    }
  };
  
  const style = colorStyles[color];
  
  return (
    <motion.button
      variants={staggerItem}
      whileHover={{ 
        y: -4, 
        scale: 1.03,
        boxShadow: `0 12px 40px -8px ${style.glow}`
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '18px 28px',
        background: style.bg,
        color: '#fff',
        border: 'none',
        borderRadius: '18px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: 700,
        width: '100%',
        justifyContent: 'center',
        boxShadow: style.shadow,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        }}
      />
      {/* Floating particles effect */}
      <motion.div
        animate={{ 
          y: [-2, 2, -2],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon size={22} strokeWidth={2.5} />
      </motion.div>
      <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
    </motion.button>
  );
});

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await getDashboardData();
      setData(d);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Gagal memuat data dashboard. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized helper functions
  const scoreClass = useCallback((s) => s >= 70 ? 's-hi' : s >= 60 ? 's-md' : 's-lo', []);
  const statusBadge = useCallback((s) => {
    if (s === 'Lulus') return 'badge b-ok';
    if (s === 'Lulus dengan Catatan') return 'badge b-note';
    if (s === 'Tidak Lulus') return 'badge b-no';
    return 'badge b-wait';
  }, []);

  // Memoized stats data
  const statsData = useMemo(() => {
    if (!data) return [];
    return [
      { icon: Users, label: 'Total Kandidat', value: data.total, trend: '+12% bulan ini', trendUp: true, color: 'primary' },
      { icon: UserCheck, label: 'Lulus', value: data.lulus, trend: '+5% bulan ini', trendUp: true, color: 'success' },
      { icon: UserX, label: 'Tidak Lulus', value: data.tidak_lulus, color: 'danger' },
      { icon: Clock, label: 'Dalam Proses', value: data.dalam_proses, trend: '+8% bulan ini', trendUp: true, color: 'info' }
    ];
  }, [data]);

  if (loading) return <SkeletonDashboard />;
  
  if (error) return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '40px'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        background: '#fef2f2',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <span style={{ fontSize: '40px' }}>⚠️</span>
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
        Terjadi Kesalahan
      </h3>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>{error}</p>
      <button 
        onClick={fetchData}
        style={{
          padding: '12px 24px',
          background: '#0f172a',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        Coba Lagi
      </button>
    </div>
  );

  return (
    <motion.div 
      className="dash"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Elegant Welcome Section */}
      <motion.div variants={staggerItem} style={{ marginBottom: '32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
          borderRadius: '24px',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px -20px rgba(30, 41, 59, 0.3)'
        }}>
          {/* Subtle Background Elements */}
          <div 
            style={{
              position: 'absolute',
              top: '-20%',
              right: '-5%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
              pointerEvents: 'none'
            }} 
          />
          <div 
            style={{
              position: 'absolute',
              bottom: '-30%',
              left: '-10%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(148, 163, 184, 0.06) 0%, transparent 60%)',
              pointerEvents: 'none'
            }} 
          />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                padding: '10px 20px',
                borderRadius: '999px',
                marginBottom: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <span style={{ 
                width: '8px', 
                height: '8px', 
                background: '#94a3b8', 
                borderRadius: '50%'
              }} />
              <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ 
                fontSize: '2.25rem', 
                fontWeight: 700, 
                marginBottom: '16px',
                color: '#f8fafc',
                letterSpacing: '-0.01em',
                lineHeight: 1.3
              }}
            >
              Selamat Datang Kembali
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{ 
                fontSize: '1.05rem', 
                color: 'rgba(248, 250, 252, 0.65)',
                margin: 0,
                maxWidth: '500px',
                lineHeight: 1.6,
                fontWeight: 400
              }}
            >
              Kelola proses rekrutmen dengan lebih efisien dan profesional.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        variants={staggerContainer}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        <QuickAction 
          icon={Plus} 
          label="Tambah Kandidat" 
          onClick={() => window.location.href = '/candidates'}
          color="primary"
        />
        <QuickAction 
          icon={ClipboardList} 
          label="Mulai Assessment" 
          onClick={() => window.location.href = '/my-assessments'}
          color="success"
        />
        <QuickAction 
          icon={FileText} 
          label="Export Laporan" 
          onClick={() => window.location.href = '/rekap'}
          color="info"
        />
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={staggerContainer}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        {statsData.map((stat, index) => (
          <StatsCard 
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            trendUp={stat.trendUp}
            color={stat.color}
          />
        ))}
      </motion.div>

      {/* Ultra Premium Recent Candidates Table */}
      <motion.div variants={staggerItem}>
        <div style={{
          background: '#ffffff',
          borderRadius: '28px',
          padding: '32px',
          boxShadow: '0 8px 40px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative top gradient */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #f59e0b)',
            borderRadius: '4px 4px 0 0'
          }} />
          
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
            marginTop: '4px'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  borderRadius: '50%',
                  boxShadow: '0 0 12px rgba(79, 70, 229, 0.5)'
                }} />
                Kandidat Terbaru
              </h3>
              <p style={{
                fontSize: '0.9rem',
                color: '#64748b',
                margin: 0,
                fontWeight: 500
              }}>Daftar kandidat yang baru ditambahkan</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/candidates"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#4f46e5',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                  borderRadius: '12px',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px -4px rgba(79, 70, 229, 0.3)',
                  border: '1px solid rgba(79, 70, 229, 0.1)'
                }}
              >
                Lihat Semua
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'separate',
              borderSpacing: '0',
              fontSize: '0.875rem'
            }}>
              <thead>
                <tr>
                  <th style={{ 
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#64748b',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '2px solid #f1f5f9'
                  }}>Nama</th>
                  <th style={{ 
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#64748b',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '2px solid #f1f5f9'
                  }}>Divisi</th>
                  <th style={{ 
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#64748b',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '2px solid #f1f5f9'
                  }}>Posisi</th>
                  <th style={{ 
                    padding: '14px 16px',
                    textAlign: 'center',
                    fontWeight: 600,
                    color: '#64748b',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '2px solid #f1f5f9'
                  }}>Skor</th>
                  <th style={{ 
                    padding: '14px 16px',
                    textAlign: 'center',
                    fontWeight: 600,
                    color: '#64748b',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '2px solid #f1f5f9'
                  }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ 
                      textAlign: 'center', 
                      padding: '48px',
                      color: '#64748b'
                    }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        background: '#f1f5f9',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}>
                        <Users size={28} color="#94a3b8" />
                      </div>
                      <p style={{ margin: 0, fontWeight: 500 }}>Belum ada kandidat</p>
                    </td>
                  </tr>
                ) : data.recent.map((c, index) => (
                  <motion.tr 
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ 
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ 
                      padding: '16px', 
                      borderBottom: '1px solid #f1f5f9',
                      fontWeight: 600 
                    }}>
                      <Link 
                        to={`/candidates/${c.id}`} 
                        style={{ 
                          color: '#4f46e5', 
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {c.nama.charAt(0).toUpperCase()}
                        </div>
                        {c.nama}
                      </Link>
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      color: '#334155',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      {c.divisi}
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      color: '#334155',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      {c.posisi}
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        background: c.avg_score >= 70 ? '#d1fae5' : c.avg_score >= 60 ? '#fef3c7' : '#fee2e2',
                        color: c.avg_score >= 70 ? '#059669' : c.avg_score >= 60 ? '#d97706' : '#dc2626'
                      }}>
                        {c.avg_score.toFixed(1)}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        background: c.status === 'Lulus' ? '#d1fae5' : c.status === 'Tidak Lulus' ? '#fee2e2' : '#fef3c7',
                        color: c.status === 'Lulus' ? '#059669' : c.status === 'Tidak Lulus' ? '#dc2626' : '#d97706'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'currentColor'
                        }} />
                        {c.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

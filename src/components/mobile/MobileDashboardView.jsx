import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Calendar,
  ChevronRight
} from 'lucide-react';
import MobileDataList from './MobileDataList';
import './MobileDashboardView.css';

// Stat Card Component
function StatCard({ icon: Icon, label, value, trend, trendUp, color, onClick }) {
  const colorClasses = {
    blue: { bg: '#eef2ff', icon: '#4f46e5', trend: '#166534' },
    amber: { bg: '#fffbeb', icon: '#d97706', trend: '#92400e' },
    emerald: { bg: '#ecfdf5', icon: '#059669', trend: '#166534' },
    purple: { bg: '#f5f3ff', icon: '#7c3aed', trend: '#166534' },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      className="mobile-stat-card"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      style={{ background: colors.bg }}
    >
      <div className="mobile-stat-icon" style={{ background: colors.icon }}>
        <Icon size={20} />
      </div>
      <div className="mobile-stat-content">
        <span className="mobile-stat-value">{value}</span>
        <span className="mobile-stat-label">{label}</span>
        {trend && (
          <span className="mobile-stat-trend" style={{ color: trendUp ? colors.trend : '#dc2626' }}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Recent Activity Item Component
function ActivityItem({ activity, onClick }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'candidate_added': return Users;
      case 'assessment_completed': return CheckCircle;
      case 'interview_scheduled': return Calendar;
      default: return Clock;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'candidate_added': return '#4f46e5';
      case 'assessment_completed': return '#059669';
      case 'interview_scheduled': return '#d97706';
      default: return '#64748b';
    }
  };

  const Icon = getActivityIcon(activity.type);
  const iconColor = getActivityColor(activity.type);

  return (
    <motion.div
      className="mobile-activity-item"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <div className="mobile-activity-icon" style={{ background: `${iconColor}15`, color: iconColor }}>
        <Icon size={18} />
      </div>
      <div className="mobile-activity-content">
        <p className="mobile-activity-title">{activity.title}</p>
        <p className="mobile-activity-time">{activity.time}</p>
      </div>
      <ChevronRight size={16} className="mobile-activity-arrow" />
    </motion.div>
  );
}

// Quick Action Button Component
function QuickAction({ icon: Icon, label, onClick, color }) {
  return (
    <motion.button
      className="mobile-quick-action"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{ 
        background: `linear-gradient(135deg, ${color}15, ${color}08)`,
        borderColor: `${color}30`
      }}
    >
      <div className="mobile-quick-action-icon" style={{ color }}>
        <Icon size={22} />
      </div>
      <span className="mobile-quick-action-label">{label}</span>
    </motion.button>
  );
}

export default function MobileDashboardView({ 
  stats, 
  recentActivities,
  loading,
  onRefresh,
  quickActions
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleStatClick = (statType) => {
    switch (statType) {
      case 'candidates':
        navigate('/candidates');
        break;
      case 'assessments':
        navigate('/my-assessments');
        break;
      case 'completed':
        navigate('/candidates?status=Lulus');
        break;
      case 'pending':
        navigate('/candidates?status=Dalam+Proses');
        break;
      default:
        break;
    }
  };

  const handleActivityClick = (activity) => {
    if (activity.link) {
      navigate(activity.link);
    }
  };

  const renderActivityItem = (activity) => (
    <ActivityItem 
      activity={activity} 
      onClick={() => handleActivityClick(activity)}
    />
  );

  return (
    <div className="mobile-dashboard-view">
      {/* Welcome Section */}
      <motion.div 
        className="mobile-welcome-section"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mobile-welcome-title">Dashboard</h1>
        <p className="mobile-welcome-subtitle">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="mobile-stats-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <StatCard
          icon={Users}
          label="Total Kandidat"
          value={stats?.totalCandidates || 0}
          trend={stats?.candidatesTrend}
          trendUp={stats?.candidatesTrendUp}
          color="blue"
          onClick={() => handleStatClick('candidates')}
        />
        <StatCard
          icon={FileText}
          label="Penilaian"
          value={stats?.totalAssessments || 0}
          trend={stats?.assessmentsTrend}
          trendUp={stats?.assessmentsTrendUp}
          color="amber"
          onClick={() => handleStatClick('assessments')}
        />
        <StatCard
          icon={CheckCircle}
          label="Lulus"
          value={stats?.completedAssessments || 0}
          trend={stats?.completedTrend}
          trendUp={stats?.completedTrendUp}
          color="emerald"
          onClick={() => handleStatClick('completed')}
        />
        <StatCard
          icon={Clock}
          label="Dalam Proses"
          value={stats?.pendingAssessments || 0}
          color="purple"
          onClick={() => handleStatClick('pending')}
        />
      </motion.div>

      {/* Quick Actions */}
      {quickActions && quickActions.length > 0 && (
        <motion.div 
          className="mobile-quick-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mobile-section-title">Aksi Cepat</h2>
          <div className="mobile-quick-actions-grid">
            {quickActions.map((action, index) => (
              <QuickAction
                key={index}
                icon={action.icon}
                label={action.label}
                onClick={action.onClick}
                color={action.color || '#4f46e5'}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div 
        className="mobile-activity-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mobile-section-header">
          <h2 className="mobile-section-title">Aktivitas Terbaru</h2>
          <button 
            className="mobile-view-all-btn"
            onClick={() => navigate('/candidates')}
          >
            Lihat Semua
          </button>
        </div>
        
        <MobileDataList
          items={recentActivities || []}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          loading={loading}
          onRefresh={onRefresh}
          emptyMessage="Belum ada aktivitas"
          emptyAction={{
            label: "Lihat Kandidat",
            onClick: () => navigate('/candidates')
          }}
        />
      </motion.div>
    </div>
  );
}

import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

export const StatusPieChart = ({ data }) => {
  const chartData = [
    { name: 'Lulus', value: data.lulus || 0, color: '#10b981' },
    { name: 'Lulus + Catatan', value: data.lulus_catatan || 0, color: '#f59e0b' },
    { name: 'Tidak Lulus', value: data.tidak_lulus || 0, color: '#ef4444' },
    { name: 'Dalam Proses', value: data.dalam_proses || 0, color: '#6366f1' },
  ].filter(d => d.value > 0);

  return (
    <motion.div 
      className="chart-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h4 className="chart-title">Distribusi Status Kandidat</h4>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: 12, 
              border: 'none', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              padding: '12px 16px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export const RecentActivityChart = ({ data }) => {
  return (
    <motion.div 
      className="chart-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h4 className="chart-title">Skor Kandidat Terbaru</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="nama" 
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: 12, 
              border: 'none', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              padding: '12px 16px'
            }}
            formatter={(value) => [`${value.toFixed(1)}`, 'Skor']}
          />
          <Bar 
            dataKey="avg_score" 
            radius={[8, 8, 0, 0]}
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.avg_score >= 70 ? '#10b981' : entry.avg_score >= 60 ? '#f59e0b' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export const TrendAreaChart = ({ data }) => {
  return (
    <motion.div 
      className="chart-card full-width"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h4 className="chart-title">Trend Rekrutment</h4>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: 12, 
              border: 'none', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              padding: '12px 16px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTotal)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

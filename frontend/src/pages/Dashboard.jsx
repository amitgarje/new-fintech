import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { ShieldAlert, Activity, CreditCard, Crosshair } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import './Dashboard.css';

// Mock Data
const merchantData = [
  { name: 'Electronics', fraud: 400 },
  { name: 'Travel', fraud: 300 },
  { name: 'Grocery', fraud: 150 },
  { name: 'Gaming', fraud: 550 },
  { name: 'Clothing', fraud: 200 },
];

const deviceData = [
  { name: 'Mobile Web', value: 400 },
  { name: 'Desktop', value: 300 },
  { name: 'iOS App', value: 300 },
  { name: 'Android App', value: 200 },
];

const paymentData = [
  { name: 'Credit C.', fraud: 450 },
  { name: 'Debit C.', fraud: 150 },
  { name: 'Crypto', fraud: 350 },
  { name: 'Wire T.', fraud: 200 },
];

const timeData = [
  { time: '00:00', fraudLevel: 20 },
  { time: '04:00', fraudLevel: 15 },
  { time: '08:00', fraudLevel: 45 },
  { time: '12:00', fraudLevel: 30 },
  { time: '16:00', fraudLevel: 60 },
  { time: '20:00', fraudLevel: 80 },
];

const recentTxData = [
  { id: 'TX-9921', user: 'U-4521', amount: '$1,250.00', status: 'Fraud' },
  { id: 'TX-9920', user: 'U-1190', amount: '$45.00', status: 'Safe' },
  { id: 'TX-9919', user: 'U-8832', amount: '$8,990.00', status: 'Fraud' },
  { id: 'TX-9918', user: 'U-2211', amount: '$12.50', status: 'Safe' },
  { id: 'TX-9917', user: 'U-0091', amount: '$350.00', status: 'Safe' },
];

const PIE_COLORS = ['#00f0ff', '#8a2be2', '#ff3366', '#00ff66'];

const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '', isPercentage = false }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(easeProgress * end);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  const displayValue = isPercentage ? count.toFixed(2) : Math.floor(count).toLocaleString();
  return <span>{prefix}{displayValue}{suffix}</span>;
};

const Dashboard = () => {
  return (
    <div className="dashboard-container animate-slide-in">
      <h1 className="page-title delay-1">Real-time Overview</h1>
      
      {/* Top Metrics */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel glow-blue delay-1">
          <div className="metric-title">Total Transactions</div>
          <div className="metric-value">
            <AnimatedCounter end={124592} />
          </div>
          <Activity className="metric-icon" color="var(--neon-blue)" size={32} />
        </div>
        
        <div className="metric-card glass-panel glow-red delay-2">
          <div className="metric-title">Fraud Detected</div>
          <div className="metric-value text-neon-red">
            <AnimatedCounter end={342} />
          </div>
          <ShieldAlert className="metric-icon" color="var(--neon-red)" size={32} />
        </div>
        
        <div className="metric-card glass-panel glow-purple delay-3">
          <div className="metric-title">Fraud Rate</div>
          <div className="metric-value text-neon-purple">
            <AnimatedCounter end={0.27} isPercentage={true} suffix="%" />
          </div>
          <Crosshair className="metric-icon" color="var(--neon-purple)" size={32} />
        </div>
        
        <div className="metric-card glass-panel glow-green delay-4">
          <div className="metric-title">Model F1 Score</div>
          <div className="metric-value">
            <AnimatedCounter end={0.96} isPercentage={true} />
          </div>
          <Activity className="metric-icon" color="var(--neon-green)" size={32} />
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid animate-slide-in delay-2">
        <GlassCard className="chart-card">
          <h3><CreditCard size={20} color="var(--neon-blue)" /> Fraud by Merchant Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={merchantData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
              <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--neon-blue)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="fraud" fill="var(--neon-blue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="chart-card">
          <h3><Activity size={20} color="var(--neon-purple)" /> Fraud by Device Type</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--neon-purple)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="chart-card">
          <h3><ShieldAlert size={20} color="var(--neon-red)" /> Fraud by Payment Method</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={paymentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis dataKey="name" type="category" width={80} stroke="var(--text-secondary)" />
              <Tooltip 
                 contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--neon-red)', borderRadius: '8px' }}
              />
              <Bar dataKey="fraud" fill="var(--neon-red)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="chart-card">
          <h3><Activity size={20} color="var(--neon-green)" /> Fraud by Time of Day</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip 
                 contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--neon-green)', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="fraudLevel" stroke="var(--neon-green)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-dark)', stroke: 'var(--neon-green)', strokeWidth: 2 }} activeDot={{ r: 6, fill: 'var(--neon-green)' }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Recent Transactions */}
      <GlassCard className="recent-transactions animate-slide-in delay-3" neonColor="none">
        <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold">
          Recent Transactions
        </h3>
        <table className="table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>User ID</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentTxData.map((tx) => (
              <tr key={tx.id}>
                <td className="font-medium text-[var(--text-primary)]">{tx.id}</td>
                <td>{tx.user}</td>
                <td className="font-medium">{tx.amount}</td>
                <td>
                  <span className={`badge ${tx.status.toLowerCase()}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};

export default Dashboard;

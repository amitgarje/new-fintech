import React, { useMemo } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Lightbulb, TrendingUp, AlertCircle, Smartphone, Map, Crosshair, ShieldAlert, CheckCircle, Upload } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import './Analytics.css';
import { ParentSize } from '@visx/responsive';
import VisxAreaChart from '../components/VisxAreaChart';

// --- Mock Data ---

const cityFraudData = [
  { city: 'Miami', fraud: 850, safe: 4200 },
  { city: 'New York', fraud: 720, safe: 8500 },
  { city: 'Los Angeles', fraud: 610, safe: 6200 },
  { city: 'London', fraud: 450, safe: 5100 },
  { city: 'Tokyo', fraud: 230, safe: 7800 },
];

const fraudVsSafeData = [
  { name: 'Safe Operations', value: 92 },
  { name: 'Fraud Detected', value: 8 },
];

const deviceUsageData = [
  { name: 'Mobile Web', fraudRate: 12 },
  { name: 'iOS App', fraudRate: 5 },
  { name: 'Android App', fraudRate: 14 },
  { name: 'Desktop Web', fraudRate: 4 },
  { name: 'ATM', fraudRate: 2 },
];

const paymentTrendData = [
  { month: 'Jan', card: 400, wallet: 240, crypto: 600 },
  { month: 'Feb', card: 300, wallet: 139, crypto: 700 },
  { month: 'Mar', card: 200, wallet: 980, crypto: 500 },
  { month: 'Apr', card: 278, wallet: 390, crypto: 800 },
  { month: 'May', card: 189, wallet: 480, crypto: 400 },
  { month: 'Jun', card: 239, wallet: 380, crypto: 300 },
];

const hourlyData = [
  { hour: '00:00', tx: 1200, fraud: 150 },
  { hour: '04:00', tx: 800, fraud: 180 }, // High fraud ratio
  { hour: '08:00', tx: 5500, fraud: 90 },
  { hour: '12:00', tx: 8200, fraud: 120 },
  { hour: '16:00', tx: 6400, fraud: 110 },
  { hour: '20:00', tx: 3200, fraud: 140 }, // Increasing fraud
];

const PIE_COLORS = ['#00ff66', '#ff3366'];
const DEVICE_COLORS = ['#00f0ff', '#8a2be2', '#ff3366', '#00ff66', '#ffb700'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  // Map hourlyData to include real Date objects for visx
  const chartData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return hourlyData.map(d => {
      const [hours, minutes] = d.hour.split(':');
      const date = new Date(today);
      date.setHours(parseInt(hours), parseInt(minutes));
      return { ...d, date };
    });
  }, []);

  return (
    <div className="animate-slide-in">
      <h1 className="page-title delay-1 mb-6">Fraud Analytics</h1>
      
      <div className="analytics-grid">
        
        {/* 1. Fraud vs Non-Fraud (Pie) */}
        <GlassCard className="chart-wrapper delay-2" neonColor="none">
          <h3 className="chart-header">
            <Crosshair size={20} color="var(--neon-green)" /> Overall Fraud Ratio
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fraudVsSafeData}
                cx="50%" cy="50%"
                innerRadius={70} outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {fraudVsSafeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--text-secondary)' }}/>
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* 2. Fraud by City (Stacked Bar) */}
        <GlassCard className="chart-wrapper delay-2" neonColor="none">
          <h3 className="chart-header">
            <Map size={20} color="var(--neon-blue)" /> High Risk Locations (Fraud vs Safe)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cityFraudData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis dataKey="city" type="category" width={90} stroke="var(--text-secondary)" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="fraud" stackId="a" fill="var(--neon-red)" name="Fraud" radius={[0, 0, 0, 0]} />
              <Bar dataKey="safe" stackId="a" fill="rgba(0, 240, 255, 0.4)" name="Safe" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* 3. Device Usage Patterns (Bar) */}
        <GlassCard className="chart-wrapper delay-3" neonColor="none">
          <h3 className="chart-header">
            <Smartphone size={20} color="var(--neon-purple)" /> Fraud Rate by Device (%)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deviceUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="fraudRate" name="Fraud Rate (%)" radius={[4, 4, 0, 0]}>
                {deviceUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* 4. Transactions by Hour (Visx Area Chart) */}
        <GlassCard className="chart-wrapper delay-3" neonColor="none" padded={false}>
          <div className="p-6 pb-0">
            <h3 className="chart-header">
              <TrendingUp size={20} color="#ffb700" /> Transaction Volume & Fraud by Hour
            </h3>
          </div>
          <div style={{ height: '300px', width: '100%', position: 'relative', marginTop: '10px' }}>
            <ParentSize>
              {({ width, height }) => (
                <VisxAreaChart 
                  width={width} 
                  height={height} 
                  data={chartData} 
                  margin={{ top: 10, right: 10, bottom: 40, left: 10 }}
                />
              )}
            </ParentSize>
          </div>
        </GlassCard>

        {/* 5. Payment Method Fraud Trends (Line) */}
        <GlassCard className="chart-wrapper delay-4" style={{ gridColumn: '1 / -1' }} neonColor="none">
           <h3 className="chart-header">
            <TrendingUp size={20} color="var(--neon-blue)" /> Payment Method Fraud Trends (6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={paymentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="card" stroke="var(--neon-blue)" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} name="Cards" />
              <Line type="monotone" dataKey="wallet" stroke="var(--neon-purple)" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} name="Digital Wallets" />
              <Line type="monotone" dataKey="crypto" stroke="var(--neon-red)" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} name="Cryptocurrency" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <section className="model-performance-section mt-12 mb-12">
        <h2 className="section-header delay-4 flex items-center gap-2">
          <Crosshair size={20} color="var(--neon-green)" /> Model Performance Hub
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in delay-4">
          <GlassCard className="performance-card glow-green" neonColor="none">
            <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-2">Precision</div>
            <div className="text-4xl font-bold text-neon-green">98.2%</div>
            <p className="text-xs text-[var(--text-secondary)] mt-4">
              Measures how many transactions flagged as fraud were actually fraudulent. High precision means <strong>fewer false alarms</strong>.
            </p>
          </GlassCard>
          <GlassCard className="performance-card glow-blue" neonColor="none">
            <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-2">Recall / Sensitivity</div>
            <div className="text-4xl font-bold text-neon-blue">94.5%</div>
            <p className="text-xs text-[var(--text-secondary)] mt-4">
              Measures how many actual fraud cases were identified. High recall means <strong>fewer missed threats</strong>.
            </p>
          </GlassCard>
          <GlassCard className="performance-card glow-purple" neonColor="none">
            <div className="text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-2">F1-Score</div>
            <div className="text-4xl font-bold text-neon-purple">96.3%</div>
            <p className="text-xs text-[var(--text-secondary)] mt-4">
              The harmonic mean of Precision and Recall. It provides a balanced view of the model's total effectiveness.
            </p>
          </GlassCard>
        </div>
        
        <GlassCard className="tradeoff-analysis mt-8 animate-slide-in delay-4" neonColor="none">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle size={20} color="var(--neon-warning)" /> The "Security vs. Friction" Tradeoff
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-sm leading-relaxed text-[var(--text-secondary)]">
              <p className="mb-4">
                In fraud detection, we face a constant balance. If we increase sensitivity (Recall), we catch more criminals but risk blocking legitimate customers (**False Positives**).
              </p>
              <p>
                Conversely, if we prioritize ultra-low friction (High Precision), we might miss sophisticated attacks (**False Negatives**). Our current F1-Score of 96.3% represents an optimized balance for high-growth fintech environments.
              </p>
            </div>
            <div className="tradeoff-viz bg-[rgba(255,255,255,0.02)] p-6 rounded-xl border border-[var(--border-glass)]">
              <div className="flex justify-between items-end h-32 gap-4">
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-neon-red opacity-40 h-24 rounded-t-lg"></div>
                  <span className="text-[10px] mt-2 text-center">Safety Focus (High Friction)</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-neon-blue h-16 rounded-t-lg"></div>
                  <span className="text-[10px] mt-2 text-center text-neon-blue font-bold">Current Balance (Optimized)</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-neon-green opacity-40 h-8 rounded-t-lg"></div>
                  <span className="text-[10px] mt-2 text-center">Growth Focus (High Risk)</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="analytics-footer mt-12 mb-12">
        <h2 className="section-header delay-4 flex items-center gap-2">
          <Lightbulb size={24} color="#ffb700" /> 
          <span>AI Cognitive Insights</span>
        </h2>
        
        <div className="insights-grid animate-slide-in delay-4">
          <GlassCard className="pro-insight-card danger" neonColor="none">
            <div className="insight-top">
              <div className="insight-icon-bg">
                <AlertCircle size={28} />
              </div>
              <div className="severity-badge high">High Priority</div>
            </div>
            <h4>Nocturnal Anomaly Cluster</h4>
            <p>Our neural networks detected a <strong>340% surge</strong> in high-risk attempts between 02:00 AM and 05:00 AM. This correlate with a 85% drop in legitimate throughput, indicating targeted nocturnal penetration attempts.</p>
            <div className="insight-footer">
              <span>Confidence: 96%</span>
              <button className="action-link" onClick={() => window.open('https://cybercrime.gov.in', '_blank')}>Report Vector</button>
            </div>
          </GlassCard>

          <GlassCard className="pro-insight-card warning" neonColor="none">
            <div className="insight-top">
              <div className="insight-icon-bg">
                <Smartphone size={28} />
              </div>
              <div className="severity-badge medium">Medium Risk</div>
            </div>
            <h4>Cross-Platform Vulnerability</h4>
            <p>Mobile device origins account for <strong>72% of all fraudulent attempts</strong>. Specifically, aged Android versions linked with temporary crypto-wallets represent 90% of current loss-prevention alerts.</p>
            <div className="insight-footer">
              <span>Confidence: 91%</span>
              <button className="action-link">Update Filters</button>
            </div>
          </GlassCard>

          <GlassCard className="pro-insight-card" neonColor="none">
            <div className="insight-top">
              <div className="insight-icon-bg">
                <Map size={28} />
              </div>
              <div className="severity-badge low">Observation</div>
            </div>
            <h4>Geographical Hotspots</h4>
            <p>Miami maintains the highest count of raw fraud incidents, however London demonstrates a **+18% growth** in sophisticated skimming attempts. We recommend regional risk-weight adjustments for EEA traffic.</p>
            <div className="insight-footer">
              <span>Confidence: 84%</span>
              <button className="action-link">View Map</button>
            </div>
          </GlassCard>
        </div>

        <div className="reporting-cta mt-12">
          <GlassCard className="cyber-reporting-card" neonColor="blue">
            <div className="cyber-reporting-header">
              <div className="reporting-icon">
                <ShieldAlert size={32} />
              </div>
              <div className="reporting-title">
                <h3>Legal & Cyber Compliance Integration</h3>
                <p>Escalate high-confidence fraud trends to official authorities</p>
              </div>
              <button className="btn btn-cyber" onClick={() => window.open('https://cybercrime.gov.in', '_blank')}>
                Report Vector to Police
              </button>
            </div>

            <div className="reporting-content-grid">
              <div className="reporting-instructions">
                <h4>Standard Operating Procedure (SOP) for Evidence Submission</h4>
                <ul className="sop-list">
                  <li>
                    <div className="step-num">01</div>
                    <div className="step-text"><strong>Trend Aggregation:</strong> Capture specific timestamps and clusters where AI confidence exceeds 90%.</div>
                  </li>
                  <li>
                    <div className="step-num">02</div>
                    <div className="step-text"><strong>Evidence Download:</strong> Use the individual detail reports to generate forensic SHAP datasets.</div>
                  </li>
                  <li>
                    <div className="step-num">03</div>
                    <div className="step-text"><strong>Formal Reporting:</strong> Navigate to NCCRP and select 'Financial Fraud' under reporting categories.</div>
                  </li>
                </ul>
              </div>
              
              <div className="reporting-status-mini glass-item p-6 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
                 <div className="flex items-center gap-3 mb-4">
                    <CheckCircle size={20} className="text-neon-green" />
                    <span className="text-sm font-bold uppercase tracking-wider">Compliance Status: ACTIVE</span>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed">
                   Currently monitoring 1,200+ metrics. Forensic integrity is maintained via block-level hashing for all exported analytics data.
                 </p>
                 <button className="btn btn-secondary w-full mt-6 text-xs" onClick={() => alert("Aggregated Analytics Report Downloaded. Size: 4.2MB")}>
                    <Upload size={14} /> Download Analytics Summary
                 </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default Analytics;

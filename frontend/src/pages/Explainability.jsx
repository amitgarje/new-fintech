import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { BrainCircuit, Search, DollarSign, Smartphone, Clock, AlertTriangle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import './Explainability.css';

// Mock Data for Feature Importance
const featureImportanceData = [
  { feature: 'Amount', importance: 0.35 },
  { feature: 'Device Change', importance: 0.25 },
  { feature: 'Location Anomaly', importance: 0.18 },
  { feature: 'Time Anomaly', importance: 0.12 },
  { feature: 'Velocity', importance: 0.10 },
];

const COLORS = ['#00f0ff', '#8a2be2', '#ff3366', '#ffb700', '#00ff66'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ background: 'rgba(10,11,16,0.9)', border: `1px solid ${payload[0].payload.fill}`, padding: '10px', borderRadius: '8px' }}>
        <p style={{ color: '#fff', fontWeight: 'bold' }}>{payload[0].payload.feature}</p>
        <p style={{ color: 'var(--text-secondary)' }}>
          Weight: <span style={{ color: payload[0].payload.fill }}>{(payload[0].value * 100).toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const Explainability = () => {
  return (
    <div className="explain-container animate-slide-in">
      <div className="explain-header delay-1">
        <h1 className="page-title">Cipher<span className="text-neon-blue">Flux</span> Explainability (XAI)</h1>
        <p className="text-[var(--text-secondary)] mt-2 max-w-2xl">
          Transparent insights into how the CipherFlux AI model calculates risk scores and makes determinations. Trust is built on transparency.
        </p>
      </div>

      <div className="model-trust-section">
        
        {/* Feature Importance Chart */}
        <GlassCard className="feature-chart-card delay-2" neonColor="none">
          <h3 className="flex items-center gap-2 text-xl font-semibold mb-6">
            <BrainCircuit color="var(--neon-purple)" /> Global Feature Importance
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            The relative weight of each data point the AI considers across all transactions.
          </p>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureImportanceData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" hide />
              <YAxis dataKey="feature" type="category" stroke="var(--text-secondary)" width={120} tick={{fill: 'var(--text-primary)'}} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]} maxBarSize={40}>
                {featureImportanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Example Case Breakdown */}
        <GlassCard className="example-case-card delay-3">
          <h3 className="flex items-center gap-2 text-xl font-semibold border-b border-[var(--border-glass)] pb-4">
            <Search color="var(--neon-blue)" /> Local Explainability: Example Case
          </h3>
          
          <div className="transaction-summary animate-slide-in delay-4">
            <div className="tx-details">
              <h4>TX-8992-ALERT</h4>
              <p>User: U-4412 • Nov 12, 03:14 AM</p>
            </div>
            <div className="tx-amount">
              <div className="amount">$4,250.00</div>
              <div className="status">94% Risk Score</div>
            </div>
          </div>

          <div className="explanation-section animate-slide-in delay-5">
            <h3>Why was this flagged as Fraud?</h3>
            
            <div className="reason-bullets">
              
              <div className="reason-bullet">
                <div className="bullet-icon">
                  <DollarSign size={20} />
                </div>
                <div className="bullet-content">
                  <h5>Amount Anomaly: 8.5x Higher Than Average</h5>
                  <p>The transaction amount of $4,250.00 significantly deviates from the user's historical 6-month average of $495.00. This feature contributed 45% to the final risk score.</p>
                </div>
              </div>

              <div className="reason-bullet">
                <div className="bullet-icon warning">
                  <Smartphone size={20} />
                </div>
                <div className="bullet-content">
                  <h5>New Device Fingerprint</h5>
                  <p>The transaction originated from an unrecognized Android device (Model XT-21) that has never been associated with User U-4412's profile before. Contributed 30% to the risk score.</p>
                </div>
              </div>

              <div className="reason-bullet">
                <div className="bullet-icon warning">
                  <Clock size={20} />
                </div>
                <div className="bullet-content">
                  <h5>Unusual Time Pattern</h5>
                  <p>Transaction occurred at 03:14 AM local time, whereas 92% of the user's historical safe transactions occur between 09:00 AM and 08:00 PM. Contributed 19% to the risk score.</p>
                </div>
              </div>

            </div>
          </div>
          
        </GlassCard>

      </div>
    </div>
  );
};

export default Explainability;

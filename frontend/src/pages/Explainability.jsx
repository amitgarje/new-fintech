import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { BrainCircuit, Search, DollarSign, Smartphone, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
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
        <GlassCard className="example-case-card delay-3 pro-xai" neonColor="blue">
          <div className="xai-header">
            <div className="xai-title">
              <h3 className="flex items-center gap-3 text-2xl font-black">
                <Search size={28} className="text-neon-blue" /> Case Forensic Breakdown
              </h3>
              <p className="text-[var(--text-secondary)] mt-1 font-medium text-sm">Case evidence generated through SHAP Attribution Engine</p>
            </div>
            <div className="tx-status-badge fraud">CRITICAL FRAUD ALERT</div>
          </div>
          
          <div className="transaction-summary animate-slide-in delay-4 pro">
            <div className="tx-details">
              <div className="tx-id">IDENTIFIER: <span className="font-bold text-neon-blue">TX-8992-ALERT</span></div>
              <div className="tx-meta">USER_GUID: 4412 • TIMESTAMP: NOV 12, 03:14:22 AM</div>
            </div>
            <div className="tx-impact">
              <div className="amount-val">₹3,48,250.00</div>
              <div className="threat-probability">94.2% Risk Score</div>
            </div>
          </div>

          <div className="explanation-section animate-slide-in delay-5 pro">
            <h4 className="attribution-title">Primary Feature Attribution (SHAP Values)</h4>
            
            <div className="reason-bullets-pro">
              
              <div className="reason-bullet-card">
                <div className="bullet-header">
                  <div className="bullet-icon-wrapper danger">
                    <DollarSign size={20} />
                  </div>
                  <h5>Abnormal Velocity Cluster</h5>
                  <div className="weight-pill">+45%</div>
                </div>
                <div className="bullet-body">
                  <p>Transaction amount is <strong>8.5x higher</strong> than User U-4412's 180-day baseline. This deviation represents a significant departure from standard spending behavior.</p>
                </div>
              </div>

              <div className="reason-bullet-card">
                <div className="bullet-header">
                  <div className="bullet-icon-wrapper warning">
                    <Smartphone size={20} />
                  </div>
                  <h5>Hardware Hash Mismatch</h5>
                  <div className="weight-pill">+30%</div>
                </div>
                <div className="bullet-body">
                  <p>Detected an unrecognized <strong>Android (v14) device fingerprint</strong>. The device ID and cross-session tracking data show no historical correlation with this account.</p>
                </div>
              </div>

              <div className="reason-bullet-card">
                <div className="bullet-header">
                  <div className="bullet-icon-wrapper info">
                    <Clock size={20} />
                  </div>
                  <h5>Temporal Anomaly Pattern</h5>
                  <div className="weight-pill">+19%</div>
                </div>
                <div className="bullet-body">
                  <p>Attempted at 03:14 AM. <strong>92% of user activity</strong> is restricted to diurnal hours (09:00 - 20:00). High nocturnal confidence in behavior.</p>
                </div>
              </div>

            </div>
          </div>

          <div className="xai-footer mt-12 pt-8 border-t border-[#f1f5f9] flex items-center justify-between">
            <div className="legal-notice">
              <ShieldAlert size={20} className="text-neon-red inline mr-2" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Forensic Integrity Verified</span>
            </div>
            <button className="btn btn-cyber" onClick={() => window.open('https://cybercrime.gov.in', '_blank')}>
              Generate Evidence & Report
            </button>
          </div>
          
        </GlassCard>
      </div>
    </div>
  );
};

export default Explainability;

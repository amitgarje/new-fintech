import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Fingerprint, 
  MapPin, 
  Clock, 
  CreditCard, 
  Activity, 
  Search,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  Globe,
  Monitor,
  Smartphone,
  Check,
  Shield,
  Briefcase
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { predictFraud } from '../utils/mockApi';
import './LiveDetection.css';

const LiveDetection = () => {
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    userCity: '',
    merchantCity: '',
    deviceType: 'mobile',
    paymentMethod: 'card',
    timestamp: new Date().toISOString().slice(0, 16)
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const simulateDetection = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setResult(null);

    // Use Mock API
    const response = await predictFraud(formData, 2000);

    let status = 'safe';
    if (response.fraud) status = 'fraud';
    else if (response.risk_score >= 40) status = 'warning';

    setResult({
      status,
      score: response.risk_score,
      reasons: response.reasons
    });
    setIsAnalyzing(false);
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'fraud': return 'status-fraud';
      case 'warning': return 'status-warning';
      default: return 'status-safe';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'fraud': return <ShieldAlert size={48} />;
      case 'warning': return <AlertTriangle size={48} />;
      default: return <ShieldCheck size={48} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'fraud': return 'High Risk Detected';
      case 'warning': return 'Potential Risk';
      default: return 'Transaction Safe';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="animate-slide-in"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title mb-2 m-0">Live Fraud Engine</h1>
          <p className="text-[var(--text-secondary)] opacity-80">Real-time forensic analysis with AI-driven risk scoring.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
          <Activity size={14} /> System Active
        </div>
      </div>
      
      <div className="live-detection-container">
        {/* Input Form Area */}
        <motion.div className="form-card" variants={itemVariants}>
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-8 border-b border-[var(--border-glass)] bg-[#f8fafc]/50">
               <h3 className="flex items-center gap-3 text-xl font-extrabold text-[var(--text-primary)] m-0">
                <Fingerprint size={24} className="text-[var(--neon-blue)]" /> 
                Forensic Input
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2">Specify transaction parameters for the neural network.</p>
            </div>
            
            <div className="p-8">
              <form onSubmit={simulateDetection} className="space-y-8">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">User Identifier</label>
                    <div className="input-with-icon">
                       <Monitor size={16} className="input-icon-lucide" />
                       <input required type="text" name="userId" value={formData.userId} onChange={handleChange} className="form-input" placeholder="e.g., USR-9021" />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Amount (INR)</label>
                    <div className="input-with-icon">
                      <CreditCard size={16} className="input-icon-lucide" />
                      <input required type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="form-input" placeholder="0.00" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Origin City</label>
                    <div className="input-with-icon">
                      <MapPin size={16} className="input-icon-lucide" />
                      <input required type="text" name="userCity" value={formData.userCity} onChange={handleChange} className="form-input" placeholder="e.g., Mumbai" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Destination City</label>
                    <div className="input-with-icon">
                      <Globe size={16} className="input-icon-lucide" />
                      <input required type="text" name="merchantCity" value={formData.merchantCity} onChange={handleChange} className="form-input" placeholder="e.g., Dubai" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Device Channel</label>
                    <div className="input-with-icon">
                      <Smartphone size={16} className="input-icon-lucide" />
                      <select name="deviceType" value={formData.deviceType} onChange={handleChange} className="form-select">
                        <option value="mobile">Mobile Application</option>
                        <option value="web">Web Browser (PWA)</option>
                        <option value="atm">POS / ATM Terminal</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Execution Method</label>
                    <div className="input-with-icon">
                      <Briefcase size={16} className="input-icon-lucide" />
                      <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="form-select">
                        <option value="card">Credit / Debit Card</option>
                        <option value="upi">UPI / Net Banking</option>
                        <option value="wallet">Crypto / Blockchain</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Simulated Timestamp</label>
                  <div className="input-with-icon">
                    <Calendar size={16} className="input-icon-lucide" />
                    <input required type="datetime-local" name="timestamp" value={formData.timestamp} onChange={handleChange} className="form-input" />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full py-4 text-lg" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <><span className="spinner"></span> Running AI Scrutiny...</>
                  ) : (
                    <><Search size={20} /> Execute Forensics</>
                  )}
                </button>
              </form>
            </div>
          </GlassCard>
        </motion.div>

        {/* Real-time Result Area */}
        <motion.div className="result-card-container" variants={itemVariants}>
          <AnimatePresence mode="wait">
            {!result && !isAnalyzing ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <GlassCard className="empty-state-card">
                  <div className="pulse-aura">
                     <Shield size={48} className="text-[#f1f5f9]" />
                  </div>
                  <h3 className="text-xl font-bold mt-6 mb-2">Engine Ready</h3>
                  <p className="max-w-[280px] text-sm text-[var(--text-secondary)] opacity-80">Finalize the parameters on the left to trigger the neural network evaluators.</p>
                </GlassCard>
              </motion.div>
            ) : isAnalyzing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className="analysis-loading-card">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-blue-100 rounded-full border-t-[var(--neon-blue)] animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity className="text-[var(--neon-blue)] animate-pulse" size={32} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-[var(--neon-blue)] mb-2">Analyzing...</h3>
                  <p className="text-[var(--text-secondary)] text-sm">Evaluating 1,500+ decision nodes in real-time.</p>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <GlassCard className={`professional-result-card ${getStatusColorClass(result.status)}`}>
                  <div className="result-header">
                    <div className="status-badge-outline">
                       <span className="dot"></span>
                       {result.status === 'safe' ? 'System Verified' : 'Risk Detected'}
                    </div>
                    <div className="status-main">
                      <div className="status-icon-box">
                        {getStatusIcon(result.status)}
                      </div>
                      <div className="status-info">
                        <h2 className="status-title">{getStatusText(result.status)}</h2>
                        <div className="risk-score-badge">
                           <span className="label">Threat ID:</span>
                           <span className="value">#{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="risk-metric-block">
                    <div className="metric-label">Neural Probability Score</div>
                    <div className="metric-primary-value">
                       <span className="number">{result.score}</span>
                       <span className="percent">%</span>
                    </div>
                    <div className="metric-bar-container">
                       <div className="metric-bar-fill" style={{ width: `${result.score}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="forensic-reasons">
                    <h4 className="forensic-header">Decision Attribution (SHAP)</h4>
                    <div className="reason-grid">
                      {result.reasons.map((reason, idx) => (
                        <div key={idx} className="forensic-item">
                          <Check size={14} className="check-icon" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.status === 'fraud' && (
                    <div className="escalation-alert animate-pulse-slow">
                       <ShieldAlert size={20} />
                       <span>Immediate escalation required for legal compliance.</span>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Cyber Reporting Integration (Consistent with Analytics & Upload) */}
      <section className="mt-12 mb-12 animate-slide-in delay-2">
        <GlassCard className="cyber-reporting-card" neonColor="blue">
          <div className="cyber-reporting-header">
            <div className="reporting-icon"><ShieldAlert size={32} /></div>
            <div className="reporting-title">
              <h3>Legal & Cyber Compliance Dashboard</h3>
              <p>Escalate real-time forensic evidence to authorities</p>
            </div>
            <button className="btn btn-cyber" onClick={() => window.open('https://cybercrime.gov.in', '_blank')}>Escalate to Cyber Police</button>
          </div>
          <div className="reporting-content-grid">
            <div className="reporting-instructions">
              <h4>Standard Operating Procedure (SOP)</h4>
              <ul className="sop-list">
                <li><div className="step-num">01</div><div className="step-text"><strong>Download Evidence:</strong> Click the Compliance link below for the hashed report.</div></li>
                <li><div className="step-num">02</div><div className="step-text"><strong>Verify Hash:</strong> Ensure the SHAP attribution matches the portal submission.</div></li>
                <li><div className="step-num">03</div><div className="step-text"><strong>Submit:</strong> Upload cases onto the NCCRP platform under 'Financial Fraud'.</div></li>
              </ul>
            </div>
            <div className="reporting-status-mini glass-item p-6 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle size={20} className="text-neon-green" />
                  <span className="text-sm font-bold uppercase tracking-wider">Engine Status: OPTIMIZED</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold">
                  Compliance ID: CF-{Math.floor(Math.random() * 90000) + 10000}-SEC
                </p>
                <div className="mt-6 flex gap-2">
                   <div className="h-8 flex-1 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-400">LOG_ACTIVE</div>
                   <div className="h-8 flex-1 bg-blue-50 rounded flex items-center justify-center text-[10px] font-bold text-blue-600">FRNS_AUTH</div>
                </div>
            </div>
          </div>
        </GlassCard>
      </section>
    </motion.div>
  );
};

export default LiveDetection;

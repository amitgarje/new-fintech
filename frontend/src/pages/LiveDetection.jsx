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
  Info
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
      case 'fraud': return <ShieldAlert size={64} />;
      case 'warning': return <AlertTriangle size={64} />;
      default: return <ShieldCheck size={64} />;
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
      className="page-wrapper"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title mb-2">Live Fraud Detection</h1>
          <p className="text-[var(--text-secondary)]">Test our AI engine in real-time with custom parameters.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold border border-blue-100">
          <Activity size={16} /> System Active
        </div>
      </header>
      
      <div className="live-detection-container">
        {/* Input Form */}
        <motion.div className="form-card" variants={itemVariants}>
          <GlassCard className="p-8">
            <h3 className="flex items-center gap-2 mb-8 text-xl font-bold text-[var(--text-primary)]">
              <Fingerprint size={24} className="text-[var(--neon-blue)]" /> 
              Transaction Details
            </h3>
            
            <form onSubmit={simulateDetection} className="space-y-6">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">User Identifier</label>
                  <input required type="text" name="userId" value={formData.userId} onChange={handleChange} className="form-input" placeholder="e.g., USR-9021" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Amount (USD)</label>
                  <input required type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="form-input" placeholder="0.00" />
                </div>

                <div className="form-group">
                  <label className="form-label"><MapPin size={14} /> Origin City</label>
                  <input required type="text" name="userCity" value={formData.userCity} onChange={handleChange} className="form-input" placeholder="e.g., London" />
                </div>

                <div className="form-group">
                  <label className="form-label"><MapPin size={14} /> Destination City</label>
                  <input required type="text" name="merchantCity" value={formData.merchantCity} onChange={handleChange} className="form-input" placeholder="e.g., Tokyo" />
                </div>

                <div className="form-group">
                  <label className="form-label">Platform</label>
                  <select name="deviceType" value={formData.deviceType} onChange={handleChange} className="form-select">
                    <option value="mobile">Mobile Application</option>
                    <option value="web">Web Terminal</option>
                    <option value="atm">Physical ATM</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Type</label>
                  <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="form-select">
                    <option value="card">Credit / Debit Card</option>
                    <option value="upi">Instant Transfer (UPI)</option>
                    <option value="wallet">Crypto / Digital Wallet</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><Clock size={14} /> Timestamp</label>
                <input required type="datetime-local" name="timestamp" value={formData.timestamp} onChange={handleChange} className="form-input" />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <><span className="spinner"></span> Running AI Diagnostics...</>
                ) : (
                  <><Activity size={20} /> Evaluate Transaction</>
                )}
              </button>
            </form>
          </GlassCard>
        </motion.div>

        {/* Result Area */}
        <motion.div className="result-card-container" variants={itemVariants}>
          <AnimatePresence mode="wait">
            {!result && !isAnalyzing ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <GlassCard className="empty-state">
                  <div className="pulse-icon-wrapper">
                    <Activity size={80} />
                  </div>
                  <h3 className="text-xl font-bold">Ready for Analysis</h3>
                  <p className="max-w-[250px]">Fill in the details to start the real-time fraud assessment.</p>
                </GlassCard>
              </motion.div>
            ) : isAnalyzing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className="analysis-result">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-blue-100 rounded-full border-t-blue-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Search className="text-blue-600 animate-pulse" size={32} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">Analyzing...</h3>
                  <p className="text-[var(--text-secondary)]">Scrutinizing 150+ risk vectors...</p>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <GlassCard className={`analysis-result ${getStatusColorClass(result.status)}`}>
                  <div className="status-icon-wrapper">
                    {getStatusIcon(result.status)}
                  </div>
                  
                  <div className="risk-level-badge">
                    {result.status === 'safe' ? 'Verified Safe' : 'Security Alert'}
                  </div>

                  <h2 className="status-text">{getStatusText(result.status)}</h2>
                  
                  <div className="risk-score-display">
                    <span className="score-label">Confidence Score</span>
                    <span className="score-value">{result.score}%</span>
                  </div>
                  
                  <div className="reasons-container">
                    <h4 className="reasons-header">Model Observations</h4>
                    {result.reasons.map((reason, idx) => (
                      <motion.div 
                        key={idx} 
                        className="reason-item"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                      >
                        {result.status === 'safe' ? 
                          <CheckCircle size={16} className="text-green-500" /> : 
                          <XCircle size={16} className="text-red-500" />
                        }
                        <span>{reason}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 w-full flex justify-between items-center">
                    <span className="text-xs text-slate-400">Analysis ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    <button className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
                      <Info size={14} /> Full Log
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LiveDetection;

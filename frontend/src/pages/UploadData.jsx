import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, FileType, CheckCircle, AlertTriangle, Play, Loader2, Activity, PieChart as PieIcon, BarChart as BarIcon, TrendingUp, ShieldAlert, DollarSign, Smartphone, Clock, Globe, MapPin, Copy } from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import GlassCard from '../components/GlassCard';
import { predictFraud } from '../utils/mockApi';
import './UploadData.css';

const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '', isPercentage = false }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
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

const UploadData = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'safe', 'fraud'
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResults(null); 
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const processData = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/predict_batch`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errMsg = 'Backend error';
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }
      
      const data = await response.json();
      
      const results = data.results;
      const meta = data.metadata;

      // Calculate summary from batch results
      const total = results.length;
      const fraudCount = results.filter(tx => tx.fraud).length;
      const rate = ((fraudCount / total) * 100).toFixed(2);

      setResults({
        total,
        fraud: fraudCount,
        rate
      });
      setBatchData(results);
      setMetadata(meta);
      setError(null);
    } catch (error) {
      console.error('Error processing batch:', error);
      setError(error.message === 'Failed to fetch' ? 'Connection failed. Please ensure the Fraud Detection API (Flask) is running on port 5000.' : `API Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateTransactions = async () => {
    setIsSimulating(true);
    
    // Generate 5 random transactions and feed them into mock API
    const txInputs = Array.from({ length: 5 }).map(() => ({
      amount: Math.random() > 0.8 ? Math.floor(Math.random() * 8000 + 1000) : Math.floor(Math.random() * 500 + 10),
      isNightTime: Math.random() > 0.85,
      isNewDevice: Math.random() > 0.9,
      isCrossBorder: Math.random() > 0.95
    }));

    const newSims = [];
    
    // Small delay between each call
    const delay = ms => new Promise(res => setTimeout(res, ms));

    for (let i = 0; i < txInputs.length; i++) {
        const tx = txInputs[i];
        
        try {
          // Map frontend simulation fields to backend expected fields
          const backendTx = {
              final_amount: tx.amount,
              amt_vs_avg: tx.amount > 1000 ? 2.5 : 1.0,
              night_txn: tx.isNightTime ? 1 : 0,
              device_change: tx.isNewDevice ? 1 : 0,
              fast_txn: 0,
              invalid_ip: 0
          };

          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendTx)
          });

          if (!response.ok) throw new Error('API Error');
          const result = await response.json();
          
          newSims.push({
            id: `SIM-${Math.floor(Math.random() * 90000) + 10000}`,
            amount: `₹${parseFloat(tx.amount).toLocaleString('en-IN')}`,
            status: result.fraud ? 'Fraud' : 'Safe',
            riskScore: result.risk_score
          });
        } catch (error) {
          console.error('Simulation error:', error);
        }
        await delay(200);
    }

    setSimulations(prev => [...newSims, ...prev].slice(0, 15)); // Keep last 15
    setIsSimulating(false);
  };

  const downloadFraudReport = () => {
    if (!batchData.length) return;
    
    const frauds = batchData.filter(d => d.fraud);
    if (!frauds.length) {
      alert("No fraudulent transactions found to download.");
      return;
    }

    // Define necessary fields for Police report
    const headers = ["Transaction ID", "User ID", "Amount (INR)", "Risk Score (%)", "Status", "AI Explanation (SHAP)", "Sequence", "Device Change", "IP Anomaly"];
    const csvContent = [
      headers.join(","),
      ...frauds.map(row => [
        row['transaction id'] || `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        row['user id'] || 'N/A',
        row.final_amount,
        row.risk_score,
        row.risk_score > 75 ? 'Critical Fraud' : 'Suspicious',
        `"${row.reasons}"`,
        row.txn_sequence || 1,
        row.device_change || 0,
        row.invalid_ip || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fraud_report_police_submission_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart Data Calculations
  const getPieData = () => {
    if (!batchData.length) return [];
    const fraud = batchData.filter(d => d.fraud).length;
    return [
      { name: 'Safe', value: batchData.length - fraud },
      { name: 'Fraud', value: fraud }
    ];
  };

  const getBarData = () => {
    if (!batchData.length) return [];
    // Group by hour if available, otherwise by simplified reasons
    const hourly = {};
    batchData.forEach(d => {
      const h = d.hour !== undefined ? `${d.hour}:00` : 'Unknown';
      hourly[h] = (hourly[h] || 0) + (d.fraud ? 1 : 0);
    });
    return Object.keys(hourly).map(h => ({ name: h, count: hourly[h] })).sort((a, b) => a.name.localeCompare(b.name));
  };

  const getRiskDistData = () => {
    if (!batchData.length) return [];
    const bins = Array(10).fill(0);
    batchData.forEach(d => {
      const binIdx = Math.min(Math.floor(d.risk_score / 10), 9);
      bins[binIdx]++;
    });
    return bins.map((count, i) => ({ range: `${i*10}-${(i+1)*10}`, count }));
  };

  const getHighRiskTransactions = () => {
    return [...batchData].sort((a, b) => b.risk_score - a.risk_score).slice(0, 10);
  };

  const generateDynamicSummary = () => {
    if (!batchData.length) return "";
    
    const signals = [];
    if (batchData.some(d => d.amt_vs_avg > 2 && d.fraud)) signals.push("high-value transactions");
    if (batchData.some(d => (d.device_change === 1 || d.device_change === true) && d.fraud)) signals.push("unusual device usage");
    if (batchData.some(d => (d.fast_txn === 1 || d.fast_txn === true) && d.fraud)) signals.push("rapid transaction velocity");
    if (batchData.some(d => (d.night_txn === 1 || d.night_txn === true) && d.fraud)) signals.push("night-time anomalies");
    if (batchData.some(d => (d.geo_mismatch === 1 || d.geo_mismatch === true) && d.fraud)) signals.push("location inconsistencies");
    if (batchData.some(d => (d.invalid_ip === 1 || d.invalid_ip === true) && d.fraud)) signals.push("suspicious network patterns");
    if (batchData.some(d => (d.is_duplicate === 1 || d.is_duplicate === true) && d.fraud)) signals.push("duplicate transaction attempts");

    if (signals.length === 0) return "No significant fraud patterns were detected in this dataset.";

    const last = signals.pop();
    const joined = signals.length > 0 ? `${signals.join(", ")} and ${last}` : last;
    
    return `Fraud patterns detected indicate abnormal transaction behavior including ${joined}.`;
  };

  const getFraudPatterns = () => {
    if (!batchData.length) return [];
    
    return [
      { label: 'High Amount', count: batchData.filter(d => d.amt_vs_avg > 2 && d.fraud).length, icon: <DollarSign size={20} />, color: 'var(--neon-blue)' },
      { label: 'Velocity', count: batchData.filter(d => (d.fast_txn === 1 || d.fast_txn === true) && d.fraud).length, icon: <Activity size={20} />, color: 'var(--neon-purple)' },
      { label: 'Device Anomaly', count: batchData.filter(d => (d.device_change === 1 || d.device_change === true) && d.fraud).length, icon: <Smartphone size={20} />, color: 'var(--neon-blue)' },
      { label: 'Night Activity', count: batchData.filter(d => (d.night_txn === 1 || d.night_txn === true) && d.fraud).length, icon: <Clock size={20} />, color: 'var(--neon-purple)' },
      { label: 'Invalid IP', count: batchData.filter(d => (d.invalid_ip === 1 || d.invalid_ip === true) && d.fraud).length, icon: <Globe size={20} />, color: 'var(--neon-red)' },
      { label: 'Geo Mismatch', count: batchData.filter(d => (d.geo_mismatch === 1 || d.geo_mismatch === true) && d.fraud).length, icon: <MapPin size={20} />, color: 'var(--neon-blue)' },
      { label: 'Duplicates', count: batchData.filter(d => (d.is_duplicate === 1 || d.is_duplicate === true) && d.fraud).length, icon: <Copy size={20} />, color: 'var(--neon-red)' },
    ];
  };

  const PIE_COLORS = ['#00ff66', '#ff3366'];

  return (
    <div className="upload-container animate-slide-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title delay-1 m-0">Fraud Analysis Dashboard</h1>
        <div className="text-sm text-[var(--text-secondary)] opacity-70">Step 2: Upload & Review</div>
      </div>
      
      {/* 1. Fraud Detection Summary */}
      {results && (
        <section className="results-section">
          <h2 className="section-header delay-1">
            <ShieldAlert size={20} color="var(--neon-blue)" /> Fraud Detection Summary
          </h2>
          <div className="results-grid animate-slide-in mb-8">
            <GlassCard className="result-card glow-blue pulse-animation delay-1">
              <div className="text-[var(--text-secondary)] font-medium">Total Transactions</div>
              <div className="result-value text-[var(--text-primary)]">
                 <AnimatedCounter end={results.total} />
              </div>
            </GlassCard>
            
            <GlassCard className="result-card glow-red pulse-animation delay-2">
              <div className="text-[var(--text-secondary)] font-medium">Fraud Detected</div>
              <div className="result-value text-neon-red">
                 <AnimatedCounter end={results.fraud} />
              </div>
            </GlassCard>
            
            <GlassCard className="result-card glow-purple pulse-animation delay-3">
              <div className="text-[var(--text-secondary)] font-medium">Fraud Rate</div>
              <div className="result-value text-neon-purple">
                 <AnimatedCounter end={parseFloat(results.rate)} isPercentage={true} suffix="%" />
              </div>
            </GlassCard>
          </div>
        </section>
      )}

      {/* Charts Section -> Fraud Insights */}
      {batchData.length > 0 && (
        <>
          <section className="smart-insights-section mt-12">
            <h2 className="section-header delay-2 flex items-center gap-2">
              <TrendingUp size={20} color="var(--neon-green)" /> Smart Fraud Insights
            </h2>
            <GlassCard className="animate-slide-in delay-2 mb-8" neonColor="none">
              <div className="smart-insights-grid">
                {getFraudPatterns().map((p, idx) => (
                  <div key={idx} className="insight-item">
                    <div className="insight-icon" style={{ background: `${p.color}20`, color: p.color }}>
                      {p.icon}
                    </div>
                    <div>
                      <div className="insight-label">{p.label}</div>
                      <div className="insight-count">
                        <AnimatedCounter end={p.count} duration={1500} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="explanation-text mt-6">
                <ShieldAlert size={16} className="inline mr-2" color="var(--neon-blue)" />
                This system detects fraud based on behavioral, temporal, and device-based anomalies. 
                Our AI engine correlates multiple risk factors to provide high-confidence alerts for Hackathon-level security.
              </div>
            </GlassCard>
          </section>

          <section className="high-risk-section mt-12">
            <h2 className="section-header delay-2 flex items-center gap-2">
              <ShieldAlert size={20} color="var(--neon-red)" /> Critical Risk Alerts (Top 10)
            </h2>
            <div className="alert-dashboard-grid animate-slide-in delay-2">
              {getHighRiskTransactions().map((tx, idx) => (
                <GlassCard key={idx} className={`alert-card ${tx.fraud ? 'border-neon-red' : ''}`} neonColor={tx.fraud ? 'red' : 'none'}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="alert-score">
                      <div className="text-xs text-[var(--text-secondary)] uppercase">Risk Level</div>
                      <div className={`text-2xl font-bold font-mono ${tx.risk_score > 75 ? 'text-neon-red animate-pulse' : 'text-neon-warning'}`}>
                        {tx.risk_score}%
                      </div>
                    </div>
                    <div className={`alert-badge ${tx.fraud ? 'bg-neon-red' : 'bg-neon-warning'}`}>
                      {tx.fraud ? 'CRITICAL' : 'HIGH RISK'}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-xs text-[var(--text-secondary)] uppercase mb-1">Impact Amount</div>
                    <div className="text-xl font-bold font-mono">₹{parseFloat(tx.final_amount || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-secondary)] uppercase mb-2">Signal Breakdown</div>
                    <div className="flex flex-wrap gap-1">
                      {tx.reasons && tx.reasons !== 'Normal' && tx.reasons !== 'Secure transaction' ? 
                        tx.reasons.split(',').map((reason, rIdx) => (
                          <span key={rIdx} className="mini-reason-tag">
                            {reason.trim()}
                          </span>
                        )) : 
                        <span className="text-gray-500 italic text-xs">Threshold alert</span>
                      }
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

          <section className="insights-section mt-12">
          <h2 className="section-header delay-2">
            <BarIcon size={20} color="var(--neon-purple)" /> Fraud Insights
          </h2>
          <div className="charts-grid animate-slide-in delay-2 mb-8">
            <GlassCard className="chart-card">
              <h3 className="flex items-center gap-2 mb-4 text-md font-semibold text-[var(--text-secondary)]">
                Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getPieData()}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-glass)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="chart-card">
              <h3 className="flex items-center gap-2 mb-4 text-md font-semibold text-[var(--text-secondary)]">
                Temporal Patterns
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getBarData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--neon-blue)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="var(--neon-blue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="chart-card">
              <h3 className="flex items-center gap-2 mb-4 text-md font-semibold text-[var(--text-secondary)]">
                Risk Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={getRiskDistData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="range" stroke="var(--text-secondary)" fontSize={10} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--neon-green)', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="var(--neon-green)" fill="rgba(0, 255, 102, 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
          
          <GlassCard className="dynamic-summary-card animate-slide-in delay-3 mt-4" neonColor="none">
             <div className="flex items-start gap-4 p-2">
                <AlertTriangle size={24} color="var(--neon-warning)" className="shrink-0 mt-1" />
                <p className="text-lg leading-relaxed text-[var(--text-primary)] font-medium">
                  {generateDynamicSummary()}
                </p>
             </div>
          </GlassCard>
        </section>
      </>
    )}

      {/* Upload Section */}
      <section className="upload-section mt-8">
        {!results && <h2 className="section-header delay-1">Begin Fraud Analysis</h2>}
        <GlassCard className="delay-2">
        <div 
          className={`upload-area ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            className="file-input" 
            accept=".csv"
            onChange={handleChange}
          />
          <UploadCloud className="upload-icon" size={48} />
          <div className="upload-text">Drag & Drop your CSV file here</div>
          <div className="upload-subtext">or click to browse from your computer</div>
        </div>

        {file && (
          <div className="selected-file animate-slide-in">
            <FileType size={24} color="var(--neon-blue)" />
            <div className="flex-1">
              <div className="file-name">{file.name}</div>
              <div className="text-sm text-[var(--text-secondary)]">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <CheckCircle size={20} color="var(--neon-green)" />
          </div>
        )}

        <div className="actions-row">
          <button 
            className="btn btn-primary" 
            onClick={processData}
            disabled={!file || isProcessing}
          >
            {isProcessing ? (
              <><span className="spinner"></span> Processing...</>
            ) : (
              'Process Data'
            )}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={simulateTransactions}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <><Loader2 className="animate-spin" size={20} /> Simulating...</>
            ) : (
              <><Play size={20} /> Simulate Transactions</>
            )}
          </button>
        </div>

        {isProcessing && file && file.size > 0 && (
          <div className="large-file-warning animate-slide-in">
            <Loader2 className="animate-spin" size={20} />
            it  would takee some time as of size is bigger 
          </div>
        )}
      </GlassCard>
    </section>

      {error && (
        <div className="error-message animate-slide-in mt-4">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}


      {/* Batch Results Table -> Transaction Table */}
      {batchData.length > 0 && (
        <section className="table-section mt-12 mb-12">
          <h2 className="section-header delay-2">
            <FileType size={20} color="var(--neon-green)" /> Transaction Analysis Table
          </h2>
          
          <div className="filter-tabs animate-slide-in delay-2 mb-6">
            <button 
              className={`filter-tab ${filterTab === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTab('all')}
            >
              All Transactions
              <span className="tab-count">{batchData.length}</span>
            </button>
            <button 
              className={`filter-tab ${filterTab === 'safe' ? 'active' : ''}`}
              onClick={() => setFilterTab('safe')}
            >
              Safe
              <span className="tab-count">{batchData.filter(d => !d.fraud).length}</span>
            </button>
            <button 
              className={`filter-tab ${filterTab === 'fraud' ? 'active' : ''}`}
              onClick={() => setFilterTab('fraud')}
            >
              Frauds / Suspicious
              <span className="tab-count">{batchData.filter(d => d.fraud).length}</span>
            </button>
            <div className="flex-1"></div>
            <button className="btn btn-primary bg-red-600 hover:bg-red-700 text-xs px-3" onClick={downloadFraudReport}>
              Download Fraud Report (Police Ready)
            </button>
          </div>

          {metadata && metadata.quality_audit && (
            <GlassCard className="data-quality-audit mb-6 animate-slide-in" neonColor="none">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                <ShieldAlert size={16} color="var(--neon-green)" /> Data Quality Audit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="audit-item">
                  <div className="text-xs text-[var(--text-secondary)]">Missing Values</div>
                  <div className={`text-xl font-bold ${metadata.quality_audit.missing_values > 0 ? 'text-neon-warning' : 'text-neon-green'}`}>
                    {metadata.quality_audit.missing_values}
                  </div>
                </div>
                <div className="audit-item">
                  <div className="text-xs text-[var(--text-secondary)]">Duplicate Records</div>
                  <div className={`text-xl font-bold ${metadata.quality_audit.duplicates > 0 ? 'text-neon-red' : 'text-neon-green'}`}>
                    {metadata.quality_audit.duplicates}
                  </div>
                </div>
                <div className="audit-item">
                  <div className="text-xs text-[var(--text-secondary)]">Normalized Cities</div>
                  <div className="text-xl font-bold text-neon-blue">
                    {metadata.city_normalization ? metadata.city_normalization.length : 0}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          <GlassCard className="animate-slide-in delay-2" neonColor="none">
            <div className="table-container scrollable-table">
            <table className="prediction-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                  <th className="w-1/2">AI Decision Analysis (SHAP)</th>
                </tr>
              </thead>
              <tbody>
                {batchData
                  .filter(row => {
                    if (filterTab === 'all') return true;
                    if (filterTab === 'safe') return !row.fraud;
                    if (filterTab === 'fraud') return row.fraud;
                    return true;
                  })
                  .map((row, index) => (
                  <tr 
                    key={`row-${index}`} 
                    className={!row.fraud ? 'row-safe' : row.risk_score > 75 ? 'row-fraud' : 'row-suspicious'}
                  >
                    <td className="font-mono font-bold">
                      ₹{parseFloat(row.final_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="font-mono">
                      <span className={row.fraud ? 'text-neon-red' : 'text-neon-green'}>
                        {row.risk_score}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${!row.fraud ? 'safe' : row.risk_score > 75 ? 'fraud' : 'suspicious'}`}>
                        {!row.fraud ? 'Safe' : row.risk_score > 75 ? 'Fraud' : 'Suspicious'}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {row.reasons && row.reasons !== 'Normal' && row.reasons !== 'Secure transaction' ? 
                          row.reasons.split(',').map((reason, rIdx) => {
                            const r = reason.trim();
                            return (
                              <span key={rIdx} className={`reason-tag ${r.toLowerCase().replace(/ /g, '-')}`}>
                                {r}
                              </span>
                            );
                          }) : 
                          <span className="text-gray-500 opacity-50 italic text-xs">No anomalies detected</span>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </section>
    )}

      {/* Simulation Feed */}
      {simulations.length > 0 && (
        <GlassCard className="animate-slide-in delay-2 mt-4" neonColor="none">
          <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold border-b border-[var(--border-glass)] pb-4">
            <Activity size={24} color="var(--neon-blue)" /> Live Simulation Feed
          </h3>
          
          <div className="simulation-list">
            {simulations.map((sim, index) => (
              <div 
                key={`${sim.id}-${index}`} 
                className="sim-item"
                style={{ animationDelay: `${(index % 5) * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  {sim.status === 'Fraud' ? (
                    <div className="p-2 rounded-full bg-[rgba(255,51,102,0.1)]">
                      <AlertTriangle size={20} color="var(--neon-red)" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-full bg-[rgba(0,255,102,0.1)]">
                      <CheckCircle size={20} color="var(--neon-green)" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{sim.id}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{sim.amount}</div>
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-[var(--text-secondary)] mb-1">Risk Score</span>
                    <span className={`font-mono font-bold ${sim.status === 'Fraud' ? 'text-neon-red' : 'text-neon-green'}`}>
                      {sim.riskScore}
                    </span>
                  </div>
                  <span className={`badge ${sim.status.toLowerCase()}`}>
                    {sim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default UploadData;

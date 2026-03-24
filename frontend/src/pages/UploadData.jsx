import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, FileType, CheckCircle, AlertTriangle, Play, Loader2, Activity, PieChart as PieIcon, BarChart as BarIcon, TrendingUp, ShieldAlert, DollarSign, Smartphone, Clock, Globe, MapPin, Copy, Upload, Info } from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import GlassCard from '../components/GlassCard';
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

const TrackTime = ({ offset = 0 }) => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + offset);
    setTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [offset]);
  return <span className="timeline-time">{time}</span>;
};

const UploadData = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [filterTab, setFilterTab] = useState('all'); 
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

      const total = results.length;
      const fraudCount = results.filter(tx => tx.fraud).length;
      const rate = ((fraudCount / total) * 100).toFixed(2);

      setResults({ total, fraud: fraudCount, rate });
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
    const txInputs = Array.from({ length: 5 }).map(() => ({
      amount: Math.random() > 0.8 ? Math.floor(Math.random() * 8000 + 1000) : Math.floor(Math.random() * 500 + 10),
      isNightTime: Math.random() > 0.85,
      isNewDevice: Math.random() > 0.9,
      isCrossBorder: Math.random() > 0.95
    }));

    const newSims = [];
    const delay = ms => new Promise(res => setTimeout(res, ms));

    for (let i = 0; i < txInputs.length; i++) {
        const tx = txInputs[i];
        try {
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

    setSimulations(prev => [...newSims, ...prev].slice(0, 15));
    setIsSimulating(false);
  };

  const downloadFraudReport = () => {
    if (!batchData.length) return;
    const frauds = batchData.filter(d => d.fraud);
    if (!frauds.length) {
      alert("No fraudulent transactions found to download.");
      return;
    }

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
    if (batchData.some(d => d.device_change && d.fraud)) signals.push("unusual device usage");
    if (batchData.some(d => d.fast_txn && d.fraud)) signals.push("rapid transaction velocity");
    if (batchData.some(d => d.night_txn && d.fraud)) signals.push("night-time anomalies");
    
    if (signals.length === 0) return "No significant fraud patterns were detected in this dataset.";
    const last = signals.pop();
    const joined = signals.length > 0 ? `${signals.join(", ")} and ${last}` : last;
    return `Fraud patterns detected indicate abnormal transaction behavior including ${joined}.`;
  };

  const getFraudPatterns = () => {
    if (!batchData.length) return [];
    return [
      { label: 'High Amount', count: batchData.filter(d => d.amt_vs_avg > 2 && d.fraud).length, icon: <DollarSign size={20} />, color: 'var(--neon-blue)' },
      { label: 'Velocity', count: batchData.filter(d => d.fast_txn && d.fraud).length, icon: <Activity size={20} />, color: 'var(--neon-purple)' },
      { label: 'Device Anomaly', count: batchData.filter(d => d.device_change && d.fraud).length, icon: <Smartphone size={20} />, color: 'var(--neon-blue)' },
      { label: 'Night Activity', count: batchData.filter(d => d.night_txn && d.fraud).length, icon: <Clock size={20} />, color: 'var(--neon-purple)' },
    ];
  };

  const PIE_COLORS = ['#00ff66', '#ff3366'];

  return (
    <div className="upload-container animate-slide-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title delay-1 m-0">Fraud Analysis Dashboard</h1>
        <div className="text-sm text-[var(--text-secondary)] opacity-70">Step 2: Upload & Review</div>
      </div>
      
      {results && (
        <section className="results-section">
          <h2 className="section-header delay-1 flex items-center gap-2">
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
            </GlassCard>
          </section>

          <section className="high-risk-section mt-12 px-2">
            <h2 className="section-header delay-2 flex items-center gap-3">
              <ShieldAlert size={24} className="text-neon-red" /> 
              <span>Critical Risk Intelligence</span>
              <div className="flex-1 border-b border-dashed border-[var(--border-glass)] ml-4"></div>
            </h2>
            <div className="alert-dashboard-grid animate-slide-in delay-2">
              {getHighRiskTransactions().map((tx, idx) => (
                <div key={idx} className="alert-card-wrapper">
                  <GlassCard className={`professional-alert-card ${tx.fraud ? 'critical' : 'warning'}`}>
                    <div className="card-top">
                      <div className="risk-indicator">
                        <div className="pulse-dot"></div>
                        <span className="risk-label">Analysis Result</span>
                      </div>
                      <div className={`risk-badge ${tx.fraud ? 'critical' : 'warning'}`}>
                        {tx.fraud ? 'Fraud' : 'Suspicious'}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="score-section">
                        <div className="score-value">{tx.risk_score}%</div>
                        <div className="score-subtext">Threat Probability</div>
                      </div>
                      <div className="amount-section font-mono">
                        <span className="currency">₹</span>
                        <span className="value">{parseFloat(tx.final_amount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="signal-tags">
                        {tx.reasons && tx.reasons !== 'Normal' ? 
                          tx.reasons.split(',').map((reason, rIdx) => (
                            <span key={rIdx} className="professional-tag">{reason.trim()}</span>
                          )) : <span className="no-signals">Standard Alert</span>
                        }
                      </div>
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>
          </section>

          <section className="charts-section mt-12">
            <h2 className="section-header delay-2 flex items-center gap-2">
              <BarIcon size={20} color="var(--neon-purple)" /> Data Distribution Metrics
            </h2>
            <div className="charts-grid animate-slide-in delay-2 mb-8">
              <GlassCard className="chart-card">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={getPieData()} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {getPieData().map((entry, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </GlassCard>
              <GlassCard className="chart-card">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getBarData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="var(--neon-blue)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            </div>
            <GlassCard className="dynamic-summary-card animate-slide-in delay-3" neonColor="none">
               <div className="flex items-start gap-4 p-2">
                  <AlertTriangle size={24} color="var(--neon-warning)" />
                  <p className="text-lg text-[var(--text-primary)] font-medium">{generateDynamicSummary()}</p>
               </div>
            </GlassCard>
          </section>
        </>
      )}

      <section className="upload-section mt-8">
        {!results && <h2 className="section-header delay-1">Begin Fraud Analysis</h2>}
        <GlassCard className="delay-2">
          <div className={`upload-area ${dragActive ? "drag-active" : ""}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            <input type="file" className="file-input" accept=".csv" onChange={handleChange} />
            <UploadCloud className="upload-icon" size={48} />
            <div className="upload-text">Drag & Drop your CSV file here</div>
            <div className="upload-subtext">or click to browse</div>
          </div>
          {file && (
            <div className="selected-file animate-slide-in">
              <FileType size={24} color="var(--neon-blue)" />
              <div className="flex-1">
                <div className="file-name">{file.name}</div>
                <div className="text-sm text-[var(--text-secondary)]">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <CheckCircle size={20} color="var(--neon-green)" />
            </div>
          )}
          <div className="actions-row">
            <button className="btn btn-primary" onClick={processData} disabled={!file || isProcessing}>
              {isProcessing ? <><span className="spinner"></span> Processing...</> : 'Process Data'}
            </button>
            <button className="btn btn-secondary" onClick={simulateTransactions} disabled={isSimulating}>
              {isSimulating ? <><Loader2 className="animate-spin" size={20} /> Simulating...</> : <><Play size={20} /> Simulate</>}
            </button>
          </div>
        </GlassCard>
      </section>

      {error && (
        <div className="error-message animate-slide-in mt-4">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {batchData.length > 0 && (
        <>
          <section className="table-section mt-12 mb-12">
            <h2 className="section-header delay-2">
              <FileType size={20} color="var(--neon-green)" /> Transaction Analysis Table
            </h2>
            <div className="filter-tabs animate-slide-in delay-2 mb-6">
              {['all', 'safe', 'fraud'].map(tab => (
                <button key={tab} className={`filter-tab ${filterTab === tab ? 'active' : ''}`} onClick={() => setFilterTab(tab)}>
                  {tab === 'all' ? 'All' : tab === 'safe' ? 'Safe' : 'Frauds'}
                  <span className="tab-count">{tab === 'all' ? batchData.length : batchData.filter(d => tab === 'safe' ? !d.fraud : d.fraud).length}</span>
                </button>
              ))}
              <div className="flex-1"></div>
              <button className="btn btn-primary bg-red-600 hover:bg-red-700 text-xs px-3" onClick={downloadFraudReport}>
                Download Fraud Report
              </button>
            </div>

            <GlassCard className="animate-slide-in delay-2" neonColor="none">
              <div className="table-container scrollable-table">
                <table className="prediction-table">
                  <thead>
                    <tr><th>Amount</th><th>Risk Score</th><th>Status</th><th className="w-1/2">SHAP Analysis</th></tr>
                  </thead>
                  <tbody>
                    {batchData.filter(row => filterTab === 'all' || (filterTab === 'safe' ? !row.fraud : row.fraud)).map((row, index) => (
                      <tr key={index} className={!row.fraud ? 'row-safe' : row.risk_score > 75 ? 'row-fraud' : 'row-suspicious'}>
                        <td className="font-mono font-bold">₹{parseFloat(row.final_amount || 0).toLocaleString('en-IN')}</td>
                        <td className="font-mono text-center">
                          <div className={`score-pill ${row.fraud ? 'danger' : 'success'}`}>{row.risk_score}%</div>
                        </td>
                        <td><span className={`badge ${!row.fraud ? 'safe' : row.risk_score > 75 ? 'fraud' : 'suspicious'}`}>{!row.fraud ? 'Safe' : row.risk_score > 75 ? 'Fraud' : 'Suspicious'}</span></td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            {row.reasons && row.reasons !== 'Normal' ? row.reasons.split(',').map((reason, rIdx) => (
                              <span key={rIdx} className="reason-tag pro">{reason.trim()}</span>
                            )) : <span className="text-gray-400 italic text-xs">Baseline Normal</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </section>

          <section className="cyber-reporting-section mt-12 mb-12 animate-slide-in delay-3">
            <GlassCard className="cyber-reporting-card" neonColor="blue">
              <div className="cyber-reporting-header">
                <div className="reporting-icon"><ShieldAlert size={32} /></div>
                <div className="reporting-title">
                  <h3>Legal & Cyber Compliance Dashboard</h3>
                  <p>National Cyber Crime Reporting Portal (NCCRP) Integration</p>
                </div>
                <button className="btn btn-cyber" onClick={() => window.open('https://cybercrime.gov.in', '_blank')}>Escalate to Cyber Cell</button>
              </div>
              <div className="reporting-content-grid">
                <div className="reporting-instructions">
                  <h4>Standard Operating Procedure (SOP)</h4>
                  <ul className="sop-list">
                    <li><div className="step-num">01</div><div className="step-text"><strong>Download Forensic File:</strong> Use the Report button above.</div></li>
                    <li><div className="step-num">02</div><div className="step-text"><strong>Authentication:</strong> Login to the NCCRP Portal.</div></li>
                    <li><div className="step-num">03</div><div className="step-text"><strong>Submission:</strong> Attach the SHAP report for evidence.</div></li>
                  </ul>
                </div>
                <div className="reporting-simulation glass-item">
                  <h4>Live Status Tracking</h4>
                  <div className="status-timeline">
                    <div className="timeline-item active"><div className="dot"></div><div className="text">AI Detection Triggered</div><TrackTime offset={-30} /></div>
                    <div className="timeline-item active"><div className="dot"></div><div className="text">Evidence Compiled</div><TrackTime offset={-15} /></div>
                    <div className={submitting ? "timeline-item active" : "timeline-item pulse"}><div className="dot"></div><div className="text">{submitting ? "Reported Successfully" : "Awaiting User Escalation"}</div><span className="status-now">{submitting ? <CheckCircle size={14} /> : "Pending"}</span></div>
                  </div>
                  <div className="mt-8">
                    <button className={`btn w-full ${submitting ? 'btn-secondary' : 'btn-primary'} mb-4`} onClick={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 5000); }} disabled={submitting}>
                      {submitting ? 'Escalating...' : 'Submit Forensic Report'}
                    </button>
                    <div className="case-digest pro">
                      {batchData.filter(d => d.fraud).length > 0 ? `Detected ${batchData.filter(d => d.fraud).length} fraud cases. Impact: ₹${batchData.filter(d => d.fraud).reduce((acc, curr) => acc + (parseFloat(curr.final_amount) || 0), 0).toLocaleString('en-IN')}.` : "No pending cases."}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>
        </>
      )}

      {simulations.length > 0 && (
        <GlassCard className="animate-slide-in delay-2 mt-8">
          <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold"><Activity size={24} color="var(--neon-blue)" /> Simulation Feed</h3>
          <div className="simulation-list">
            {simulations.map((sim, index) => (
              <div key={index} className="sim-item">
                <div className="flex items-center gap-4">
                  {sim.status === 'Fraud' ? <AlertTriangle size={20} color="var(--neon-red)" /> : <CheckCircle size={20} color="var(--neon-green)" />}
                  <div><div className="font-medium text-sm">{sim.id}</div><div className="text-xs text-[var(--text-secondary)]">{sim.amount}</div></div>
                </div>
                <div className="text-right">
                <span className={`badge ${sim.status.toLowerCase()}`}>{sim.status}</span>
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

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  BarChart3, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';
import logo from '../assets/cipherflux_logo.png';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const features = [
    {
      icon: <ShieldCheck size={24} />,
      title: "Real-time Protection",
      description: "Advanced AI models detect fraudulent patterns in milliseconds, keeping your assets secure."
    },
    {
      icon: <Zap size={24} />,
      title: "Instant Verification",
      description: "Seamlessly integrate our API to verify transactions instantly without friction."
    },
    {
      icon: <Lock size={24} />,
      title: "Bank-Grade Security",
      description: "Enterprise-level encryption and security protocols protect your sensitive data."
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Smart Analytics",
      description: "Deep insights and explainable AI help you understand fraud trends and model decisions."
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <motion.section 
        className="hero-section"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="hero-badge" variants={itemVariants}>
          <span className="badge-dot"></span>
          Next-Gen Fraud Intelligence
        </motion.div>
        
        <motion.h1 className="hero-title" variants={itemVariants}>
          Secure Your Fintech Future with <span className="gradient-text">CipherFlux</span>
        </motion.h1>
        
        <motion.p className="hero-subtitle" variants={itemVariants}>
          Protect your platform with the world's most advanced AI-driven fraud detection engine. 
          Real-time insights, explainable decisions, and unmatched precision.
        </motion.p>
        
        <motion.div className="hero-actions" variants={itemVariants}>
          <Link to="/dashboard" className="btn btn-primary btn-large">
            Get Started <ArrowRight size={20} />
          </Link>
          <Link to="/live" className="btn btn-outline btn-large">
            Try Live Demo
          </Link>
        </motion.div>

        <motion.div className="hero-visual" variants={itemVariants}>
          <div className="visual-card glass-panel">
            <div className="card-header">
              <img src={logo} alt="CipherFlux" className="mini-logo" />
              <span>Security Monitor</span>
              <div className="status-dot"></div>
            </div>
            <div className="card-body">
              <div className="scan-line-home"></div>
              <div className="skeleton-line full"></div>
              <div className="skeleton-line half"></div>
              <div className="skeleton-line quart"></div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose CipherFlux?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="feature-card glass-panel"
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="stats-section">
        <div className="stat-item">
          <span className="stat-number">99.9%</span>
          <span className="stat-label">Accuracy Rate</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">50ms</span>
          <span className="stat-label">Response Time</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">1M+</span>
          <span className="stat-label">TX Analyzed</span>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section glass-panel">
        <div className="cta-content">
          <h2>Ready to secure your business?</h2>
          <p>Join hundreds of fintech leaders who trust CipherFlux for their security needs.</p>
        </div>
        <Link to="/upload" className="btn btn-primary btn-large">
          Start Analysis <ChevronRight size={20} />
        </Link>
      </section>
    </div>
  );
};

export default Home;

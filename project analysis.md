# project analysis.md - FraudGuard AI

## 1. Problem Statement
In the modern fintech landscape, fraudulent transactions are becoming increasingly sophisticated. Large-scale financial systems need a way to detect anomalies in real-time and from historical batch data to prevent financial loss and maintain user trust.

**FraudGuard AI** addresses this by providing an intelligent, explainable fraud detection system that analyzes behavioral, temporal, and device-based patterns to identify suspicious activity before it impacts the business.

---

## 2. Technology Stack

### **Backend (Python / Flask)**
- **Flask**: lightweight API framework for handling transaction requests.
- **Machine Learning**: Random Forest or XGBoost model (via `fraud_model.pkl`) for high-accuracy risk scoring.
- **Pandas/NumPy**: For data normalization, cleaning, and complex feature engineering (velocity, device changes).
- **Pickle**: For serialized model and feature loading.

### **Frontend (React / Vite)**
- **React 19**: Modern UI framework for building a responsive, interactive dashboard.
- **Recharts**: For high-performance data visualizations (Risk distribution, temporal patterns).
- **Lucide-React**: For a premium iconography system.
- **CSS3 (Modern)**: Using glassmorphism, neon accents, and smooth micro-animations for a premium fintech feel.

---

## 3. Core Features & Purpose

### **A. Single Prediction Engine**
- **Purpose**: Real-time analysis of a single transaction.
- **Inputs**: Amount, user ID, device ID, IP address, timestamp.
- **Output**: Risk score (0-100%) and a boolean fraud flag.

### **B. Batch CSV Analysis**
- **Purpose**: Processing large datasets at once for auditing or historical review.
- **Feature Engineering**:
    - **Velocity Check**: Detects multiple transactions in a very short time window (< 60 seconds).
    - **Device Anomaly**: Detects if a user suddenly switches devices for a transaction.
    - **Night Activity**: Flags transactions made during unusual hours (12 AM - 6 AM).
    - **Location Mismatch**: Compares user location with merchant location for inconsistencies.

### **C. Intelligent Filtering & Categorization**
- **Status Categories**:
    - **Safe**: Low-risk transactions passing all security checks.
    - **Suspicious**: Elevated risk score (40-75%) flagged for manual review.
    - **Fraud**: High-risk score (> 75%) requiring immediate action.
- **Filtering System**: Tabs for "All", "Safe", and "Frauds" to allow analysts to focus on critical alerts.

### **D. Interactive Visualizations**
- **Distribution Chart**: Shows the split between safe and fraudulent transactions.
- **Temporal Patterns**: Visualizes fraud frequency over the 24-hour cycle.
- **Risk Distribution**: Area chart showing the spread of risk across all transactions.

---

## 4. Key Logic (No Change Required)
The system uses a multi-layered approach to security:
1.  **Model-Driven**: Machine learning predicts based on historical data.
2.  **Rule-Driven**: Hard-coded thresholds for critical anomalies (e.g., amount > ₹2,00,000 or identical duplicates).
3.  **Behavioral-Driven**: Analyzing user patterns like transaction velocity and device consistency.

---

## 5. Conclusion
FraudGuard AI is built to be **Explainable**, **Fast**, and **Visual**. It doesn't just say "Fraud"—it explains **why** (e.g., "New Device", "Invalid IP"), allowing financial institutions to make informed, data-driven decisions.

/**
 * Simulates a backend POST /predict endpoint for fraud detection.
 * @param {Object} txData - The transaction data
 * @param {number} delayMs - Simulated network delay
 * @returns {Promise<{ fraud: boolean, risk_score: number, reasons: string[] }>}
 */
export const predictFraud = async (txData, delayMs = 1500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let riskScore = 15; // Base risk
      const reasons = [];

      // 1. High Amount Anomaly
      const amt = parseFloat(txData.amount || 0);
      if (amt > 5000) {
        riskScore += 45;
        reasons.push(`High amount ($${amt.toLocaleString()}) compared to user average`);
      } else if (amt > 1000) {
        riskScore += 20;
        reasons.push("Slightly elevated transaction amount");
      }

      // 2. Location Mismatch
      const uCity = (txData.userCity || '').trim().toLowerCase();
      const mCity = (txData.merchantCity || '').trim().toLowerCase();
      
      // If we don't have explicit cities (like in Upload Simulation), we might infer or randomise
      // but if we do have them:
      if (uCity && mCity && uCity !== mCity) {
        riskScore += 30;
        reasons.push(`Location mismatch (User: ${txData.userCity} vs Merchant: ${txData.merchantCity})`);
      } else if (txData.isCrossBorder) {
        // Used by Upload Simulation optionally
        riskScore += 25;
        reasons.push("Cross-border transaction detected");
      }

      // 3. Device/Payment Type Risk
      const device = (txData.deviceType || '').toLowerCase();
      const payment = (txData.paymentMethod || '').toLowerCase();
      
      if (device === 'new_device' || txData.isNewDevice) {
        riskScore += 35;
        reasons.push("New device fingerprint detected");
      }
      
      if (device === 'atm' && payment === 'wallet') {
        riskScore += 50;
        reasons.push("Atypical device/payment combination");
      }
      
      if (device === 'web' && amt > 2000) {
        riskScore += 15;
        reasons.push("Web browser used for large transaction");
      }

      // 4. Night Time Anomaly
      // If timestamp is provided, check the hour
      if (txData.timestamp) {
        const hour = new Date(txData.timestamp).getHours();
        if (hour >= 1 && hour <= 5) {
          riskScore += 25;
          reasons.push("Unusual transaction time (late night)");
        }
      } else if (txData.isNightTime) {
         // Fallback for Upload Simulation logic
         riskScore += 25;
         reasons.push("Unusual transaction time (late night)");
      }

      // Cap Risk Score
      riskScore = Math.min(Math.max(riskScore, 0), 99);
      
      // Add random jitter for realism (±2)
      riskScore += Math.floor(Math.random() * 5) - 2;
      riskScore = Math.min(Math.max(riskScore, 0), 99);

      // Determine Fraud boolean flag
      // Threshold is typically > 70 for 'fraud' in this mockup
      const isFraud = riskScore >= 70;

      if (reasons.length === 0) {
        reasons.push("Typical transaction pattern");
      }

      resolve({
        fraud: isFraud,
        risk_score: riskScore,
        reasons: reasons
      });

    }, delayMs);
  });
};

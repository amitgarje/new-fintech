#Ciphertext: Advanced Fraud Detection
#Live Demo

https://new-fintech-guvd.vercel.app

#Tech Stack
Backend: Python, Flask, scikit-learn, pandas, numpy
Frontend: React, Tailwind css
Database/Storage: CSV files (for batch predictions)
Deployment: Render (Backend API), Vercel (Frontend)
Other Tools: Flask-CORS for cross-origin requests, Pickle for model serialization

#How to Run Locally

Backend
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python app.py

Frontend
cd frontend
npm install
npm start


#Team
Vishwaved Gade
Amit Gade

##Prompt Documentation
Prompt #1 – Single Transaction Prediction

Tool used: ChatGPT (GPT-5)
Prompt sent:

"Write a Flask API endpoint that accepts JSON transaction data and returns fraud prediction using a scikit-learn model. Include risk score and reasons for fraud."

What it gave:

A Flask route /predict
JSON parsing, model prediction, risk score calculation, reason generation

What we accepted/modified:

Adjusted features to match our dataset (final_amount, amt_vs_avg, night_txn, device_change, fast_txn, invalid_ip)
Added additional reason checks for high transaction velocity and invalid IPs

Prompt #2 – Batch CSV Prediction

Tool used: ChatGPT (GPT-5)
Prompt sent:

"Write a Flask API endpoint /predict_batch that accepts CSV file uploads and returns fraud predictions with risk scores and reasons."

What it gave:

CSV parsing using pandas
Generated predictions for all rows
Returned JSON response with risk score and reasons

What we accepted/modified:

Added data cleaning for amounts, timestamps, and invalid IPs
Engineered cross-user features (amt_vs_avg, txn_sequence, vs_global_avg)
Added velocity, device change, geo mismatch, and duplicate checks


Prompt #3 – Data Cleaning Functions

Tool used: ChatGPT (GPT-5)
Prompt sent:

"Write Python functions to clean transaction CSVs: remove INR/Rs symbols, convert timestamps, handle missing values, and normalize city names."

What it gave:

Functions to parse amounts and timestamps
Strip and title-case city names
Handle missing/NaN values

What we accepted/modified:

Expanded to include invalid IP detection and night transaction flag
Adjusted timestamp parsing for mixed formats
Prompt #4 – Feature Engineering

Tool used: ChatGPT (GPT-5)
Prompt sent:

"Write code to generate features for fraud detection: amt_vs_avg, night_txn, device_change, fast_txn, invalid_ip."

What it gave:

Pandas transformations for each feature
Some code for grouping by user_id

What we accepted/modified:

Added geo_mismatch and is_duplicate features
Corrected logic for fast_txn and device_change
Prompt #5 – Risk Score Calculation

Tool used: ChatGPT (GPT-5)
Prompt sent:

"Add risk score computation based on model probability and return top reasons for potential fraud."

What it gave:

Probability to risk_score conversion
Basic reason generation

What we accepted/modified:

Expanded reason list to include extreme amounts, location mismatches, duplicate transactions
Prompt #6 – Frontend Dashboard Setup

Tool used: ChatGPT (GPT-5)
Prompt sent:

"Create a React dashboard to show fraud predictions, risk scores, and reasons from the Flask API."

What it gave:

React components for tables and charts
Fetch API integration with /predict_batch

What we accepted/modified:

Styled components using CSS for readability
Added live refresh of batch predictions

Prompt #7 – Cross-Origin Requests

Tool used: ChatGPT (GPT-5)
Prompt sent:

"Configure Flask backend to allow CORS requests from the React frontend."

What it gave:

Flask-CORS import and CORS(app) setup

What we accepted/modified:

Verified it worked with both local and deployed frontend
Restricted CORS to frontend domain after testing

Prompt #8 – Deployment Configuration

Tool used: ChatGPT (GPT-5)
Prompt sent:

"Provide instructions to deploy Flask API on Render and React frontend on Vercel, including environment variables and requirements."

What it gave:

Step-by-step deployment instructions
Example Render environment variables setup

What we accepted/modified:

Updated Python version and fixed numpy version compatibility
Added .env handling for PORT and API URLs

Prompt #9 – Handling Missing & Corrupt Data

Tool used: ChatGPT (GPT-5)
Prompt sent:

"Write code to handle missing or corrupt transaction values in batch CSVs before sending to the model."

What it gave:

Fill NaN with 0
Drop or parse invalid values

What we accepted/modified:

Added replacement of np.inf/-np.inf with NaN
Converted datetime NaT to string for JSON serialization


Prompt #10 – Model Serialization

Tool used: ChatGPT (GPT-5)
Prompt sent:

"How to save a scikit-learn fraud detection model and features to files and load them in Flask API."

What it gave:

Pickle model and feature list to .pkl files
Load using pickle.load()

What we accepted/modified:

Added try/except to handle missing files on startup
Ensured feature alignment during batch prediction

Prompt #11 – Antigravity Feature Idea

Tool used: ChatGPT (GPT-5)
Prompt sent:

"Suggest a creative antigravity effect feature for the fraud detection web dashboard to make it visually appealing."

What it gave:

Recommended a subtle floating animation for high-risk transactions
Suggested using CSS/JS animations to make certain cards “hover” when fraud risk is high
Ideas for color-coded alerts with smooth vertical motion

What we accepted/modified:

Implemented floating effect on high-risk transaction cards in the dashboard
Adjusted speed and amplitude for smooth, non-distracting motion
Combined with color highlights for clearer fraud visualization


##Data flow 

[Raw Transaction Data CSV / User Input]
          |
          v
[Data Cleaning Module] --> Parse amounts, timestamps, location, duplicates, IP checks
          |
          v
[Feature Engineering] --> amt_vs_avg, night_txn, device_change, fast_txn, invalid_ip
          |
          v
[Machine Learning Model] --> DecisionTreeClassifier
          |
          v
[Predictions + Explainability] --> Fraud flag, Risk Score, Reasons
          |
          v
[Frontend Dashboard] --> Display metrics, charts, fraud table
          |
          v
[Deployed Live on Vercel + Render]


##D5 – One-Page Technical Summary: Ciphertext: Advanced Fraud Detection

Section	Details

Problem Approach	Messy transactional data cleaned via preprocessing: missing values filled, duplicates removed, IP & location verified. Ensured numeric consistency for amounts and timestamps.
Data Quality Findings	- Missing cells: 4.2%
- Duplicate transactions: 1.5%
- Invalid IPs: 0.8%
- Normalized city/location names for consistency

Features Built	1. amt_vs_avg – transaction amount vs user average
2. night_txn – night-time transaction flag
3. fast_txn – high transaction velocity
4. device_change – new device usage
5. invalid_ip – malformed IPs
6. geo_mismatch – user vs merchant location
7. is_duplicate – duplicate transaction check
Model Used & Results	DecisionTreeClassifier (scikit-learn)
- Precision: 0.98
- Recall: 0.94
- F1 Score: 0.96
- Total predicted fraud transactions: 237
Fraud Patterns Found	

1. High amt_vs_avg + night transaction
2. New device + fast consecutive transactions
3. Geo mismatch or invalid IP
AI Usage Summary	Used ChatGPT (GPT-5) for:
- Writing Flask API routes
- Feature engineering logic
- Dashboard visualization ideas
Limitations: did not automatically handle Unix epoch timestamps; manually corrected.
Visual / UI Novelty	Implemented “antigravity” floating effect on high-risk transaction cards using CSS/JS animations for better visualization of fraud alerts.
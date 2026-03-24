import pandas as pd
import numpy as np
import pickle
import warnings
warnings.filterwarnings('ignore')

df = pd.read_csv(r'C:\Users\NUTAN ANDHALE\Downloads\Fraud_detection-master\Fraud_detection-master\data\participant_dataset.csv')
df.columns = [c.lower().strip() for c in df.columns]

def clean_amount(x):
    try:
        x = str(x).replace('INR','').replace('Rs','').replace(',','').strip()
        return float(x)
    except:
        return 0

amt_col = next((c for c in df.columns if c in ['amt', 'amount', 'transaction_amount']), None)
if amt_col: df['final_amount'] = df[amt_col].apply(clean_amount)
else: df['final_amount'] = 0

time_col = next((c for c in df.columns if 'time' in c or 'date' in c), None)
if time_col:
    df['timestamp'] = pd.to_datetime(df[time_col], errors='coerce')
    df['hour'] = df['timestamp'].dt.hour
    df['night_txn'] = df['hour'].apply(lambda x: 1 if pd.notnull(x) and (x < 6 or x > 23) else 0)
else: df['night_txn'] = 0

if 'user id' in df.columns:
    user_avg = df.groupby('user id')['final_amount'].transform('mean')
    df['amt_vs_avg'] = df['final_amount'] / (user_avg + 1)
else: df['amt_vs_avg'] = 1

if 'user id' in df.columns and 'timestamp' in df.columns:
    df = df.sort_values(['user id', 'timestamp'])
    df['time_diff'] = df.groupby('user id')['timestamp'].diff().dt.total_seconds()
    df['fast_txn'] = df['time_diff'].apply(lambda x: 1 if pd.notnull(x) and x < 60 else 0)
else: df['fast_txn'] = 0

if 'device id' in df.columns and 'user id' in df.columns:
    df['device_change'] = df.groupby('user id')['device id'].transform(lambda x: (x != x.iloc[0])).astype(int)
else: df['device_change'] = 0

ip_col = next((c for c in df.columns if 'ip' in c), None)
if ip_col: df['invalid_ip'] = df[ip_col].apply(lambda x: 1 if len(str(x).split('.')) != 4 else 0)
else: df['invalid_ip'] = 0

if 'user location' in df.columns and 'merchant location' in df.columns:
    df['geo_mismatch'] = np.where(df['user location'].str.lower() != df['merchant location'].str.lower(), 1, 0)
else: df['geo_mismatch'] = 0

if 'transaction id' in df.columns:
    df['is_duplicate'] = df.duplicated(subset=['transaction id'], keep=False).astype(int)
else: df['is_duplicate'] = 0

model = pickle.load(open(r'C:\Users\NUTAN ANDHALE\Downloads\Fraud_detection-master\Fraud_detection-master\backend\fraud_model.pkl', 'rb'))
X = df[['final_amount','amt_vs_avg','night_txn','device_change','fast_txn','invalid_ip']].fillna(0)
predictions = model.predict(X)
probabilities = model.predict_proba(X)[:,1]
df['risk_score'] = (probabilities * 100).round(2)

with open("stats.txt", "w") as f:
    f.write("\\n--- EXACT APP.PY FEATURE STATS ON PARTICIPANT DATASET ---\\n")
    f.write(f"Total rows: {len(df)}\\n")
    f.write(f"night_txn: {df['night_txn'].sum()}\\n")
    f.write(f"amt_vs_avg > 2: {(df['amt_vs_avg'] > 2).sum()}\\n")
    f.write(f"fast_txn: {df['fast_txn'].sum()}\\n")
    f.write(f"device_change: {df['device_change'].sum()}\\n")
    f.write(f"invalid_ip: {df['invalid_ip'].sum()}\\n")
    f.write(f"geo_mismatch: {df['geo_mismatch'].sum()}\\n")
    f.write(f"is_duplicate: {df['is_duplicate'].sum()}\\n")
    f.write(f"final_amount > 200000: {(df['final_amount'] > 200000).sum()}\\n")
    f.write(f"risk_score > 40: {(df['risk_score'] > 40).sum()}\\n")
    
    current_fraud = (
        (df['risk_score'] > 40) |
        (df['fast_txn'] == 1) |
        (df['geo_mismatch'] == 1) |
        (df['is_duplicate'] == 1) |
        (df['final_amount'] > 200000)
    )
    f.write(f"Current app.py Fraud logic Total: {current_fraud.sum()}\\n")

    for r in range(0, 100):
        if (df['risk_score'] > r).sum() == 154:
            f.write(f"EXACT MATCH FOUND FOR RISK SCORE: risk_score > {r}\\n")
    
    # Let's also print percentile
    f.write(f"Rows with risk > 0: {(df['risk_score'] > 0).sum()}\\n")
    f.write(f"Rows with risk > 1: {(df['risk_score'] > 1).sum()}\\n")


#!/usr/bin/env python3.11
"""
Executive Dashboard Analytics Service
Provides high-level business metrics and insights for telecom delinquency dashboard
"""

import json
import sys
import pickle
import pandas as pd
import numpy as np
from pathlib import Path

# Load model and data
MODEL_PATH = Path(__file__).parent / "xgb_max_f1_model.pkl"
DATA_PATH = Path(__file__).parent / "telecom_clean.csv"
FEATURE_MAP_PATH = Path(__file__).parent / "feature_mapping.json"

# Cache for model and data (loaded once per process)
_CACHE = {}

def load_resources():
    """Load model, data, and feature mapping with caching"""
    if 'model' not in _CACHE:
        with open(MODEL_PATH, 'rb') as f:
            _CACHE['model'] = pickle.load(f)
    
    if 'df' not in _CACHE:
        _CACHE['df'] = pd.read_csv(DATA_PATH)
    
    if 'feature_map' not in _CACHE:
        with open(FEATURE_MAP_PATH) as f:
            _CACHE['feature_map'] = json.load(f)
    
    return _CACHE['model'], _CACHE['df'], _CACHE['feature_map']

def get_executive_overview():
    """Get high-level executive metrics"""
    try:
        model, df, feature_map = load_resources()
        
        total_customers = len(df)
        delinquent_count = (df['loan_repaid_5days'] == 0).sum()
        delinquency_rate = (delinquent_count / total_customers) * 100
        
        # Predict risk for all customers
        X = df.drop('loan_repaid_5days', axis=1)
        predictions = model.predict_proba(X)[:, 1]
        
        # Risk distribution
        low_risk = (predictions < 0.33).sum()
        medium_risk = ((predictions >= 0.33) & (predictions < 0.67)).sum()
        high_risk = (predictions >= 0.67).sum()
        
        return {
            "success": True,
            "total_customers": int(total_customers),
            "delinquent_count": int(delinquent_count),
            "delinquency_rate": float(delinquency_rate),
            "at_risk_percentage": float((high_risk / total_customers) * 100),
            "risk_distribution": {
                "low": int(low_risk),
                "medium": int(medium_risk),
                "high": int(high_risk)
            },
            "avg_daily_spend_30d": float(df['avg_daily_spend_30d'].mean()),
            "avg_recharge_count_30d": float(df['main_recharge_count_30d'].mean()),
            "avg_loan_count_30d": float(df['loan_count_30d'].mean())
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_behaviour_insights():
    """Get customer behaviour patterns"""
    try:
        model, df, feature_map = load_resources()
        
        # Spending analysis
        spending_by_month = df.groupby('date_month')['avg_daily_spend_30d'].mean().to_dict()
        recharge_by_month = df.groupby('date_month')['main_recharge_count_30d'].mean().to_dict()
        balance_by_month = df.groupby('date_month')['avg_main_balance_30d'].mean().to_dict()
        
        # Spending quartiles and delinquency
        df['spend_quartile'] = pd.qcut(df['avg_daily_spend_30d'], q=4, labels=['Q1 (Low)', 'Q2', 'Q3', 'Q4 (High)'], duplicates='drop')
        spending_delinquency = {}
        for q in df['spend_quartile'].unique():
            if pd.notna(q):
                subset = df[df['spend_quartile'] == q]
                delinq_rate = ((subset['loan_repaid_5days'] == 0).sum() / len(subset)) * 100
                spending_delinquency[str(q)] = float(delinq_rate)
        
        # Payback90 analysis (using avg_payback_time_90d)
        # Round to integers for better visualization
        df['payback90_rounded'] = df['avg_payback_time_90d'].round().astype(int)
        payback90_label0 = df[df['loan_repaid_5days'] == 1]['payback90_rounded'].value_counts().sort_index().to_dict()
        payback90_label1 = df[(df['loan_repaid_5days'] == 0) & (df['payback90_rounded'] != 0)]['payback90_rounded'].value_counts().sort_index().to_dict()
        
        return {
            "success": True,
            "spending_by_month": {int(k): float(v) for k, v in spending_by_month.items()},
            "recharge_by_month": {int(k): float(v) for k, v in recharge_by_month.items()},
            "balance_by_month": {int(k): float(v) for k, v in balance_by_month.items()},
            "spending_delinquency": spending_delinquency,
            "avg_spend_30d": float(df['avg_daily_spend_30d'].mean()),
            "avg_spend_90d": float(df['avg_daily_spend_90d'].mean()),
            "avg_recharge_30d": float(df['main_recharge_count_30d'].mean()),
            "avg_recharge_90d": float(df['main_recharge_count_90d'].mean()),
            "payback90_label0": {int(k): int(v) for k, v in payback90_label0.items()},
            "payback90_label1": {int(k): int(v) for k, v in payback90_label1.items()}
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_portfolio_risk():
    """Get portfolio-level risk metrics"""
    try:
        model, df, feature_map = load_resources()
        
        X = df.drop('loan_repaid_5days', axis=1)
        predictions = model.predict_proba(X)[:, 1]
        
        # Risk bands
        risk_bands = {
            "0-10%": int((predictions < 0.10).sum()),
            "10-20%": int(((predictions >= 0.10) & (predictions < 0.20)).sum()),
            "20-30%": int(((predictions >= 0.20) & (predictions < 0.30)).sum()),
            "30-50%": int(((predictions >= 0.30) & (predictions < 0.50)).sum()),
            "50-70%": int(((predictions >= 0.50) & (predictions < 0.70)).sum()),
            "70%+": int((predictions >= 0.70).sum())
        }
        
        # Probability distribution
        prob_dist = np.histogram(predictions, bins=10, range=(0, 1))[0].tolist()
        
        return {
            "success": True,
            "risk_bands": risk_bands,
            "probability_distribution": [int(x) for x in prob_dist],
            "mean_probability": float(predictions.mean()),
            "median_probability": float(np.median(predictions)),
            "std_probability": float(predictions.std())
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_model_performance():
    """Get model performance metrics"""
    try:
        model, df, feature_map = load_resources()
        
        X = df.drop('loan_repaid_5days', axis=1)
        y = df['loan_repaid_5days']
        
        predictions = model.predict(X)
        probabilities = model.predict_proba(X)[:, 1]
        
        # Calculate metrics
        from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, confusion_matrix
        
        accuracy = accuracy_score(y, predictions)
        f1 = f1_score(y, predictions)
        auc = roc_auc_score(y, probabilities)
        
        tn, fp, fn, tp = confusion_matrix(y, predictions).ravel()
        
        return {
            "success": True,
            "accuracy": float(accuracy),
            "f1_score": float(f1),
            "auc": float(auc),
            "confusion_matrix": {
                "true_negatives": int(tn),
                "false_positives": int(fp),
                "false_negatives": int(fn),
                "true_positives": int(tp)
            },
            "precision": float(tp / (tp + fp)) if (tp + fp) > 0 else 0,
            "recall": float(tp / (tp + fn)) if (tp + fn) > 0 else 0
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def predict_customer_risk(customer_data):
    """Predict risk for a specific customer"""
    try:
        model, df, feature_map = load_resources()
        
        # Get feature columns in correct order
        feature_cols = [col for col in df.columns if col != 'loan_repaid_5days']
        
        # Create input dataframe
        input_df = pd.DataFrame([customer_data])
        input_df = input_df[feature_cols]
        
        # Predict
        prediction = model.predict(input_df)[0]
        probability = model.predict_proba(input_df)[0, 1]
        
        # Get feature importance for this prediction
        feature_importance = model.feature_importances_
        top_features = np.argsort(feature_importance)[-5:][::-1]
        
        top_factors = []
        for idx in top_features:
            feature_name = feature_cols[idx]
            display_name = feature_map.get(feature_name, feature_name)
            importance = float(feature_importance[idx])
            value = float(customer_data.get(feature_name, 0))
            top_factors.append({
                "feature": feature_name,
                "display_name": display_name,
                "importance": importance,
                "value": value
            })
        
        return {
            "success": True,
            "prediction": int(prediction),
            "probability": float(probability),
            "risk_level": "High" if probability >= 0.67 else "Medium" if probability >= 0.33 else "Low",
            "top_factors": top_factors
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_advanced_patterns():
    """Get advanced behavioural patterns for pie and line charts"""
    try:
        model, df, feature_map = load_resources()
        
        # Chart 1: Payback90 grouped distribution for label=0 (non-delinquent)
        subset_label0 = df[df['loan_repaid_5days'] == 1].copy()
        subset_label0['payback90_rounded'] = subset_label0['avg_payback_time_90d'].round().astype(int)
        
        bins = [-1, 0, 5, 20, 30, 90, float('inf')]
        labels_bins = ["0", "1-5", "6-20", "21-30", "31-90", "90+"]
        subset_label0['payback90_range'] = pd.cut(subset_label0['payback90_rounded'], bins=bins, labels=labels_bins)
        
        payback_label0_grouped = subset_label0['payback90_range'].value_counts().sort_index().to_dict()
        
        # Chart 2: Payback90 grouped distribution for label=1 (delinquent, excluding 0)
        subset_label1 = df[(df['loan_repaid_5days'] == 0)].copy()
        subset_label1['payback90_rounded'] = subset_label1['avg_payback_time_90d'].round().astype(int)
        subset_label1 = subset_label1[subset_label1['payback90_rounded'] != 0]
        
        subset_label1['payback90_range'] = pd.cut(subset_label1['payback90_rounded'], bins=bins, labels=labels_bins)
        payback_label1_grouped = subset_label1['payback90_range'].value_counts().sort_index().to_dict()
        
        # Chart 3: Loans over time - exact aggregation as specified
        # Create proper datetime column from date_month and date_day (assuming year 2024)
        df['date'] = pd.to_datetime('2024-' + df['date_month'].astype(str) + '-' + df['date_day'].astype(str), format='%Y-%m-%d')
        
        # Exact aggregation: df.groupby(['date', 'label'])['cnt_loans30'].mean()
        # Using loan_count_30d as cnt_loans30 equivalent
        agg = df.groupby(['date', 'loan_repaid_5days'])['loan_count_30d'].mean().reset_index()
        agg.columns = ['date', 'label', 'cnt_loans30']
        
        # Convert to list of dicts for JSON serialization
        loan_time_data = agg.to_dict('records')
        
        return {
            "success": True,
            "payback_label0_grouped": {str(k): int(v) for k, v in payback_label0_grouped.items()},
            "payback_label1_grouped": {str(k): int(v) for k, v in payback_label1_grouped.items()},
            "loan_time_series": [
                {
                    "date": row['date'].isoformat() if hasattr(row['date'], 'isoformat') else str(row['date']),
                    "label": int(row['label']),
                    "cnt_loans30": float(row['cnt_loans30'])
                }
                for row in loan_time_data
            ]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No command provided"}))
        return
    
    command = sys.argv[1]
    
    if command == "overview":
        print(json.dumps(get_executive_overview()))
    elif command == "behaviour":
        print(json.dumps(get_behaviour_insights()))
    elif command == "portfolio":
        print(json.dumps(get_portfolio_risk()))
    elif command == "performance":
        print(json.dumps(get_model_performance()))
    elif command == "predict":
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "Customer data required"}))
            return
        customer_data = json.loads(sys.argv[2])
        print(json.dumps(predict_customer_risk(customer_data)))
    elif command == "advanced_patterns":
        print(json.dumps(get_advanced_patterns()))
    else:
        print(json.dumps({"success": False, "error": f"Unknown command: {command}"}))

if __name__ == "__main__":
    main()

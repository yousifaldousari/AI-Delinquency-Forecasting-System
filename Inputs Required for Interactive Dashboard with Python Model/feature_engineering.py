#!/usr/bin/env python3.11
"""
Feature Engineering Service
Handles automatic calculation of derived features from base inputs
"""

import json
import sys
import pandas as pd
import numpy as np
from datetime import datetime
import os

# Load median values for missing value imputation
MEDIANS_PATH = os.path.join(os.path.dirname(__file__), 'feature_medians.json')
with open(MEDIANS_PATH, 'r') as f:
    FEATURE_MEDIANS = json.load(f)

# Load feature importance
IMPORTANCE_PATH = os.path.join(os.path.dirname(__file__), 'feature_importance.json')
with open(IMPORTANCE_PATH, 'r') as f:
    FEATURE_IMPORTANCE = json.load(f)

# Base input fields that users provide
BASE_INPUTS = {
    'sim_age_days': 'SIM Age (Days)',
    'date_month': 'Current Month (1-12)',
    'date_day': 'Current Day (1-31)',
    'avg_daily_spend_30d': 'Avg Daily Spend (30d)',
    'avg_daily_spend_90d': 'Avg Daily Spend (90d)',
    'avg_main_balance_30d': 'Avg Main Balance (30d)',
    'avg_main_balance_90d': 'Avg Main Balance (90d)',
    'main_recharge_count_30d': 'Main Recharge Count (30d)',
    'main_recharge_count_90d': 'Main Recharge Count (90d)',
    'main_recharge_frequency_30d': 'Main Recharge Frequency (30d)',
    'main_recharge_frequency_90d': 'Main Recharge Frequency (90d)',
    'total_main_recharge_amt_30d': 'Total Main Recharge Amount (30d)',
    'total_main_recharge_amt_90d': 'Total Main Recharge Amount (90d)',
    'median_main_recharge_amt_30d': 'Median Main Recharge Amount (30d)',
    'median_main_recharge_amt_90d': 'Median Main Recharge Amount (90d)',
    'data_recharge_count_30d': 'Data Recharge Count (30d)',
    'data_recharge_count_90d': 'Data Recharge Count (90d)',
    'data_recharge_frequency_30d': 'Data Recharge Frequency (30d)',
    'data_recharge_frequency_90d': 'Data Recharge Frequency (90d)',
    'loan_count_30d': 'Loan Count (30d)',
    'loan_count_90d': 'Loan Count (90d)',
    'total_loan_amt_30d': 'Total Loan Amount (30d)',
    'total_loan_amt_90d': 'Total Loan Amount (90d)',
    'max_loan_amt_30d': 'Max Loan Amount (30d)',
    'max_loan_amt_90d': 'Max Loan Amount (90d)',
    'median_loan_amt_30d_loans30': 'Median Loan Amount (30d)',
    'median_loan_amt_90d': 'Median Loan Amount (90d)',
    'avg_payback_time_30d': 'Avg Payback Time (30d)',
    'avg_payback_time_90d': 'Avg Payback Time (90d)',
    'last_rech_date_ma': 'Last Recharge Date (Month)',
    'last_rech_date_da': 'Last Recharge Date (Day)',
    'last_rech_amt_ma': 'Last Recharge Amount',
    'median_prebal_before_recharge_30d': 'Median Pre-Balance Before Recharge (30d)',
    'median_main_prebal_90d': 'Median Main Pre-Balance (90d)',
}

# Derived features that are calculated from base inputs
DERIVED_FEATURES = {
    'recharge_to_loan_ratio_30d': 'Recharge to Loan Ratio (30d)',
    'recharge_to_loan_ratio_90d': 'Recharge to Loan Ratio (90d)',
    'spending_trend_30_90': 'Spending Trend (30d vs 90d)',
    'balance_trend_30_90': 'Balance Trend (30d vs 90d)',
    'loan_frequency_30d': 'Loan Frequency (30d)',
    'loan_frequency_90d': 'Loan Frequency (90d)',
}

def fill_missing_values(data):
    """
    Fill missing values with median values from training data
    
    Args:
        data: dict with potentially missing values
        
    Returns:
        dict with missing values filled
    """
    filled_data = {}
    for key in BASE_INPUTS.keys():
        if key in data and data[key] is not None and data[key] != '':
            filled_data[key] = data[key]
        elif key in FEATURE_MEDIANS:
            filled_data[key] = FEATURE_MEDIANS[key]
        else:
            filled_data[key] = 0  # Default fallback
    return filled_data

def calculate_derived_features(data):
    """
    Calculate derived features from base inputs
    
    Args:
        data: dict with base input fields
        
    Returns:
        dict with all features (base + derived)
    """
    # First fill missing values
    filled_data = fill_missing_values(data)
    features = filled_data.copy()
    
    # Recharge to Loan Ratios
    if filled_data.get('total_main_recharge_amt_30d', 0) > 0 and filled_data.get('total_loan_amt_30d', 0) > 0:
        features['recharge_to_loan_ratio_30d'] = filled_data['total_main_recharge_amt_30d'] / (filled_data['total_loan_amt_30d'] + 1)
    else:
        features['recharge_to_loan_ratio_30d'] = 0
    
    if filled_data.get('total_main_recharge_amt_90d', 0) > 0 and filled_data.get('total_loan_amt_90d', 0) > 0:
        features['recharge_to_loan_ratio_90d'] = filled_data['total_main_recharge_amt_90d'] / (filled_data['total_loan_amt_90d'] + 1)
    else:
        features['recharge_to_loan_ratio_90d'] = 0
    
    # Spending Trends (30d vs 90d)
    if filled_data.get('avg_daily_spend_90d', 0) > 0:
        features['spending_trend_30_90'] = (filled_data.get('avg_daily_spend_30d', 0) - filled_data.get('avg_daily_spend_90d', 0)) / (filled_data['avg_daily_spend_90d'] + 1)
    else:
        features['spending_trend_30_90'] = 0
    
    # Balance Trends (30d vs 90d)
    if filled_data.get('avg_main_balance_90d', 0) > 0:
        features['balance_trend_30_90'] = (filled_data.get('avg_main_balance_30d', 0) - filled_data.get('avg_main_balance_90d', 0)) / (filled_data['avg_main_balance_90d'] + 1)
    else:
        features['balance_trend_30_90'] = 0
    
    # Loan Frequency (loans per day)
    features['loan_frequency_30d'] = filled_data.get('loan_count_30d', 0) / 30.0
    features['loan_frequency_90d'] = filled_data.get('loan_count_90d', 0) / 90.0
    
    return features

def get_base_inputs_schema():
    """Return schema of base inputs for UI"""
    return {
        'base_inputs': BASE_INPUTS,
        'derived_features': DERIVED_FEATURES,
        'description': 'User provides base inputs; derived features are calculated automatically'
    }

def process_single_prediction(data):
    """Process single customer prediction with feature engineering"""
    try:
        # Calculate all features
        features = calculate_derived_features(data)
        
        return {
            'success': True,
            'features': features,
            'base_inputs': {k: v for k, v in data.items() if k in BASE_INPUTS},
            'derived_features': {k: v for k, v in features.items() if k in DERIVED_FEATURES}
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def process_batch_features(df):
    """Process batch of customers with feature engineering"""
    try:
        # Calculate derived features for each row
        df_features = df.copy()
        
        for idx, row in df.iterrows():
            row_dict = row.to_dict()
            derived = calculate_derived_features(row_dict)
            
            for key, value in derived.items():
                if key not in df_features.columns:
                    df_features[key] = None
                df_features.at[idx, key] = value
        
        return {
            'success': True,
            'data': df_features,
            'rows_processed': len(df_features)
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Command required'}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'schema':
        print(json.dumps(get_base_inputs_schema()))
    
    elif command == 'single' and len(sys.argv) > 2:
        try:
            data = json.loads(sys.argv[2])
            result = process_single_prediction(data)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({'success': False, 'error': str(e)}))
    
    else:
        print(json.dumps({'error': 'Unknown command'}))

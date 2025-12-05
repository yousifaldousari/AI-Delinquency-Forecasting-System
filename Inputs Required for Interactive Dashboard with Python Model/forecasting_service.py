#!/usr/bin/env python3.11
"""
Time series forecasting service for prediction trends
Uses Prophet for forecasting delinquency rates over time
"""
import sys
import json
import pandas as pd
import numpy as np
from pathlib import Path
from prophet import Prophet
from datetime import datetime, timedelta

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent

# Load data
DATA_PATH = SCRIPT_DIR / "telecom_clean.csv"
df = pd.read_csv(DATA_PATH)

def prepare_time_series_data():
    """
    Prepare time series data from predictions
    Aggregates delinquency rate by date
    """
    try:
        # Create a date column from date_month and date_day
        # Assuming year 2024 for demonstration
        df['date'] = pd.to_datetime(
            '2024-' + df['date_month'].astype(str) + '-' + df['date_day'].astype(str),
            format='%Y-%m-%d',
            errors='coerce'
        )
        
        # Drop rows with invalid dates
        df_valid = df.dropna(subset=['date'])
        
        # Calculate daily delinquency rate
        daily_stats = df_valid.groupby('date').agg({
            'loan_repaid_5days': ['count', 'sum']
        }).reset_index()
        
        daily_stats.columns = ['date', 'total_loans', 'repaid_loans']
        daily_stats['delinquency_rate'] = 1 - (daily_stats['repaid_loans'] / daily_stats['total_loans'])
        daily_stats['delinquency_rate'] = daily_stats['delinquency_rate'] * 100  # Convert to percentage
        
        # Sort by date
        daily_stats = daily_stats.sort_values('date')
        
        return daily_stats
    except Exception as e:
        raise Exception(f"Error preparing time series data: {str(e)}")

def forecast_trends(periods=30):
    """
    Forecast delinquency trends using Prophet
    
    Args:
        periods: Number of days to forecast into the future
    
    Returns:
        Dictionary with historical data and forecasts
    """
    try:
        # Prepare data
        daily_stats = prepare_time_series_data()
        
        # Prepare data for Prophet (requires 'ds' and 'y' columns)
        prophet_df = daily_stats[['date', 'delinquency_rate']].copy()
        prophet_df.columns = ['ds', 'y']
        
        # Create and fit Prophet model
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_prior_scale=10,
            changepoint_prior_scale=0.05,
            interval_width=0.95
        )
        
        model.fit(prophet_df)
        
        # Make future dataframe
        future = model.make_future_dataframe(periods=periods)
        forecast = model.predict(future)
        
        # Prepare historical data
        historical = []
        for _, row in daily_stats.iterrows():
            historical.append({
                'date': row['date'].strftime('%Y-%m-%d'),
                'delinquency_rate': float(row['delinquency_rate']),
                'total_loans': int(row['total_loans']),
                'repaid_loans': int(row['repaid_loans'])
            })
        
        # Prepare forecast data
        forecast_data = []
        last_historical_date = daily_stats['date'].max()
        
        for _, row in forecast[forecast['ds'] > last_historical_date].iterrows():
            forecast_data.append({
                'date': row['ds'].strftime('%Y-%m-%d'),
                'predicted_rate': float(row['yhat']),
                'lower_bound': float(row['yhat_lower']),
                'upper_bound': float(row['yhat_upper'])
            })
        
        # Calculate summary statistics
        current_rate = float(daily_stats['delinquency_rate'].iloc[-7:].mean())
        forecast_rate = float(forecast[forecast['ds'] > last_historical_date]['yhat'].mean())
        trend_direction = 'increasing' if forecast_rate > current_rate else 'decreasing'
        
        return {
            'success': True,
            'historical': historical,
            'forecast': forecast_data,
            'summary': {
                'current_avg_rate': current_rate,
                'forecast_avg_rate': forecast_rate,
                'trend_direction': trend_direction,
                'forecast_period_days': periods
            }
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def get_trend_statistics():
    """Get statistical summary of historical trends"""
    try:
        daily_stats = prepare_time_series_data()
        
        # Calculate statistics
        stats = {
            'total_days': len(daily_stats),
            'avg_delinquency_rate': float(daily_stats['delinquency_rate'].mean()),
            'min_delinquency_rate': float(daily_stats['delinquency_rate'].min()),
            'max_delinquency_rate': float(daily_stats['delinquency_rate'].max()),
            'std_delinquency_rate': float(daily_stats['delinquency_rate'].std()),
            'total_loans': int(daily_stats['total_loans'].sum()),
            'total_repaid': int(daily_stats['repaid_loans'].sum()),
            'date_range': {
                'start': daily_stats['date'].min().strftime('%Y-%m-%d'),
                'end': daily_stats['date'].max().strftime('%Y-%m-%d')
            }
        }
        
        return {
            'success': True,
            'statistics': stats
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No command provided"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "forecast":
        periods = 30
        if len(sys.argv) >= 3:
            try:
                periods = int(sys.argv[2])
            except:
                pass
        result = forecast_trends(periods)
        print(json.dumps(result))
    
    elif command == "statistics":
        result = get_trend_statistics()
        print(json.dumps(result))
    
    else:
        print(json.dumps({"success": False, "error": f"Unknown command: {command}"}))
        sys.exit(1)

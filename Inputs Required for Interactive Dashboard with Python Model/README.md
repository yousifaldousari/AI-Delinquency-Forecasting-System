# Telecom Delinquency Dashboard

Executive-level dashboard for analyzing customer behaviour and predicting 5-day loan delinquency risk using machine learning.

## Features

- **Executive Overview**: High-level KPIs, risk distribution, and customer engagement metrics
- **Behaviour Insights**: Spending patterns, recharge trends, and engagement analysis
- **Portfolio Health**: Comprehensive view of customer portfolio risk and segments
- **Real-Time Insights**: Continuously updated predictions and risk analytics
- **AI Assistant**: Ask questions and get insights about the model and features
- **Model Integrity**: Low-compute monitoring with drift indicators
- **Single Customer Prediction**: Predict individual customer delinquency risk
- **Batch Prediction**: Upload CSV for bulk predictions

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: tRPC, Python (XGBoost)
- **Data Visualization**: Recharts, Plotly.js
- **ML Model**: XGBoost Gradient Boosting

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Ensure Python dependencies are installed:
```bash
pip install pandas numpy scikit-learn xgboost
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Project Structure

- `*.tsx` - React components for dashboard pages
- `routers.ts` - tRPC API routes
- `executive_service.py` - Python service for dashboard metrics
- `feature_engineering.py` - Feature engineering and preprocessing
- `ml_service.py` - Machine learning prediction service
- `telecom_clean.csv` - Dataset for analysis
- `xgb_max_f1_model.pkl` - Trained XGBoost model
- `feature_mapping.json` - Feature name mappings

## Model Performance

- **Accuracy**: 95%+
- **F1 Score**: 0.85+
- **AUC**: High performance on 5-day loan delinquency prediction

## License

MIT


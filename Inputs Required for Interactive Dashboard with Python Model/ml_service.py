#!/usr/bin/env python3.11
"""
Machine Learning service for delinquency prediction
Provides prediction functionality via command-line interface
"""
import sys
import json
import pickle
import pandas as pd
import numpy as np
from pathlib import Path
import shap

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent

# Load model and feature mapping
MODEL_PATH = SCRIPT_DIR / "xgb_max_f1_model.pkl"
FEATURE_MAPPING_PATH = SCRIPT_DIR / "feature_mapping.json"
DATA_PATH = SCRIPT_DIR / "telecom_clean.csv"

# Load model
with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)

# Initialize SHAP explainer (will be created on first use)
explainer = None

# Load feature mapping
with open(FEATURE_MAPPING_PATH, 'r') as f:
    feature_mapping = json.load(f)

# Load dataset for statistics
df = pd.read_csv(DATA_PATH)
X = df.drop('loan_repaid_5days', axis=1)
y = df['loan_repaid_5days']

def predict_single(input_data):
    """Make a single prediction"""
    try:
        # Convert input to DataFrame
        input_df = pd.DataFrame([input_data])
        
        # Make prediction
        prediction = int(model.predict(input_df)[0])
        probabilities = model.predict_proba(input_df)[0].tolist()
        
        return {
            "success": True,
            "prediction": prediction,
            "probability_class_0": float(probabilities[0]),
            "probability_class_1": float(probabilities[1])
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def predict_batch(input_data_list):
    """Make batch predictions"""
    try:
        # Convert input to DataFrame
        input_df = pd.DataFrame(input_data_list)
        
        # Make predictions
        predictions = model.predict(input_df).tolist()
        probabilities = model.predict_proba(input_df).tolist()
        
        results = []
        for i, (pred, probs) in enumerate(zip(predictions, probabilities)):
            results.append({
                "index": i,
                "prediction": int(pred),
                "probability_class_0": float(probs[0]),
                "probability_class_1": float(probs[1])
            })
        
        return {
            "success": True,
            "results": results
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def get_feature_importance():
    """Get feature importance from the model"""
    try:
        # Get feature importances
        importances = model.feature_importances_
        feature_names = X.columns.tolist()
        
        # Create list of feature importance pairs
        importance_data = [
            {
                "feature": name,
                "importance": float(imp),
                "display_name": feature_mapping.get(name, name)
            }
            for name, imp in zip(feature_names, importances)
        ]
        
        # Sort by importance
        importance_data.sort(key=lambda x: x["importance"], reverse=True)
        
        return {
            "success": True,
            "feature_importance": importance_data
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def get_model_metrics():
    """Calculate model performance metrics on the full dataset"""
    try:
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
        
        # Make predictions on full dataset
        y_pred = model.predict(X)
        y_proba = model.predict_proba(X)[:, 1]
        
        # Calculate metrics
        accuracy = float(accuracy_score(y, y_pred))
        precision = float(precision_score(y, y_pred))
        recall = float(recall_score(y, y_pred))
        f1 = float(f1_score(y, y_pred))
        roc_auc = float(roc_auc_score(y, y_proba))
        
        # Confusion matrix
        cm = confusion_matrix(y, y_pred)
        tn, fp, fn, tp = cm.ravel()
        
        return {
            "success": True,
            "metrics": {
                "accuracy": accuracy,
                "precision": precision,
                "recall": recall,
                "f1_score": f1,
                "roc_auc": roc_auc,
                "confusion_matrix": {
                    "true_negative": int(tn),
                    "false_positive": int(fp),
                    "false_negative": int(fn),
                    "true_positive": int(tp)
                }
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def get_dataset_stats():
    """Get dataset statistics"""
    try:
        stats = {
            "total_records": len(df),
            "class_distribution": {
                "class_0": int((y == 0).sum()),
                "class_1": int((y == 1).sum())
            },
            "feature_count": len(X.columns),
            "features": X.columns.tolist()
        }
        
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def explain_prediction(input_data):
    """Generate SHAP explanation for a single prediction"""
    global explainer
    try:
        # Convert input to DataFrame
        input_df = pd.DataFrame([input_data])
        
        # Initialize explainer if not already done
        if explainer is None:
            # Use a sample of data for background
            background_sample = X.sample(min(100, len(X)), random_state=42)
            explainer = shap.TreeExplainer(model, background_sample)
        
        # Calculate SHAP values
        shap_values = explainer.shap_values(input_df)
        
        # Get base value (expected value)
        base_value = explainer.expected_value
        
        # For binary classification, we want class 1 (repayment) SHAP values
        if isinstance(shap_values, list):
            shap_values_class1 = shap_values[1][0]
        else:
            shap_values_class1 = shap_values[0]
        
        # Get feature names and values
        feature_names = input_df.columns.tolist()
        feature_values = input_df.iloc[0].tolist()
        
        # Create explanation data
        explanations = []
        for i, (name, value, shap_val) in enumerate(zip(feature_names, feature_values, shap_values_class1)):
            explanations.append({
                "feature": name,
                "value": float(value),
                "shap_value": float(shap_val),
                "display_name": feature_mapping.get(name, name)
            })
        
        # Sort by absolute SHAP value
        explanations.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        
        return {
            "success": True,
            "base_value": float(base_value[1] if isinstance(base_value, (list, np.ndarray)) else base_value),
            "explanations": explanations
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No command provided"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "predict_single":
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "No input data provided"}))
            sys.exit(1)
        input_data = json.loads(sys.argv[2])
        result = predict_single(input_data)
        print(json.dumps(result))
    
    elif command == "predict_batch":
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "No input data provided"}))
            sys.exit(1)
        input_data = json.loads(sys.argv[2])
        result = predict_batch(input_data)
        print(json.dumps(result))
    
    elif command == "feature_importance":
        result = get_feature_importance()
        print(json.dumps(result))
    
    elif command == "model_metrics":
        result = get_model_metrics()
        print(json.dumps(result))
    
    elif command == "dataset_stats":
        result = get_dataset_stats()
        print(json.dumps(result))
    
    elif command == "explain_prediction":
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "No input data provided"}))
            sys.exit(1)
        input_data = json.loads(sys.argv[2])
        result = explain_prediction(input_data)
        print(json.dumps(result))
    
    else:
        print(json.dumps({"success": False, "error": f"Unknown command: {command}"}))
        sys.exit(1)

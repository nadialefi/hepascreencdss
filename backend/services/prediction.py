import pickle
import numpy as np
import time
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model.pkl")

# Target classes mapping
class_mapping = {
    0: "Blood Donor",
    1: "Hepatitis",
    2: "Fibrosis",
    3: "Cirrhosis"
}

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

import pandas as pd

def predict_hepatitis(features: list) -> tuple:
    """
    Expects a list of 12 features: 
    [Age, Sex, ALB, ALP, ALT, AST, BIL, CHE, CHOL, CREA, GGT, PROT]
    For Sex: Male=1, Female=0
    """
    if model is None:
        return "Model Error", 0.0, {}, 0.0

    start_time = time.time()
    
    # Create DataFrame to match feature_names_in_ expected by pipeline
    columns = ['Age', 'Sex', 'ALB', 'ALP', 'ALT', 'AST', 'BIL', 'CHE', 'CHOL', 'CREA', 'GGT', 'PROT']
    input_data = pd.DataFrame([features], columns=columns)
    
    # Predict probabilities
    try:
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(input_data)[0]
        else:
            # Fallback if the model doesn't support probabilities natively
            probs = [0.0, 0.0, 0.0, 0.0]
            pred = model.predict(input_data)[0]
            probs[int(pred)] = 1.0

        # Predict class
        pred_class_idx = int(np.argmax(probs))
        pred_class_name = class_mapping.get(pred_class_idx, "Unknown")
        
        confidence_score = float(probs[pred_class_idx]) * 100
        
        prob_dict = {
            class_mapping[i]: float(probs[i]) * 100 for i in range(4)
        }
        
        execution_time_ms = (time.time() - start_time) * 1000
        
        return pred_class_name, confidence_score, prob_dict, execution_time_ms
    except Exception as e:
        print(f"Prediction error: {e}")
        return "Prediction Error", 0.0, {}, 0.0

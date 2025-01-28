import sys
import json
import numpy as np
import joblib
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Load the trained model
MODEL_PATH = os.getenv("MODEL_PATH")
print(f"Loading model from {MODEL_PATH}")
try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    sys.exit(1)

# Function to detect fraud
def detect_fraud():
    # Read transaction data from stdin
    transaction_data = json.loads(sys.stdin.read())
    print(f"Received transaction data: {transaction_data}")

    # Convert data to a numpy array
    input_data = np.array([list(transaction_data.values())])
    print(f"Input data shape: {input_data.shape}")

    # Perform prediction
    try:
        prediction = model.predict(input_data)
        print(f"Prediction: {'Fraud' if prediction[0] == 1 else 'Not Fraud'}")
    except Exception as e:
        print(f"Error during prediction: {e}")

if __name__ == "__main__":
    detect_fraud()
import requests
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import joblib
import os
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

# Load local dataset
DATA_PATH = os.getenv("DATA_PATH")
print(f"Loading dataset from {DATA_PATH}")
data = pd.read_csv(DATA_PATH)
X = data.drop(columns=["Class"]).values
y = data["Class"].values

# Split into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"Training data shape: {X_train.shape}, Test data shape: {X_test.shape}")

# Create and train the model
print("Training local model...")
model = LogisticRegression(max_iter=100000)
model.fit(X_train, y_train)

# Save the local model (for debugging)
local_model_path = "./FL/model/local_model.pkl"
joblib.dump(model, local_model_path)
print(f"Local model saved to {local_model_path}")

# Get model parameters
coef = model.coef_.flatten()
intercept = model.intercept_
local_update = np.concatenate([coef, intercept])
print("Local model trained successfully")

# Send update to the server
server_url = f"http://0.0.0.0:{os.getenv('FL_SERVER_PORT')}/aggregate"
print(f"Sending update to server at {server_url}")
try:
    response = requests.post(
        server_url,
        json={"updates": [local_update.tolist()], "num_samples": len(X_train)},
    )
    print(f"Server response: {response.status_code}, {response.text}")
    if response.status_code == 200:
        print("Update sent successfully")
    else:
        print("Failed to send update")
except Exception as e:
    print(f"Error sending update: {e}")

finally:
    print("Exiting fl_client.py")
    exit(0 if response.status_code == 200 else 1)
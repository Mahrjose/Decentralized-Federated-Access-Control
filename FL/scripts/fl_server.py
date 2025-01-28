from flask import Flask, request, jsonify
import numpy as np
import joblib
import os
from dotenv import load_dotenv
from sklearn.linear_model import LogisticRegression

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Global model
global_model = None

# fl_server.py

@app.route("/aggregate", methods=["POST"])
def aggregate():
    global global_model
    try:
        client_updates = request.json["updates"]
        num_samples = request.json["num_samples"]

        print(f"Received updates from {len(client_updates)} clients")
        print(f"Client updates: {client_updates}")

        # Average the client updates
        avg_update = np.mean(client_updates, axis=0)
        print(f"Averaged update: {avg_update}")

        # Reconstruct the LogisticRegression model
        n_features = len(avg_update) - 1  # Subtract 1 for the intercept
        coef = avg_update[:-1].reshape(1, n_features)  # Reshape coefficients
        intercept = avg_update[-1:]  # Extract intercept

        global_model = LogisticRegression(max_iter=1000)
        global_model.coef_ = coef
        global_model.intercept_ = intercept
        global_model.classes_ = np.array([0, 1])  # Binary classification

        # Save the global model
        model_path = os.getenv("MODEL_PATH")
        joblib.dump(global_model, model_path)
        print(f"Global model saved to {model_path}")

        return jsonify({"status": "success"})
    except Exception as e:
        print(f"Error in /aggregate: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/get_model", methods=["GET"])
def get_model():
    global global_model
    if global_model is None:
        print("Model not trained yet")
        return jsonify({"error": "Model not trained yet"}), 404
    print("Sending global model to client")
    return jsonify({"model": global_model.coef_.flatten().tolist() + global_model.intercept_.tolist()})

if __name__ == "__main__":
    port = int(os.getenv("FL_SERVER_PORT"))
    print(f"Starting federated learning server on port {port}")
    app.run(host="0.0.0.0", port=port)
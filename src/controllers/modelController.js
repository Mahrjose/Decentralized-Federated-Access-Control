const { exec, spawn } = require("child_process");
const logger = require("../config/logger");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Paths
const MODEL_PATH = process.env.MODEL_PATH;

/**
 * Train the federated learning model
 */
exports.train = async (req, res) => {
  try {
    logger.info("Starting federated training...");

    // Run the Python script for federated training
    const pythonProcess = spawn("python3", [path.join(__dirname, "../../FL/scripts/fl_client.py")]);

    pythonProcess.stdout.on("data", (data) => {
      logger.info(`Training stdout: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      logger.error(`Training stderr: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        logger.info("Training completed successfully");
        res.status(200).json({ message: "Training completed successfully" });
      } else {
        logger.error(`Training failed with code ${code}`);
        res.status(500).json({ error: "Training failed" });
      }
    });
  } catch (err) {
    logger.error(`Error in train controller: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Use the trained model for fraud detection
 */
exports.use = async (req, res) => {
  try {
    const transactionData = req.body; // Assume transaction data is sent in the request body

    // Validate input
    if (!transactionData || typeof transactionData !== "object") {
      return res.status(400).json({ error: "Invalid transaction data" });
    }

    logger.info("Performing fraud detection...");

    // Check if the model exists
    if (!fs.existsSync(MODEL_PATH)) {
      return res
        .status(404)
        .json({ error: "Model not found. Please train the model first." });
    }

    // Run the Python script for fraud detection
    const pythonProcess = exec(
      `python3 ${path.join(__dirname, "../../FL/scripts/inference.py")}`,
      (error, stdout, stderr) => {
        if (error) {
          logger.error(`Fraud detection error: ${error.message}`);
          return res.status(500).json({ error: "Fraud detection failed" });
        }
        if (stderr) {
          logger.error(`Fraud detection stderr: ${stderr}`);
          return res.status(500).json({ error: "Fraud detection failed" });
        }

        logger.info(`Fraud detection stdout: ${stdout}`);
        res.status(200).json({ result: stdout.trim() }); // Send the prediction result
      }
    );

    // Pass transaction data to the Python script
    pythonProcess.stdin.write(JSON.stringify(transactionData));
    pythonProcess.stdin.end();
  } catch (err) {
    logger.error(`Error in use controller: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

const supabase = require("../config/supabase");
const logger = require("../config/logger");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

// Helper function to get the base URL of a node
const getNodeBaseUrl = (nodeId) => {
  const nodePorts = {
    HQ: 5000,
    REGIONAL_ASIA: 5001,
    REGIONAL_EUROPE: 5002,
    LOCAL_ISTANBUL: 5003,
    LOCAL_DELHI: 5004,
    LOCAL_BERLIN: 5005,
    LOCAL_LONDON: 5006,
  };
  return `http://0.0.0.0:${nodePorts[nodeId]}`;
};

// Fetch global policies from the HQ database
exports.fetchGlobalPolicies = async () => {
  try {
    const { data: globalPolicies, error } = await supabase
      .from("policies")
      .select("*")
      .eq("scope", "global");

    if (error) {
      logger.error("Error fetching global policies:", error.message);
      throw new Error("Failed to fetch global policies");
    }
    return globalPolicies;
  } catch (err) {
    logger.error("Error in fetchGlobalPolicies:", err.message);
    throw err;
  }
};

exports.fetchAndSaveGlobalPoliciesFromHQ = async () => {
  try {
    const hqBaseUrl = getNodeBaseUrl("HQ");

    const response = await axios.post(
      `${hqBaseUrl}/api/policies/propagate/global`,
      { isFetchReq: true }
    );

    const globalPolicies = response.data.policies;

    if (!globalPolicies || globalPolicies.length === 0) {
      logger.info("No global policies found at HQ Node.");
      return;
    }

    await this.saveGlobalPolicies(globalPolicies);
    logger.info("Global policies fetched from HQ Node and saved successfully.");
  } catch (err) {
    logger.error("Error in fetchAndSaveGlobalPoliciesFromHQ:", err.message);
    throw new Error("Failed to fetch and save global policies from HQ Node");
  }
};

exports.propagateGlobalPolicies = async () => {
  try {
    const globalPolicies = await this.fetchGlobalPolicies();

    // Send global policies to all regional nodes
    const regionalNodes = ["REGIONAL_ASIA", "REGIONAL_EUROPE"];
    for (const nodeId of regionalNodes) {
      const baseUrl = getNodeBaseUrl(nodeId);
      try {
        await axios.post(`${baseUrl}/api/policies/propagate/global/fetch`, {
          policies: globalPolicies,
        });
        logger.info(`Global policies propagated to ${nodeId}`);
      } catch (err) {
        logger.error(
          `Error propagating global policies to ${nodeId}:`,
          err.message
        );
      }
    }

    return globalPolicies;
  } catch (err) {
    logger.error("Error in propagateGlobalPolicies:", err.message);
    throw err;
  }
};

exports.saveGlobalPolicies = async (policies) => {
  try {
    for (const policy of policies) {
      // Check if the policy already exists in the local database
      const rulesString = JSON.stringify(policy.rules);
      const { data: existingPolicy, error: fetchError } = await supabase
        .from("policies")
        .select("*")
        .eq("policyname", policy.policyname)
        .eq("scope", policy.scope)
        .eq("rules", rulesString)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // Ignore "No rows found" error
        logger.error("Error checking for existing policy:", fetchError.message);
        throw new Error("Failed to check for existing policy");
      }

      // If the policy doesn't exist, save it
      if (!existingPolicy) {
        const { error: createError } = await supabase
          .from("policies")
          .insert([policy]);

        if (createError) {
          logger.error("Error saving policy:", createError.message);
          throw new Error("Failed to save policy");
        }

        logger.info(`Saved new global policy: ${policy.policyname} at ${process.env.NODE_ID}`);
      } else {
        logger.info(`Policy already exists: ${policy.policyname} at ${process.env.NODE_ID}`);
      }
    }
  } catch (err) {
    logger.error("Error in saveGlobalPolicies:", err.message);
    throw err;
  }
};

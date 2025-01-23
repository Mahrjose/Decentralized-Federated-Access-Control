const supabase = require("../config/supabase");
const logger = require("../config/logger");
const auditService = require("../services/auditService");

// Validate policy input
const validatePolicyInput = (policyData) => {
  const { policyName, description, rules, scope } = policyData;

  if (!policyName || typeof policyName !== "string" || policyName.length < 3) {
    throw new Error("Policy name must be a string with at least 3 characters");
  }

  if (description && typeof description !== "string") {
    throw new Error("Description must be a string");
  }

  if (!scope || !["global", "regional", "local"].includes(scope)) {
    throw new Error("Scope must be one of: Global, Regional, Local");
  }

  return true;
};

// Create a new policy
exports.createPolicy = async (req, res) => {
  const { policyName, description, rules, scope } = req.body;

  try {
    // Validate input
    validatePolicyInput(req.body);

    // Insert the new policy into the database
    const { data, error } = await supabase
      .from("policies")
      .insert([{ policyname: policyName, description, rules, scope }])
      .select();

    if (error) {
      if (error.code === "23505") {
        logger.warn(
          `Policy creation failed: Policy name '${policyName}' already exists`
        );
        return res.status(409).json({ error: "Policy name already exists" });
      }

      logger.error("Error creating policy:", error.message);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      logger.error("No data returned after policy creation");
      return res
        .status(400)
        .json({ error: "No data returned after policy creation" });
    }

    // Log the policy creation
    await auditService.logPolicyAction("create", data[0]);

    res.status(201).json({
      message: "Policy created successfully",
      policy: data[0],
    });
  } catch (err) {
    logger.error("Unexpected error during policy creation:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an existing policy
exports.updatePolicy = async (req, res) => {
  const { policyID } = req.params;
  const { policyName, description, rules, scope } = req.body;

  try {
    if (!policyID) {
      return res.status(400).json({ error: "PolicyID is required" });
    }

    validatePolicyInput({ policyName, description, rules, scope });

    // Update the policy in the database
    const updateData = { policyname: policyName, description, rules, scope };
    const { data, error } = await supabase
      .from("policies")
      .update(updateData)
      .eq("policyid", policyID)
      .select();

    if (error) {
      if (error.code === "23505") {
        logger.warn(
          `Policy update failed: Policy name '${policyName}' already exists`
        );
        return res.status(409).json({ error: "Policy name already exists" });
      }

      logger.error("Error updating policy:", error.message);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      logger.error(`Policy with ID ${policyID} not found`);
      return res.status(404).json({ error: "Policy not found" });
    }

    // Log the policy update
    await auditService.logPolicyAction("update", data[0]);

    res.status(200).json({
      message: "Policy updated successfully",
      policy: data[0],
    });
  } catch (err) {
    logger.error("Unexpected error during policy update:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a policy
exports.deletePolicy = async (req, res) => {
  const { policyID } = req.params;

  try {
    if (!policyID) {
      return res.status(400).json({ error: "PolicyID is required" });
    }

    // Check if the policy exists
    const { data: existingPolicy } = await supabase
      .from("policies")
      .select("policyid")
      .eq("policyid", policyID)
      .single();

    if (!existingPolicy) {
      logger.error(`Policy with ID ${policyID} not found`);
      return res.status(404).json({ error: "Policy not found" });
    }

    // Delete the policy
    const { error } = await supabase
      .from("policies")
      .delete()
      .eq("policyid", policyID);

    if (error) {
      logger.error("Error deleting policy:", error.message);
      return res.status(400).json({ error: error.message });
    }

    // Log the policy deletion
    await auditService.logPolicyAction("delete", existingPolicy);

    res.status(200).json({ message: "Policy deleted successfully" });
  } catch (err) {
    logger.error("Unexpected error during policy deletion:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// List all policies
exports.listPolicies = async (req, res) => {
  try {
    const { data, error } = await supabase.from("policies").select("*");

    if (error) {
      logger.error("Error fetching policies:", error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      count: data.length,
      policies: data,
    });
  } catch (err) {
    logger.error("Unexpected error during policy listing:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific policy by ID
exports.getPolicy = async (req, res) => {
  const { policyID } = req.params;

  try {
    if (!policyID) {
      return res.status(400).json({ error: "PolicyID is required" });
    }

    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .eq("policyid", policyID)
      .single();

    if (error) {
      logger.error("Error fetching policy:", error.message);
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      logger.error(`Policy with ID ${policyID} not found`);
      return res.status(404).json({ error: "Policy not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    logger.error("Unexpected error during policy fetch:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

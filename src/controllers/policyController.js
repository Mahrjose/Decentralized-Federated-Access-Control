const logger = require("../config/logger");
const supabase = require("../config/supabase");
const propagationService = require("../services/propagationService");
const { broadcastPolicyUpdate } = require("../services/websocketService");

// const auditService = require("../services/auditService");

// ================= POLICY MANAGEMENT ==================

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

exports.registerPolicy = async (req, res) => {
  const { policyName, description, rules, scope, region } = req.body;

  try {
    validatePolicyInput(req.body);

    const { data, error } = await supabase
      .from("policies")
      .insert([{ policyname: policyName, description, rules, scope, region }])
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

    //broadcastPolicyUpdate({ action: "create", policy: data[0] });

    res.status(201).json({
      message: "Policy created successfully",
      policy: data[0],
    });
  } catch (err) {
    logger.error("Unexpected error during policy creation:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updatePolicy = async (req, res) => {
  const { policyID } = req.params;
  const { policyName, description, rules, scope } = req.body;

  try {
    if (!policyID) {
      return res.status(400).json({ error: "PolicyID is required" });
    }

    validatePolicyInput({ policyName, description, rules, scope });

    // Retrieve the old data before updating
    const { data: oldData, error: oldDataError } = await supabase
      .from("policies")
      .select("policyname, description, rules, scope, region")
      .eq("policyid", policyID);

    if (oldDataError) {
      logger.error("Error fetching old policy data:", oldDataError.message);
      return res.status(400).json({ error: oldDataError.message });
    }

    if (!oldData || oldData.length === 0) {
      logger.error(`Policy with ID ${policyID} not found`);
      return res.status(404).json({ error: "Policy not found" });
    }

    // Update the policy in the database
    const updateData = { policyname: policyName, description, rules, scope };
    const { data: updatedData, error: updateError } = await supabase
      .from("policies")
      .update(updateData)
      .eq("policyid", policyID)
      .select();

    if (updateError) {
      if (updateError.code === "23505") {
        logger.warn(
          `Policy update failed: Policy name '${policyName}' already exists`
        );
        return res.status(409).json({ error: "Policy name already exists" });
      }

      logger.error("Error updating policy:", updateError.message);
      return res.status(400).json({ error: updateError.message });
    }

    if (!updatedData || updatedData.length === 0) {
      logger.error(`Policy with ID ${policyID} not found after update`);
      return res.status(404).json({ error: "Policy not found after update" });
    }

    // Log the policy update, including the old and updated data
    // broadcastPolicyUpdate({
    //   action: "update",
    //   oldPolicy: oldData[0],
    //   updatedPolicy: updatedData[0],
    // });

    res.status(200).json({
      message: "Policy updated successfully",
      policy: updatedData[0],
    });
  } catch (err) {
    logger.error("Unexpected error during policy update:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

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

    // Retrieve the old data before delete
    const { data: oldData, error: oldDataError } = await supabase
      .from("policies")
      .select("policyname, description, rules, scope, region")
      .eq("policyid", policyID);

    if (oldDataError) {
      logger.error("Error fetching old policy data:", oldDataError.message);
      return res.status(400).json({ error: oldDataError.message });
    }

    if (!oldData || oldData.length === 0) {
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

    // broadcastPolicyUpdate({ action: "delete", policy: oldData[0] });

    res.status(200).json({ message: "Policy deleted successfully" });
  } catch (err) {
    logger.error("Unexpected error during policy deletion:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.fetchAllPolicies = async (req, res) => {
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

exports.fetchSinglePolicy = async (req, res) => {
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

// ================== PROPAGATION MANAGEMENT ===================

exports.propagateGlobalPolicies = async (req, res) => {
  const { isFetchReq } = req.body;
  try {
    if (isFetchReq) {
      const globalPolicies = await propagationService.fetchGlobalPolicies();
      res.status(200).json({
        message: "Global policies fetched successfully",
        policies: globalPolicies,
      });
    } else {
      await propagationService.propagateGlobalPolicies();
      res
        .status(200)
        .json({ message: "Global policies propagated successfully" });
    }
  } catch (err) {
    logger.error("Error in propagateGlobalPolicies:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.fetchAndSaveGlobalPolicies = async (req, res) => {
  const { policies } = req.body;

  try {
    if (!policies || policies.length === 0) {
      logger.info("No policies provided in request. Fetching from HQ Node...");
      await propagationService.fetchAndSaveGlobalPolicies();
    } else {
      await propagationService.saveGlobalPolicies(policies);
    }

    res
      .status(200)
      .json({ message: "Global policies fetched and saved successfully" });
  } catch (err) {
    logger.error("Error in fetchAndSaveGlobalPolicies:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.propagateGlobalPolicyUpdate = async (req, res) => {
  const { oldPolicy, newPolicy } = req.body;

  try {
    // Validate input
    if (!oldPolicy || !newPolicy) {
      return res
        .status(400)
        .json({ error: "Both oldPolicy and newPolicy are required" });
    }

    // Search for the policy in the database using oldPolicy data
    const { data: existingPolicy, error: fetchError } = await supabase
      .from("policies")
      .select("*")
      .eq("policyname", oldPolicy.policyName)
      .eq("description", oldPolicy.description)
      .eq("rules", oldPolicy.rules)
      .eq("scope", oldPolicy.scope)
      .limit(1);

    if (fetchError) {
      logger.error("Error fetching policy:", fetchError.message);
      return res.status(400).json({ error: fetchError.message });
    }

    if (!existingPolicy || existingPolicy.length === 0) {
      logger.error("Policy not found in the database");
      return res.status(404).json({ error: "Policy not found" });
    }

    // Update the policy with newPolicy data
    const updateData = {
      policyname: newPolicy.policyName,
      description: newPolicy.description,
      rules: newPolicy.rules,
      scope: newPolicy.scope,
    };

    const { data: updatedPolicy, error: updateError } = await supabase
      .from("policies")
      .update(updateData)
      .eq("policyname", oldPolicy.policyName)
      .eq("description", oldPolicy.description)
      .eq("rules", oldPolicy.rules)
      .eq("scope", oldPolicy.scope)
      .select();

    if (updateError) {
      logger.error("Error updating policy:", updateError.message);
      return res.status(400).json({ error: updateError.message });
    }

    if (!updatedPolicy || updatedPolicy.length === 0) {
      logger.error("Policy not found after update");
      return res.status(404).json({ error: "Policy not found after update" });
    }

    // Return success response
    res.status(200).json({
      message: "Policy updated successfully",
      policy: updatedPolicy[0],
    });
  } catch (err) {
    logger.error(
      "Unexpected error during policy update propagation:",
      err.message
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.propagateGlobalPolicyDelete = async (req, res) => {
  const { oldPolicy } = req.body;

  try {
    if (!oldPolicy) {
      return res.status(400).json({ error: "oldPolicy is required" });
    }

    // Search for the policy in the database using oldPolicy data
    const { data: existingPolicy, error: fetchError } = await supabase
      .from("policies")
      .select("*")
      .eq("policyname", oldPolicy.policyName)
      .eq("description", oldPolicy.description)
      .eq("rules", oldPolicy.rules)
      .eq("scope", oldPolicy.scope);

    if (fetchError) {
      logger.error("Error fetching policy:", fetchError.message);
      return res.status(400).json({ error: fetchError.message });
    }

    if (!existingPolicy || existingPolicy.length === 0) {
      logger.error("Policy not found in the database");
      return res.status(404).json({ error: "Policy not found" });
    }

    // Delete the matching policy
    const { error: deleteError } = await supabase
      .from("policies")
      .delete()
      .eq("policyname", oldPolicy.policyName)
      .eq("description", oldPolicy.description)
      .eq("rules", oldPolicy.rules)
      .eq("scope", oldPolicy.scope);

    if (deleteError) {
      logger.error("Error deleting policy:", deleteError.message);
      return res.status(400).json({ error: deleteError.message });
    }

    // Log the policy deletion
    broadcastPolicyUpdate({
      action: "delete",
      oldPolicy,
    });

    // Return success response
    res.status(200).json({
      message: "Policy deleted successfully",
      policy: oldPolicy,
    });
  } catch (err) {
    logger.error(
      "Unexpected error during policy deletion propagation:",
      err.message
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==============================================================

exports.propagateRegionalPolicies = async (req, res) => {
  if (process.env.NODE_TYPE !== "regional") {
    return res.status(403).json({
      error:
        "Unauthorized node type. Only regional nodes are permitted to propagate regional policies.",
    });
  }
  const { propagationTarget } = req.targetNode;

  try {
    await propagationService.propagateRegionalPolicies(propagationTarget);
    res.status(200).json({ message: "Regional policies pushed successfully" });
  } catch (err) {
    logger.error("Error in pushRegionalPolicies:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.fetchAndSaveRegionalPolicies = async (req, res) => {
  const { policies } = req.body;

  try {
    if (policies && policies.length > 0) {
      await propagationService.saveRegionalPolicies(policies);
      res.status(200).json({ message: "Regional policies saved successfully" });
    } else {
      await propagationService.fetchRegionalPolicies();
      res
        .status(200)
        .json({ message: "Regional policies pulled successfully" });
    }
  } catch (err) {
    logger.error("Error in fetchAndSaveRegionalPolicies:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.propagateRegionalPolicyUpdate = async (req, res) => {
  const { oldPolicy, newPolicy } = req.body;

  try {
    if (!oldPolicy || !newPolicy) {
      return res
        .status(400)
        .json({ error: "Both oldPolicy and newPolicy are required" });
    }

    // Search for the policy in the database using oldPolicy data
    const { data: existingPolicy, error: fetchError } = await supabase
      .from("policies")
      .select("*")
      .eq("policyname", oldPolicy.policyName)
      .eq("description", oldPolicy.description)
      .eq("rules", oldPolicy.rules)
      .eq("scope", oldPolicy.scope);

    if (fetchError) {
      logger.error("Error fetching policy:", fetchError.message);
      return res.status(400).json({ error: fetchError.message });
    }

    if (!existingPolicy || existingPolicy.length === 0) {
      logger.error("Policy not found in the database");
      return res.status(404).json({ error: "Policy not found" });
    }

    // Update the policy with newPolicy data
    const updateData = {
      policyname: newPolicy.policyName,
      description: newPolicy.description,
      rules: newPolicy.rules,
      scope: newPolicy.scope,
    };

    const { data: updatedPolicy, error: updateError } = await supabase
      .from("policies")
      .update(updateData)
      .eq("policyname", oldPolicy.policyName)
      .eq("description", oldPolicy.description)
      .eq("rules", oldPolicy.rules)
      .eq("scope", oldPolicy.scope)
      .select();

    if (updateError) {
      logger.error("Error updating policy:", updateError.message);
      return res.status(400).json({ error: updateError.message });
    }

    if (!updatedPolicy || updatedPolicy.length === 0) {
      logger.error("Policy not found after update");
      return res.status(404).json({ error: "Policy not found after update" });
    }

    // Return success response
    res.status(200).json({
      message: "Policy updated successfully",
      policy: updatedPolicy[0],
    });
  } catch (err) {
    logger.error(
      "Unexpected error during policy update propagation:",
      err.message
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.propagateRegionalPolicyDelete = async (req, res) => {
  const { oldPolicy } = req.body;

  try {
    if (!oldPolicy) {
      return res.status(400).json({ error: "oldPolicy is required" });
    }

    // Search for the policy in the database using oldPolicy data
    const { data: existingPolicy, error: fetchError } = await supabase
      .from("policies")
      .select("*")
      .eq("policyname", oldPolicy.policyName)
      .eq("description", oldPolicy.description)
      .eq("rules", oldPolicy.rules)
      .eq("scope", oldPolicy.scope);

    if (fetchError) {
      logger.error("Error fetching policy:", fetchError.message);
      return res.status(400).json({ error: fetchError.message });
    }

    if (!existingPolicy || existingPolicy.length === 0) {
      logger.error("Policy not found in the database");
      return res.status(404).json({ error: "Policy not found" });
    }

    // Delete the matching policy
    const { error: deleteError } = await supabase
      .from("policies")
      .delete()
      .eq("policyname", oldPolicy.policyName)
      .eq("description", oldPolicy.description)
      .eq("rules", oldPolicy.rules)
      .eq("scope", oldPolicy.scope);

    if (deleteError) {
      logger.error("Error deleting policy:", deleteError.message);
      return res.status(400).json({ error: deleteError.message });
    }

    // Log the policy deletion
    broadcastPolicyUpdate({
      action: "delete",
      oldPolicy,
    });

    // Return success response
    res.status(200).json({
      message: "Policy deleted successfully",
      policy: oldPolicy,
    });
  } catch (err) {
    logger.error(
      "Unexpected error during policy deletion propagation:",
      err.message
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

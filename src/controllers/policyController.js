const supabase = require("../config/supabase");

/**
 * Validates policy input data
 * @param {Object} policyData - The policy data to validate
 * @throws {Error} if validation fails
 */
const validatePolicyInput = (policyData) => {
  const { policyName, description, rules } = policyData;

  if (!policyName || typeof policyName !== "string" || policyName.length < 3) {
    throw new Error("Policy name must be a string with at least 3 characters");
  }

  if (description && typeof description !== "string") {
    throw new Error("Description must be a string");
  }

  // if (!rules || typeof rules !== 'object' || Array.isArray(rules)) {
  //   throw new Error('Rules must be a valid JSON object');
  // }

  return true;
};

/**
 * Creates a new policy
 * @route POST /policies
 */
exports.createPolicy = async (req, res) => {
  const { policyName, description, rules } = req.body;

  try {
    // Validate input
    validatePolicyInput(req.body);

    const { data, error } = await supabase
      .from("policies")
      .insert([
        {
          policyname: policyName,
          description,
          rules,
        },
      ])
      .select();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          error: "Policy name already exists",
        });
      }

      console.error("Error creating policy:", error);
      return res.status(400).json({
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res
        .status(400)
        .json({ error: "No data returned after policy creation" });
    }

    res.status(201).json({
      message: "Policy created successfully",
      policy: data[0],
    });
  } catch (err) {
    if (
      err.message &&
      (err.message.includes("must be a string") ||
        err.message.includes("must be a valid JSON"))
    ) {
      return res.status(400).json({ error: err.message });
    }

    console.error("Unexpected error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Updates an existing policy
 * @route PUT /policies/:policyID
 */
exports.updatePolicy = async (req, res) => {
  const { policyID } = req.params;
  const { policyName, description, rules } = req.body;

  try {
    if (!policyID) {
      return res.status(400).json({ error: "PolicyID is required" });
    }

    // Validate input
    validatePolicyInput({ policyName, description, rules });

    const updateData = {
      policyname: policyName,
      description,
      rules,
    };

    const { data, error } = await supabase
      .from("policies")
      .update(updateData)
      .eq("policyid", policyID)
      .select();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ error: "Policy name already exists" });
      }

      console.error("Error updating policy:", error);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Policy not found" });
    }

    res.status(200).json({
      message: "Policy updated successfully",
      policy: data[0],
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Deletes a specific policy
 * @route DELETE /policies/:policyID
 */
exports.deletePolicy = async (req, res) => {
  const { policyID } = req.params;

  try {
    if (!policyID) {
      return res.status(400).json({ error: "PolicyID is required" });
    }

    // Check if policy exists before deletion
    const { data: existingPolicy } = await supabase
      .from("policies")
      .select("policyid")
      .eq("policyid", policyID)
      .single();

    if (!existingPolicy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    const { error } = await supabase
      .from("policies")
      .delete()
      .eq("policyid", policyID);

    if (error) {
      console.error("Error deleting policy:", error);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: "Policy deleted successfully" });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Lists all policies
 * @route GET /policies
 */
exports.listPolicies = async (req, res) => {
  try {
    const { data, error } = await supabase.from("policies").select("*");

    if (error) {
      console.error("Error fetching policies:", error);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      count: data.length,
      policies: data,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Retrieves a specific policy by ID
 * @route GET /policies/:policyID
 */
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
      console.error("Error fetching policy:", error);
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "Policy not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const supabase = require("../config/supabase");
const policyEngine = require("../services/policyEngine");

// Evaluate a policy against a user's request
exports.evaluatePolicy = async (req, res) => {
  const { userID, action, resource, context } = req.body;

  try {
    // Fetch the user's role and attributes from the database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, attributes")
      .eq("userid", userID)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError.message);
      return res.status(400).json({ error: userError.message });
    }

    // Fetch all policies applicable to the user's role
    const { data: policies, error: policyError } = await supabase
      .from("policies")
      .select("*");
    // .contains('rules', [{ role: userData.role }]);

    if (policyError) {
      console.error("Error fetching policies:", policyError.message);
      return res.status(400).json({ error: policyError.message });
    }

    const applicablePolicies = policies.filter((policy) =>
      policy.rules.some((rule) => rule.role === userData.role)
    );

    // Evaluate the policies using the policy engine
    const result = await policyEngine.evaluate(
      userData,
      action,
      resource,
      context,
      applicablePolicies
    );

    if (!result.access) {
      console.error("Policy denied:", result.reason);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Unexpected error during policy evaluation:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Check if a user has access to a specific resource
exports.checkAccess = async (req, res) => {
  const { userID, resource } = req.body;

  try {
    // Fetch the user's role and attributes from the database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, attributes")
      .eq("userid", userID)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError.message);
      return res.status(400).json({ error: userError.message });
    }

    // Fetch all policies applicable to the user's role
    const { data: policies, error: policyError } = await supabase
      .from("policies")
      .select("*");
    // .contains('rules', [{ role: userData.role }]);

    if (policyError) {
      console.error("Error fetching policies:", policyError.message);
      return res.status(400).json({ error: policyError.message });
    }

    const applicablePolicies = policies.filter((policy) =>
      policy.rules.some((rule) => rule.role === userData.role)
    );

    // Check access using the policy engine
    const result = await policyEngine.checkAccess(
      userData,
      resource,
      applicablePolicies
    );

    res.status(200).json(result);
  } catch (err) {
    console.error("Unexpected error during access check:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

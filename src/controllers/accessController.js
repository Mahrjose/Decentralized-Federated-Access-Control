const supabase = require("../config/supabase");
const policyEngine = require("../services/policyEngine");

async function fetchUserData(userID) {
  return await supabase
    .from("users")
    .select("role, attributes")
    .eq("userid", userID)
    .single();
}

async function fetchAndFilterPolicies(userRole) {
  const { data: policies, error } = await supabase.from("policies").select("*");

  if (error) {
    return { policies: null, error };
  }

  // Filter policies to only those applicable to the user's role
  const applicablePolicies = policies.filter((policy) =>
    policy.rules.some((rule) => rule.role === userRole)
  );

  return { policies: applicablePolicies, error: null };
}

exports.evaluatePolicy = async (req, res) => {
  const { userID, action, resource, context } = req.body;

  try {
    // Retrieve user data including role and attributes
    const { data: userData, error: userError } = await fetchUserData(userID);

    if (userError) {
      console.error("Error fetching user:", userError.message);
      return res.status(400).json({ error: userError.message });
    }

    // Get all relevant policies for the user's role
    const { policies, error: policyError } = await fetchAndFilterPolicies(
      userData.role
    );

    if (policyError) {
      console.error("Error fetching policies:", policyError.message);
      return res.status(400).json({ error: policyError.message });
    }

    // Evaluate policy compliance using the policy engine
    const result = await policyEngine.evaluate(
      userData,
      action,
      resource,
      context,
      policies
    );

    // Log denied access attempts for auditing
    if (!result.access) {
      console.error("Policy denied:", result.reason);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Unexpected error during policy evaluation:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.checkAccess = async (req, res) => {
  const { userID, resource } = req.body;

  try {
    // Retrieve user data including role and attributes
    const { data: userData, error: userError } = await fetchUserData(userID);

    if (userError) {
      console.error("Error fetching user:", userError.message);
      return res.status(400).json({ error: userError.message });
    }

    // Get all relevant policies for the user's role
    const { policies, error: policyError } = await fetchAndFilterPolicies(
      userData.role
    );

    if (policyError) {
      console.error("Error fetching policies:", policyError.message);
      return res.status(400).json({ error: policyError.message });
    }

    // Determine access using the policy engine
    const result = await policyEngine.checkAccess(userData, resource, policies);

    res.status(200).json(result);
  } catch (err) {
    console.error("Unexpected error during access check:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

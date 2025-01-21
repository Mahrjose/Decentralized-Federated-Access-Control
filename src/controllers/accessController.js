const supabase = require("../config/supabase");
const policyEngine = require("../services/policyEngine");
const logger = require("../config/logger");
const auditService = require("../services/auditService");

// Fetch user data from Supabase
async function fetchUserData(userID) {
  const { data, error } = await supabase
    .from("users")
    .select("role, attributes")
    .eq("userid", userID)
    .single();

  if (error) {
    logger.error(
      `Error fetching user data for userID ${userID}:`,
      error.message
    );
    throw new Error(`Failed to fetch user data: ${error.message}`);
  }

  return data;
}

// Fetch and filter policies based on user role
async function fetchAndFilterPolicies(userRole) {
  const { data: policies, error } = await supabase.from("policies").select("*");

  if (error) {
    logger.error(
      `Error fetching policies for role ${userRole}:`,
      error.message
    );
    throw new Error(`Failed to fetch policies: ${error.message}`);
  }

  // Filter policies applicable to the user's role
  const applicablePolicies = policies.filter((policy) =>
    policy.rules.some((rule) => rule.role === userRole)
  );

  return applicablePolicies;
}

// Evaluate policy compliance
exports.evaluatePolicy = async (req, res) => {
  const { userID, action, resource, context } = req.body;

  try {
    // Fetch user data
    const userData = await fetchUserData(userID);

    // Fetch applicable policies
    const policies = await fetchAndFilterPolicies(userData.role);

    // Evaluate policy
    const result = await policyEngine.evaluate(
      userData,
      action,
      resource,
      context,
      policies
    );

    // Log the access request and result
    await auditService.logAccessRequest(
      userID,
      action,
      resource,
      context,
      result
    );

    if (!result.access) {
      logger.warn(`Policy denied for user ${userID}: ${result.reason}`);
    }

    res.status(200).json(result);
  } catch (err) {
    logger.error(
      `Unexpected error during policy evaluation for user ${userID}:`,
      err.message
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

// Check access to a resource
exports.checkAccess = async (req, res) => {
  const { userID, resource } = req.body;

  try {
    // Fetch user data
    const userData = await fetchUserData(userID);

    // Fetch applicable policies
    const policies = await fetchAndFilterPolicies(userData.role);

    // Check access
    const result = await policyEngine.checkAccess(userData, resource, policies);

    // Log the access request and result
    await auditService.logAccessRequest(
      userID,
      "checkAccess",
      resource,
      {},
      result
    );

    res.status(200).json(result);
  } catch (err) {
    logger.error(
      `Unexpected error during access check for user ${userID}:`,
      err.message
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

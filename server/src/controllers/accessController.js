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

// Fetch policies based on user location and scope
async function fetchPoliciesByScope(userRole, location) {
  const { data: policies, error } = await supabase.from("policies").select("*");

  if (error) {
    logger.error(`Error fetching policies:`, error.message);
    throw new Error(`Failed to fetch policies: ${error.message}`);
  }

  // Filter policies based on scope, location, and user role
  const applicablePolicies = policies.filter((policy) => {
    // Check if the policy applies to the user's role
    const roleMatch = policy.rules.some((rule) => rule.role === userRole);

    // Check if the policy applies to the user's location and scope
    const scopeMatch =
      policy.scope === "global" ||
      (policy.scope === "regional" && policy.region === location.region) ||
      (policy.scope === "local" && policy.branch === location.branch);

    // Only include policies that match both role and scope
    return roleMatch && scopeMatch;
  });

  return applicablePolicies;
}

// Evaluate policy compliance
exports.evaluatePolicy = async (req, res) => {
  const { userID, action, resource, context } = req.body;

  try {
    // Fetch user data
    const userData = await fetchUserData(userID);

    // Fetch applicable policies based on scope and location
    const policies = await fetchPoliciesByScope(userData.role, context.location);

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
  const { userID, resource, context } = req.body;

  try {
    // Fetch user data
    const userData = await fetchUserData(userID);

    // Fetch applicable policies based on scope and location
    const policies = await fetchPoliciesByScope(userData.role, context.location);

    // Check access
    const result = await policyEngine.checkAccess(userData, resource, policies);

    // Log the access request and result
    await auditService.logAccessRequest(
      userID,
      "checkAccess",
      resource,
      context,
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
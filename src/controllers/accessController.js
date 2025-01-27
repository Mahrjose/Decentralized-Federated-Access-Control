const supabase = require("../config/supabase");
const policyEngine = require("../services/policyEngine");
const logger = require("../config/logger");
// const auditService = require("../services/auditService");

async function fetchUserData(userID) {
  const { data, error } = await supabase
    .from("users")
    .select("username, role")
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
      (policy.scope === "regional" && policy.country === location.country) ||
      (policy.scope === "local" && policy.city === location.city);

    // Only include policies that match both role and scope
    return roleMatch && scopeMatch;
  });

  return applicablePolicies;
}

exports.evaluatePolicy = async (req, res) => {
  const { action, resource } = req.body;
  const userID = req.session.userID;

  try {
    const userData = await fetchUserData(userID);
    const userContext = req.context; // Includes location Obj, lastlogin, deviceTrustLevel

    const policies = await fetchPoliciesByScope(
      userData.role,
      userContext.location
    );

    const result = await policyEngine.evaluate(
      action,
      resource,
      userContext,
      userData,
      policies
    );

    // await auditService.logAccessRequest(
    //   userID,
    //   action,
    //   resource,
    //   context,
    //   result
    // );
    res.status(200).json(result);
  } catch (err) {
    logger.error(
      `Error during policy evaluation for user ${userID}:`,
      err.message
    );
    res.status(500).json({ error: "Internal server error" });
  }
};

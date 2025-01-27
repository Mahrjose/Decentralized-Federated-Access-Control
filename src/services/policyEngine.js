const logger = require("../config/logger");

const checkConditions = (conditions, context) => {
  if (conditions.time) {
    const currentTime = new Date().getHours();
    if (
      currentTime < conditions.time.start ||
      currentTime > conditions.time.end
    ) {
      return false;
    }
  }

  if (conditions.location) {
    if (
      conditions.location.city !== context.location.city ||
      conditions.location.country !== context.location.country
    ) {
      return false;
    }
  }

  const trustLevels = {
    low: 1,
    medium: 2,
    high: 3,
  };

  if (conditions.deviceTrustLevel) {
    const conditionDeviceTrustLevel =
      trustLevels[conditions.deviceTrustLevel.toLowerCase()];
    const contextDeviceTrustLevel =
      trustLevels[context.deviceTrustLevel.toLowerCase()];

    if (contextDeviceTrustLevel < conditionDeviceTrustLevel) {
      return false;
    }
  }

  return true;
};

exports.evaluate = (action, resource, userContext, userData, policies) => {
  logger.info(
    `Evaluating policy for ${userData.username} Requesting ${action} for ${resource}`
  );

  // Sort policies by scope hierarchy: Local > Regional > Global
  const sortedPolicies = policies.sort((a, b) => {
    const scopeOrder = { local: 1, regional: 2, global: 3 }; // Ensure lowercase scope names
    return (
      scopeOrder[a.scope.toLowerCase()] - scopeOrder[b.scope.toLowerCase()]
    );
  });

  // Track the final decision
  let finalDecision = { access: false, reason: "No matching policy found" };

  for (const policy of sortedPolicies) {
    for (const rule of policy.rules) {
      if (
        rule.role === userData.role &&
        rule.action === action &&
        rule.resources.includes(resource) &&
        (!rule.conditions || checkConditions(rule.conditions, userContext))
      ) {
        logger.info(
          `Policy matched: ${policy.policyname} (Scope: ${
            policy.scope
          }), Rule: ${JSON.stringify(rule)}`
        );

        // Update the final decision based on the current policy
        finalDecision = {
          access: rule.effect === "allow",
          reason: `Policy matched: ${policy.policyname} (Scope: ${policy.scope})`,
        };

        // If a local policy denies access, stop further evaluation
        if (
          policy.scope.toLowerCase() === "local" &&
          rule.effect === "disallow"
        ) {
          return finalDecision;
        }
      }
    }
  }

  // Return the final decision after evaluating all policies
  return finalDecision;
};

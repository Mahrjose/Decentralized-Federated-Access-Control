const logger = require("../config/logger");

// Check if conditions are met
const checkConditions = (conditions, context) => {
  for (const key in conditions) {
    if (!(key in context)) {
      logger.debug(`Condition key '${key}' not found in context`);
      return false;
    }

    if (key === "time" && typeof conditions[key] === "object") {
      const { start, end } = conditions[key];
      const contextTime = context[key];

      if (!contextTime || contextTime.start < start || contextTime.end > end) {
        logger.debug(
          `Time condition failed: ${JSON.stringify(conditions[key])}`
        );
        return false;
      }
    } else if (
      typeof conditions[key] === "object" &&
      !Array.isArray(conditions[key])
    ) {
      if (!checkConditions(conditions[key], context[key])) {
        return false;
      }
    } else if (conditions[key] !== context[key]) {
      logger.debug(`Condition failed: ${key} = ${conditions[key]}`);
      return false;
    }
  }

  return true;
};

// Evaluate policy compliance with scope hierarchy
exports.evaluate = (userData, action, resource, context, policies) => {
  logger.info(
    `Evaluating policy for user ${userData.userid}, action ${action}, resource ${resource}`
  );

  // Sort policies by scope hierarchy: Local > Regional > Global
  const sortedPolicies = policies.sort((a, b) => {
    const scopeOrder = { local: 1, regional: 2, global: 3 }; // Ensure lowercase scope names
    return scopeOrder[a.scope.toLowerCase()] - scopeOrder[b.scope.toLowerCase()];
  });

  // Track the final decision
  let finalDecision = { access: false, reason: "No matching policy found" };

  for (const policy of sortedPolicies) {
    for (const rule of policy.rules) {
      if (
        rule.role === userData.role &&
        rule.action === action &&
        rule.resources.includes(resource) &&
        (!rule.conditions || checkConditions(rule.conditions, context))
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
        if (policy.scope.toLowerCase() === "local" && rule.effect === "disallow") {
          return finalDecision;
        }
      }
    }
  }

  // Return the final decision after evaluating all policies
  return finalDecision;
};

// Check access to a resource
exports.checkAccess = (userData, resource, policies) => {
  logger.info(
    `Checking access for user ${userData.userid}, resource ${resource}`
  );

  // Sort policies by scope hierarchy: Local > Regional > Global
  const sortedPolicies = policies.sort((a, b) => {
    const scopeOrder = { Local: 1, Regional: 2, Global: 3 };
    return scopeOrder[a.scope] - scopeOrder[b.scope];
  });

  for (const policy of sortedPolicies) {
    for (const rule of policy.rules) {
      if (
        rule.role === userData.role &&
        rule.resources.includes(resource) &&
        rule.effect === "allow"
      ) {
        logger.info(
          `Access granted by policy: ${policy.policyname} (Scope: ${
            policy.scope
          }), Rule: ${JSON.stringify(rule)}`
        );
        return {
          access: true,
          reason: `Access granted by policy: ${policy.policyname} (Scope: ${policy.scope})`,
        };
      }
    }
  }

  logger.warn(
    `No policy allows access for user ${userData.userid}, resource ${resource}`
  );
  return { access: false, reason: "No policy allows access" };
};

exports.evaluate = (userData, action, resource, context, policies) => {
  // Iterate through policies and evaluate rules
  for (const policy of policies) {
    for (const rule of policy.rules) {
      if (
        rule.role === userData.role &&
        rule.action === action &&
        rule.resource === resource &&
        (!rule.conditions || checkConditions(rule.conditions, context))
      ) {
        return { access: rule.effect === "allow", reason: "Policy matched" };
      }
    }
  }

  // Default deny if no policy matches
  return { access: false, reason: "No matching policy found" };
};

exports.checkAccess = (userData, resource, policies) => {
  // Iterate through policies and check if the user has access to the resource
  for (const policy of policies) {
    for (const rule of policy.rules) {
      if (
        rule.role === userData.role &&
        rule.resource === resource &&
        rule.effect === "allow"
      ) {
        return { access: true, reason: "Access granted by policy" };
      }
    }
  }

  // Default deny if no policy allows access
  return { access: false, reason: "No policy allows access" };
};

// Helper function to check conditions
const checkConditions = (conditions, context) => {
  for (const key in conditions) {
    if (conditions[key] !== context[key]) {
      return false;
    }
  }
  return true;
};

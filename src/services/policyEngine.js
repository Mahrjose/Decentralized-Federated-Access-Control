const checkConditions = (conditions, context) => {
  // Check if all keys in conditions exist in context
  for (const key in conditions) {
    if (!(key in context)) {
      return false;
    }

    if (key === "time" && typeof conditions[key] === "object") {
      const { start, end } = conditions[key];
      const contextTime = context[key];

      if (!contextTime || contextTime.start < start || contextTime.end > end) {
        return false;
      }
    }
    // If the value is an object, recursively check nested properties
    else if (
      typeof conditions[key] === "object" &&
      !Array.isArray(conditions[key])
    ) {
      if (!checkConditions(conditions[key], context[key])) {
        return false;
      }
    } else if (conditions[key] !== context[key]) {
      return false;
    }
  }

  return true;
};

exports.evaluate = (userData, action, resource, context, policies) => {
  // Iterate through policies and evaluate rules
  for (const policy of policies) {
    for (const rule of policy.rules) {
      if (
        rule.role === userData.role &&
        rule.action === action &&
        rule.resources.includes(resource) &&
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
        rule.resources.includes(resource) &&
        rule.effect === "allow"
      ) {
        return { access: true, reason: "Access granted by policy" };
      }
    }
  }

  // Default deny if no policy allows access
  return { access: false, reason: "No policy allows access" };
};

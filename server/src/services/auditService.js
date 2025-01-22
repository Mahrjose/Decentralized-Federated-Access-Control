const supabase = require("../config/supabase");
const logger = require("../config/logger");

// Log user actions (create, update, delete)
const logUserAction = async (action, user) => {
  const logEntry = {
    action,
    userID: user.userid,
    username: user.username,
    role: user.role,
    timestamp: new Date().toISOString(),
  };

  // Log to console
  logger.info(logEntry);

  // Save to database (e.g., user_audit_logs table)
  // const { error } = await supabase.from("user_audit_logs").insert([logEntry]);

  // if (error) {
  //   logger.error("Failed to log user action to database:", error.message);
  // }
};

// Log policy actions (create, update, delete)
const logPolicyAction = async (action, policy) => {
  const logEntry = {
    action,
    policyID: policy.policyid,
    policyName: policy.policyname,
    timestamp: new Date().toISOString(),
  };

  // Log to console
  logger.info(logEntry);

  // Save to database (e.g., policy_audit_logs table)
  // const { error } = await supabase.from("policy_audit_logs").insert([logEntry]);

  // if (error) {
  //   logger.error("Failed to log policy action to database:", error.message);
  // }
};

// Log access requests and outcomes
const logAccessRequest = async (userID, action, resource, context, result) => {
  const logEntry = {
    userID,
    action,
    resource,
    context,
    result,
    timestamp: new Date().toISOString(),
  };

  // Log to console
  logger.info(logEntry);

  // Save to database (e.g., access_audit_logs table)
  // const { error } = await supabase.from("access_audit_logs").insert([logEntry]);

  // if (error) {
  //   logger.error("Failed to log access request to database:", error.message);
  // }
};

module.exports = {
  logUserAction,
  logPolicyAction,
  logAccessRequest,
};

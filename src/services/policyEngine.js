const supabase = require('../config/supabase');

// Evaluate a policy
exports.evaluate = async (user, action, resource) => {
  // Fetch user role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('username', user)
    .single();

  if (userError || !userData) return { access: false, reason: 'User not found' };

  // Fetch matching policies
  const { data: policies, error: policyError } = await supabase
    .from('policies')
    .select('*');

  if (policyError) return { access: false, reason: 'Policy fetch error' };

  // Simulate policy evaluation
  const allowed = policies.some((policy) =>
    policy.rules.some((rule) =>
      rule.role === userData.role && rule.action === action && rule.resource === resource
    )
  );

  return allowed ? { access: true } : { access: false, reason: 'Policy denied' };
};

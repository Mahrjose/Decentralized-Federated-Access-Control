const supabase = require('../config/supabase');
const policyEngine = require('../services/policyEngine');

// Add a new policy
exports.addPolicy = async (req, res) => {
  const { name, rules } = req.body;

  try {
    const { data, error } = await supabase
      .from('policies')
      .insert([{ name, rules }])
      .select(); // Ensure the inserted data is returned

    if (error) {
      console.error('Error adding policy:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Policy created!', policy: data });
  } catch (err) {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Evaluate a policy
exports.evaluatePolicy = async (req, res) => {
  const { user, action, resource } = req.body;

  try {
    const result = await policyEngine.evaluate(user, action, resource);

    if (!result.access) {
      console.error('Policy denied:', result.reason);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error('Unexpected error during policy evaluation:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

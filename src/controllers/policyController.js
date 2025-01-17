const supabase = require('../config/supabase');

// Create a new policy
exports.createPolicy = async (req, res) => {
  const { policyName, description, rules } = req.body;

  try {
    const { data, error } = await supabase
      .from('policies')
      .insert([{ 
        policyname : policyName, 
        description, 
        rules 
      }])
      .select();

    if (error) {
      console.error('Error creating policy:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Policy created!', policy: data });

  } catch (err) {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Get policy details by ID
exports.getPolicy = async (req, res) => {
  const { policyID } = req.params;

  try {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('policyid', policyID)
      .single();

    if (error) {
      console.error('Error fetching policy:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Update policy details
exports.updatePolicy = async (req, res) => {
  const { policyID } = req.params;
  const { policyName, description, rules } = req.body;

  try {
    const { data, error } = await supabase
      .from('policies')
      .update({ policyname : policyName, description, rules })
      .eq('policyid', policyID)
      .select();

    if (error) {
      console.error('Error updating policy:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Policy updated!', policy: data });

  } catch (err) {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Delete a policy
exports.deletePolicy = async (req, res) => {
  const { policyID } = req.params;

  try {
    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('policyid', policyID);

    if (error) {
      console.error('Error deleting policy:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Policy deleted!' });

  } catch (err) {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// List all policies
exports.listPolicies = async (req, res) => {
  try {
    const { data, error } = await supabase.from('policies').select('*');

    if (error) {
      console.error('Error fetching policies:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
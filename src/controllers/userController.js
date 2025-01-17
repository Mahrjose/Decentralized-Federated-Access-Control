const supabase = require('../config/supabase');

// Create a new user
exports.createUser = async (req, res) => {
  const { username, role } = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, role }])
      .select();

    if (error) {
      console.error('Error creating user:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'User created!', user: data });
    
  } catch (err) {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*');

    if (error) {
      console.error('Error fetching users:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const supabase = require("../config/supabase");
const bcrypt = require("bcrypt");

// Input validation helper
const validateUserInput = (userData) => {
  const { username, password, role, attributes } = userData;

  if (!username || typeof username !== "string" || username.length < 3) {
    throw new Error("Username must be a string with at least 3 characters");
  }

  if (password && (typeof password !== "string" || password.length < 8)) {
    throw new Error("Password must be a string with at least 8 characters");
  }

  if (!role || !["admin", "user", "manager"].includes(role)) {
    throw new Error("Invalid role specified");
  }

  if (attributes && typeof attributes !== "object") {
    throw new Error("Attributes must be an object");
  }

  return true;
};

// Create a new user
exports.createUser = async (req, res) => {
  const { username, password, role, attributes } = req.body;

  try {
    // Validate input
    validateUserInput(req.body);

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          password: hashedPassword,
          role,
          attributes,
          status: "Active",
          lastlogin: null,
        },
      ])
      .select();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ error: "Username already exists" });
      }
      console.error("Error creating user:", error);
      return res.status(400).json({
        error: error.message,
        details: error.details,
        code: error.code,
      });
    }

    if (!data || data.length === 0) {
      return res
        .status(400)
        .json({ error: "No data returned after user creation" });
    }

    const userResponse = data[0];
    delete userResponse.password;

    res.status(201).json({ message: "User created!", user: userResponse });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      error: err.message || "Something went wrong",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// Get user details by ID
exports.getUser = async (req, res) => {
  const { userID } = req.params;

  try {
    if (!userID) {
      return res.status(400).json({ error: "UserID is required" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("userid, username, role, attributes, lastlogin, status")
      .eq("userid", userID)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return res.status(400).json({
        error: error.message,
        details: error.details,
        code: error.code,
      });
    }

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      error: err.message || "Something went wrong",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// Update user details
exports.updateUser = async (req, res) => {
  const { userID } = req.params;
  const { username, password, role, attributes } = req.body;

  try {
    if (!userID) {
      return res.status(400).json({ error: "UserID is required" });
    }

    // Validate input except password (which is optional for updates)
    validateUserInput({
      username,
      password: "dummypassword",
      role,
      attributes,
    });

    let updateData = { username, role, attributes };

    // Hash the password if it's being updated
    if (password) {
      if (typeof password !== "string" || password.length < 8) {
        return res
          .status(400)
          .json({ error: "Password must be at least 8 characters" });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("userid", userID)
      .select("userid, username, role, attributes, lastlogin, status");

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ error: "username already exists" });
      }
      console.error("Error updating user:", error);
      return res.status(400).json({
        error: error.message,
        details: error.details,
        code: error.code,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }

    res.status(200).json({ message: "user updated!", user: data[0] });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      error: err.message || "Something went wrong",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const { userID } = req.params;

  try {
    if (!userID) {
      return res.status(400).json({ error: "UserID is required" });
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("userid", userID);

    if (error) {
      console.error("Error deleting user:", error);
      return res.status(400).json({
        error: error.message,
        details: error.details,
        code: error.code,
      });
    }

    res.status(200).json({ message: "User deleted!" });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      error: err.message || "Something went wrong",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// List all users
exports.listUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("userid, username, role, attributes, lastlogin, status");

    if (error) {
      console.error("Error fetching users:", error);
      return res.status(400).json({
        error: error.message,
        details: error.details,
        code: error.code,
      });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({
      error: err.message || "Something went wrong",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

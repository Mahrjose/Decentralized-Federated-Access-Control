const supabase = require("../config/supabase");
const bcrypt = require("bcrypt");
const logger = require("../config/logger");
const auditService = require("../services/auditService");
const setToken = require("../config/jwt");

const validateUserInput = (userData, isUpdate = false) => {
  const {
    username,
    password,
    role,
    email,
    phoneNumber,
    roleAttributes,
    attributes,
  } = userData;

  // Validate username
  if (
    !isUpdate &&
    (!username || typeof username !== "string" || username.length < 3)
  ) {
    throw new Error("Username must be a string with at least 3 characters");
  }

  // Validate password
  if (
    !isUpdate &&
    (!password || typeof password !== "string" || password.length < 8)
  ) {
    throw new Error("Password must be a string with at least 8 characters");
  }

  // Validate role
  if (
    !isUpdate &&
    (!role || !["admin", "customer", "manager"].includes(role))
  ) {
    throw new Error("Invalid role specified");
  }

  // Validate email
  if (!isUpdate && (!email || !/\S+@\S+\.\S+/.test(email))) {
    throw new Error("Invalid email format");
  }

  // Validate phone number
  if (phoneNumber && !/^\+?\d{10,15}$/.test(phoneNumber)) {
    throw new Error("Invalid phone number format");
  }

  // Validate role attributes 
  if (roleAttributes && typeof roleAttributes !== "object") {
    throw new Error("Role attributes must be an object");
  }

  // Validate attributes 
  if (attributes && typeof attributes !== "object") {
    throw new Error("Attributes must be an object");
  }

  return true;
};

// Create a new user
exports.createUser = async (req, res) => {
  const {
    username,
    password,
    role,
    email,
    phoneNumber,
    roleAttributes,
    attributes,
  } = req.body;

  try {
    validateUserInput(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          password: hashedPassword,
          email,
          phonenumber: phoneNumber,
          role,
          roleattributes: roleAttributes,
          attributes,
          lastlogin: null,
          status: "Active",
          mfaenabled: false,
          accountlocked: false,
          lastpasswordchange: null,
          failedloginattempts: 0,
        },
      ])
      .select();

    if (error) {
      if (error.code === "23505") {
        logger.warn(`User creation failed: Username or email already exists`);
        return res
          .status(409)
          .json({ error: "Username or email already exists" });
      }

      logger.error("Error creating user:", error.message);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      logger.error("No data returned after user creation");
      return res
        .status(400)
        .json({ error: "No data returned after user creation" });
    }

    await auditService.logUserAction("create", data[0]);

    const userResponse = data[0];
    delete userResponse.password;

    //Setting JWT token to cookie
    setToken(userResponse, res);
    res.status(201).json({ message: "User created!", user: userResponse });
  } catch (err) {
    logger.error("Unexpected error during user creation:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  const { userID } = req.params;
  const {
    username,
    password,
    role,
    email,
    phoneNumber,
    roleAttributes,
    attributes,
    mfaEnabled,
    accountLocked,
    failedLoginAttempts,
  } = req.body;

  try {
    if (!userID) {
      return res.status(400).json({ error: "UserID is required" });
    }
    validateUserInput(req.body, true);

    // Prepare update data
    const updateData = {
      username,
      role,
      email,
      phonenumber: phoneNumber,
      roleattributes: roleAttributes,
      attributes,
      mfaenabled: mfaEnabled,
      accountlocked: accountLocked,
      failedloginattempts: failedLoginAttempts,
    };

    // Hash the password if it's being updated
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Remove undefined fields from updateData
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Update the user in the database
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("userid", userID)
      .select(
        "userid,username,email,role,attributes,mfaenabled,accountlocked,failedloginattempts"
      );

    if (error) {
      logger.error("Error updating user:", error.message);
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      logger.error(`User with ID ${userID} not found`);
      return res.status(404).json({ error: "User not found" });
    }

    // Log the user update
    await auditService.logUserAction("update", data[0]);

    res.status(200).json({ message: "User updated!", user: data[0] });
  } catch (err) {
    logger.error("Unexpected error during user update:", err.message);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const { userID } = req.params;

  try {
    if (!userID) {
      return res.status(400).json({ error: "UserID is required" });
    }

    // Check if the user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("userid")
      .eq("userid", userID)
      .single();

    if (!existingUser) {
      logger.error(`User with ID ${userID} not found`);
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("userid", userID);

    if (error) {
      logger.error("Error deleting user:", error.message);
      return res.status(400).json({ error: error.message });
    }

    // Log the user deletion
    await auditService.logUserAction("delete", existingUser);

    res.status(200).json({ message: "User deleted!" });
  } catch (err) {
    logger.error("Unexpected error during user deletion:", err.message);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

// List all users
exports.listUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        "userid,username,email,phonenumber,role,roleattributes,attributes,status,mfaenabled,accountlocked,lastlogin,lastpasswordchange,failedloginattempts,createddate"
      );

    if (error) {
      logger.error("Error fetching users:", error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    logger.error("Unexpected error during user listing:", err.message);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

// Get a specific user by ID
exports.getUser = async (req, res) => {
  const { userID } = req.params;

  try {
    if (!userID) {
      return res.status(400).json({ error: "UserID is required" });
    }

    const { data, error } = await supabase
      .from("users")
      .select(
        "userid,username,email,phonenumber,role,roleattributes,attributes,status,mfaenabled,accountlocked,lastlogin,lastpasswordchange,failedloginattempts,createddate"
      )
      .eq("userid", userID)
      .single();

    if (error) {
      logger.error("Error fetching user:", error.message);
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      logger.error(`User with ID ${userID} not found`);
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    logger.error("Unexpected error during user fetch:", err.message);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

//User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    setToken(user, res);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    logger.error("Error during login:", err.message);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

//User logout
exports.logout = async (req, res, next) => {
try{
  res.clearCookie('token');
  res.status(200).json({message: "Logged Out"});
} catch (err) {
  logger.error("Error during logout:", err.message);
  return res.status(500).json({ error: err.message || "Internal Server Error" });
}

};

exports.checkUser = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    logger.error("Error during user check:", err.message);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};
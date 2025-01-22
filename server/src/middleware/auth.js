const supabase = require("../config/supabase");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

exports.isAuthenticatedUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "Please log in to access this resource" });
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", decodedData.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role: ${req.user.role} is not allowed to access this resource`
      });
    }
    next();
  };
};

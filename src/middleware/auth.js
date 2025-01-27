const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const supabase = require("../config/supabase");

dotenv.config();

exports.isAuthenticatedUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    // logger.error("No token found in cookies");               // Uncommenting will cause error, don't know why :(
    return res
      .status(401)
      .json({ message: "Please log in to access this resource" });
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    // logger.info("Token verified successfully", decodedData); // Uncommenting will cause error, don't know why :(

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("userid", decodedData.id)
      .single();

    if (error || !data) {
      logger.error("User not found in Supabase", error);
      return res.status(404).json({ message: "User not found" });
    }

    req.user = data;
    next();
  } catch (err) {
    logger.error("Error in isAuthenticatedUser middleware:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role: ${req.user.role} is not allowed to access this resource`,
      });
    }
    next();
  };
};

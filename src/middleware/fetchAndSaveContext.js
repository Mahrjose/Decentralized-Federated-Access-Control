const logger = require("../config/logger");
const supabase = require("../config/supabase");
const { generateContext } = require("./extractContext");

const fetchAndSaveContext = async (req, res, next) => {
  if (req.headers["x-internal-propagation"] === "true") {
    logger.info("Internal propagation detected, skipping user context.");
    next();
  } else {
    try {
      const userID = req.session.userID;
      if (!userID) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const context = generateContext();

      const { error: updateError } = await supabase
        .from("users")
        .update({
          attributes: {
            location: context.location,
            deviceTrustLevel: context.deviceTrustLevel,
          },
          lastlogin: context.lastlogin,
        })
        .eq("userid", userID)
        .select();

      if (updateError) {
        logger.error("Error updating user attributes:", updateError.message);
        return res
          .status(500)
          .json({ message: "Failed to update user attributes" });
      }

      req.context = context;
      next();
    } catch (err) {
      logger.error("Error in fetchAndSaveContext middleware:", err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

module.exports = { fetchAndSaveContext };

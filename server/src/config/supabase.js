const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const logger = require("./logger"); // Import the logger

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Test connection
(async () => {
  try {
    const { error } = await supabase.from("users").select("*").limit(1);
    if (error) {
      logger.error("Unable to connect to Supabase:", error.message);
      throw new Error("Supabase connection failed");
    } else {
      logger.info("Successfully connected to Supabase!");
      // console.log("Successfully connected to Supabase!");
    }
  } catch (err) {
    logger.error("Supabase connection error:", err.message);
    process.exit(1);
  }
})();

module.exports = supabase;

const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const logger = require("./logger");

dotenv.config();

// SUPABASE_URL = process.env.HQ_SUPABASE_URL
// SUPABASE_KEY = process.env.HQ_SUPABASE_KEY

const NODE_ID = process.env.NODE_ID;

const SUPABASE_URL = process.env[`${NODE_ID}_SUPABASE_URL`];
const SUPABASE_KEY = process.env[`${NODE_ID}_SUPABASE_KEY`];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test connection
(async () => {
  try {
    const { error } = await supabase.from("users").select("*").limit(1);
    if (error) {
      logger.error("Unable to connect to Supabase:", error.message);
      throw new Error("Supabase connection failed");
    } else {
      logger.info(
        `Successfully connected to Supabase! [${NODE_ID} - URL=> ${SUPABASE_URL}]`
      );
    }
  } catch (err) {
    logger.error("Supabase connection error:", err.message);
    process.exit(1);
  }
})();

module.exports = supabase;

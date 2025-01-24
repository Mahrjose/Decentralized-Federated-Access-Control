const supabase = require("../config/supabase");
const logger = require("../config/logger");

// Propagate global policies to all nodes
exports.propagateGlobalPolicies = async () => {
  try {
    // Fetch all global policies
    const { data: globalPolicies, error } = await supabase
      .from("policies")
      .select("*")
      .eq("scope", "global");

    if (error) {
      logger.error("Error fetching global policies:", error.message);
      throw new Error("Failed to fetch global policies");
    }

    // For now, since we're using a single database, no propagation is needed.
    // In the future, this is where we'd push policies to regional and local nodes.
    logger.info(
      "Global policies fetched and ready for propagation:",
      globalPolicies
    );

    return globalPolicies;
  } catch (err) {
    logger.error(
      "Unexpected error during global policy propagation:",
      err.message
    );
    throw err;
  }
};

// Propagate regional policies to local nodes within the region
exports.propagateRegionalPolicies = async (region) => {
  try {
    // Fetch all regional policies for the specified region
    const { data: regionalPolicies, error } = await supabase
      .from("policies")
      .select("*")
      .eq("scope", "regional")
      .eq("region", region);

    if (error) {
      logger.error("Error fetching regional policies:", error.message);
      throw new Error("Failed to fetch regional policies");
    }

    // For now, since we're using a single database, no propagation is needed.
    // In the future, this is where we'd push policies to local nodes in the region.
    logger.info(
      `Regional policies for ${region} fetched and ready for propagation:`,
      regionalPolicies
    );

    return regionalPolicies;
  } catch (err) {
    logger.error(
      "Unexpected error during regional policy propagation:",
      err.message
    );
    throw err;
  }
};

// Propagate local policies (no propagation needed, as they are already local)
exports.propagateLocalPolicies = async (branch) => {
  try {
    // Fetch all local policies for the specified branch
    const { data: localPolicies, error } = await supabase
      .from("policies")
      .select("*")
      .eq("scope", "local")
      .eq("branch", branch);

    if (error) {
      logger.error("Error fetching local policies:", error.message);
      throw new Error("Failed to fetch local policies");
    }

    logger.info(`Local policies for ${branch} fetched:`, localPolicies);

    return localPolicies;
  } catch (err) {
    logger.error("Unexpected error during local policy fetch:", err.message);
    throw err;
  }
};

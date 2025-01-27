const WebSocket = require("ws");
const logger = require("../config/logger");
const propagationService = require("./propagationService");

const WS_PORT = process.env.WS_PORT || 8080;
const NODE_TYPE = process.env.NODE_TYPE;
const wss = new WebSocket.Server({ port: WS_PORT });

const nodeWsPorts = {
  HQ: 8080,
  REGIONAL_ASIA: 8081,
  //REGIONAL_EUROPE: 8082,
  LOCAL_ISTANBUL: 8083,
  LOCAL_DELHI: 8084,
  //LOCAL_BERLIN: 8085,
  //LOCAL_LONDON: 8086,
};

const connectToNode = (nodeId, wsPort, retries = 5, interval = 5000) => {
  const connect = () => {
    const ws = new WebSocket(`ws://0.0.0.0:${wsPort}`);

    ws.on("open", () => {
      //logger.info(`Connected to ${nodeId} WebSocket server`);
    });

    ws.on("message", (message) => {
      try {
        const policyUpdate = JSON.parse(message);
        handlePolicyUpdate(policyUpdate, nodeId);
      } catch (err) {
        logger.error(`Error parsing message from ${nodeId}:`, err.message);
      }
    });

    ws.on("close", () => {
      // logger.warn(`Disconnected from ${nodeId} WebSocket server`);
      if (retries > 0) {
        setTimeout(
          () => connectToNode(nodeId, wsPort, retries - 1, interval),
          interval
        );
      }
    });

    ws.on("error", (err) => {
      //logger.error(
      //  `Error connecting to ${nodeId} WebSocket server:`,
      //  err.message
      //);
      if (retries > 0) {
        setTimeout(
          () => connectToNode(nodeId, wsPort, retries - 1, interval),
          interval
        );
      }
    });
  };

  connect();
};

// Periodically attempt to connect to other nodes
const connectToOtherNodes = () => {
  for (const [nodeId, wsPort] of Object.entries(nodeWsPorts)) {
    if (nodeId !== process.env.NODE_ID) {
      connectToNode(nodeId, wsPort);
    }
  }
};
setInterval(connectToOtherNodes, 10000);

// Handle WebSocket connections
wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    try {
      const policyUpdate = JSON.parse(message);

      // Process policy updates
      await handlePolicyUpdate(policyUpdate);
    } catch (err) {
      logger.error("Error handling policy update:", err.message);
    }
  });
});

async function handlePolicyUpdate(policyUpdate, nodeId = null) {
  try {
    const { policy, action } = policyUpdate;

    // Skip local policies
    if (policy.scope === "local") {
      logger.info("Skipping propagation for local policy");
      return;
    }

    // Handle global policies
    if (policy.scope === "global" && NODE_TYPE === "global") {
      switch (action) {
        case "create":
          await propagationService.propagateGlobalPolicies();
          break;
        case "update":
          await propagationService.propagateGlobalPolicyUpdate(
            policyUpdate.oldPolicy,
            policyUpdate.newPolicy
          );
          break;
        case "delete":
          await propagationService.propagateGlobalPolicyDelete(
            policyUpdate.oldPolicy
          );
          break;
        default:
          logger.warn("Unknown global policy update action:", action);
      }
    }

    // Handle regional policies
    if (policy.scope === "regional" && NODE_TYPE === "regional") {
      switch (action) {
        case "create":
          await propagationService.propagateRegionalPolicies();
          break;
        case "update":
          await propagationService.propagateRegionalPolicyUpdate(
            policyUpdate.oldPolicy,
            policyUpdate.newPolicy
          );
          break;
        case "delete":
          await propagationService.propagateRegionalPolicyDelete(
            policyUpdate.oldPolicy
          );
          break;
        default:
          logger.warn("Unknown regional policy update action:", action);
      }
    }

    // Broadcast the update to WebSocket clients
    broadcastPolicyUpdate(policyUpdate);
  } catch (err) {
    logger.error(
      `Error processing policy update from ${nodeId || "client"}:`,
      err.message
    );
  }
}

// Broadcast policy updates to WebSocket clients
function broadcastPolicyUpdate(policyUpdate) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(policyUpdate));
    }
  });
}

module.exports = { broadcastPolicyUpdate, connectToOtherNodes };

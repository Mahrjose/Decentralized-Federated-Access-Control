const app = require("./src/app");
const dotenv = require("dotenv");
const logger = require("./src/config/logger");
// const { connectToOtherNodes } = require("./src/services/websocketService");

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running at http://0.0.0.0:${PORT}`);
  //connectToOtherNodes();
});

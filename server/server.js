const app = require("./src/app");
const dotenv = require("dotenv");
const logger = require("./src/config/logger");
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});

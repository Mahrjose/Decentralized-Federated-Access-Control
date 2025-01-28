const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
// const cors = require("cors");

const logger = require("./config/logger");
const userRoutes = require("./routes/userRoutes");
const policyRoutes = require("./routes/policyRoutes");
const accessRoutes = require("./routes/accessRoutes");
const modelRoutes = require("./routes/modelRoutes");
// const { updateContext } = require("./controllers/contextController");

const app = express();
app.use(bodyParser.json());

// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true,
// }));

// Log incoming requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use(cookieParser());

app.use(
  session({
    secret: `${process.env.SECRET}`,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/model", modelRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unexpected error: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const errorMiddleware = require("./middleware/error");

const user = require("./routes/userRoute");

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config();
}

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/user", user);

app.use(errorMiddleware);

module.exports = app;
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const error = require("../middleware/error");

const users = require("../routes/users");
const auth = require("../routes/auth");
const wago = require("../routes/wago");
const aws = require("../routes/aws");
const synchronisations = require("../routes/synchronisations");

module.exports = function(app) {
  app.use(express.json());
  app.use(helmet());
  app.use(morgan("dev"));

  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/wago", wago);
  app.use("/api/aws", aws);
  app.use("/api/synchronisations", synchronisations);

  app.use(error);
};

const express = require("express");
require("express-async-errors"); // to handle async errors/exceptions
const config = require("config");
const debugStartup = require("debug")("app:startup"); // export DEBUG=app:*

const app = express();

require("./startup/config")();
require("./startup/routes")(app);
require("./startup/adminAccount");

debugStartup("Application Name: " + config.get("name"));
debugStartup("Environment: " + config.get("environment"));

const server = app.listen(config.get("server.port"), function() {
	debugStartup(`Server runs: http://localhost:${config.get("server.port")}`);
});

module.exports = server;

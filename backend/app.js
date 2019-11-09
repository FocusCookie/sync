const express = require("express");
const config = require("config");
const debugStartup = require("debug")("app:startup"); // export DEBUG=app:*

const app = express();

require("./startup/routes")(app);

debugStartup("Application Name: " + config.get("name"));
debugStartup("Environment: " + config.get("environment"));

const server = app.listen(config.get("server.port"), function() {
	debugStartup(`Server runs: http://localhost:${config.get("server.port")}`);
});

module.exports = server;

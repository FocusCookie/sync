const express = require("express");
const config = require("config");

const app = express();

const server = app.listen(config.get("server.port"), function() {
	console.log(`Server runs: http://localhost:${config.get("server.port")}`);
});

module.exports = server;

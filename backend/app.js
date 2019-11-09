const express = require("express");
const config = require("config");

const app = express();

require("./startup/middleware")(app);

app.get("/", (req, res) => {
	res.send("hello");
});

const server = app.listen(config.get("server.port"), function() {
	console.log(`Server runs: http://localhost:${config.get("server.port")}`);
});

module.exports = server;

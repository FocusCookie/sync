const express = require("express");
require("express-async-errors"); // to handle async errors/exceptions
const https = require("https");
const fs = require("fs");
const config = require("config");
const debugStartup = require("debug")("app:startup"); // export DEBUG=app:*

const app = express();

app.get("/", (req, res) => {
  res.send("hello world with HTTPS! <3");
});

require("./startup/config")();
require("./startup/routes")(app);
require("./startup/adminAccount")();

debugStartup("Application Name: " + config.get("name"));
debugStartup("Environment: " + config.get("environment"));

const server = https
  .createServer(
    {
      key: fs.readFileSync("./openssl/key.pem"),
      cert: fs.readFileSync("./openssl/cert.pem"),
      passphrase: config.get("openSslPassphrase")
    },
    app
  )
  .listen(config.get("server.port"), () => {
    debugStartup(`Server runs: http://localhost:${config.get("server.port")}`);
  });

module.exports = server;

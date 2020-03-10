const express = require("express");
require("express-async-errors"); // to handle async errors/exceptions
const https = require("https");
const fs = require("fs");
const config = require("config");
const debugStartup = require("debug")("app:startup"); // export DEBUG=app:*

var cors = require("cors"); // to make request when the frontend is loaded by a different url localhost:3000 frontend backend :8080
// TODO: kill cors when frontend is provided by the same url

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("hello world with HTTPS! <3");
});

require("./startup/config")();
require("./startup/routes")(app);
require("./startup/adminAccount")();
require("./startup/synchronisations")();
require("./startup/certs")();

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

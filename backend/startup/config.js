const config = require("config");

module.exports = function() {
  if (!config.get("jwtPrivateKey")) {
    throw new Error(
      "jwtPrivateKey is not defined! Please setup the ENV variable first."
    );
  }
  if (!config.get("openSslPassphrase")) {
    throw new Error(
      "open SSL pasphrase is not defined! Please setup the ENV variable first."
    );
  }
};

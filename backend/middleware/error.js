const debug = require("debug")("app:errorMiddleware");

module.exports = function(err, req, res, next) {
  if (!err) {
    next();
  } else {
    debug(err);
    res.status(500).send("Something broke!");
  }
};

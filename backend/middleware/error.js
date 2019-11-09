const debug = require("debug")("app:errorMiddleware");

module.exports = function(err, req, res, next) {
	debug(err);
	res.status(500).send("Something broke!");
};

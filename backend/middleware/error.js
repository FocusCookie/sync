const debugErrorMW = require("debug")("app:debug");

module.exports = function(err, req, res, next) {
	debugErrorMW(err);
	res.status(500).send("Something broke!");
};

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

module.exports = function(app) {
	app.use(express.json());
	app.use(helmet());
	app.use(morgan("dev"));
};

const express = require("express");
const helmet = require("helmet");

module.exports = function(app) {
	app.use(express.json());
	app.use(helmet());
};

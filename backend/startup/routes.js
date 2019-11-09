const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const error = require("../middleware/error");

module.exports = function(app) {
	app.use(express.json());
	app.use(helmet());
	app.use(morgan("dev"));

	app.get("/", (req, res) => {
		res.send("hello");
	});
	app.get("/error", (err, req, res) => {
		throw new Error("KAPUTT");
	});

	app.use(error);
};

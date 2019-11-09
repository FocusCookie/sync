const express = require("express");
const router = express.Router();
const debug = require("debug");
const config = require("config");
const autchController = require("../controller/auth");
require("../startup/database")();

router.post("/", (req, res) => {
	autchController
		.login(req.body)
		.then(validLogin => {
			res.send(validLogin);
		})
		.catch(err => res.status(400).send(err));
});

module.exports = router;
